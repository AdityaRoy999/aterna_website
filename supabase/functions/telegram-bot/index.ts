import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY')
const TELEGRAM_BOT_TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN')
const SUPABASE_URL = Deno.env.get('DB_URL') ?? Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('DB_SERVICE_KEY') ?? Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!)

serve(async (req) => {
  try {
    if (req.method === 'GET') return new Response('Telegram Bot Active')

    const update = await req.json()
    console.log("Update:", JSON.stringify(update))

    // Handle Callback Queries (Button Clicks)
    if (update.callback_query) {
      await handleCallbackQuery(update.callback_query)
      return new Response('OK')
    }

    if (!update.message || !update.message.text) return new Response('OK')

    const chatId = update.message.chat.id
    const text = update.message.text.trim()
    const firstName = update.message.from.first_name

    // 1. Check Authentication
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('telegram_chat_id', chatId)
      .single()

    // 2. Guest Flow (Not Authenticated)
    if (!profile) {
      // Check if text is a 6-digit code
      if (/^\d{6}$/.test(text)) {
        const { data: match, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('telegram_secret_code', text)
          .single()

        if (match) {
          // Link Account
          await supabase
            .from('profiles')
            .update({ telegram_chat_id: chatId })
            .eq('id', match.id)

          await sendTelegramMessage(chatId, `
<b>✅ Account Connected Successfully!</b>

Welcome back, ${match.full_name || firstName}!
You now have full access to your AETERNA account via Telegram.

<b>What would you like to do?</b>
          `, getMainKeyboard())
        } else {
          await sendTelegramMessage(chatId, "❌ Invalid Code. Please check the code in your website profile and try again.")
        }
      } else {
        await sendTelegramMessage(chatId, `
<b>🔒 Authentication Required</b>

Welcome to AETERNA Bot! To access your account, please enter your <b>6-digit Secret Telegram Code</b>.

You can find this code in your <b>Account Profile</b> on our website.
        `)
      }
      return new Response('OK')
    }

    // 3. Authenticated Flow
    if (text === '/start') {
      await sendTelegramMessage(chatId, `
<b>✨ Welcome back, ${profile.full_name || firstName}!</b>

I am your personal shopping assistant.
      `, getMainKeyboard())
    } else {
      // Gemini Chat with Context
      await sendChatAction(chatId, 'typing')
      const aiResponse = await generateGeminiResponse(text, profile)
      await sendTelegramMessage(chatId, aiResponse)
    }

    return new Response('OK')

  } catch (error) {
    console.error(error)
    return new Response('Error', { status: 500 })
  }
})

// --- Handlers ---

async function handleCallbackQuery(query: any) {
  const chatId = query.message.chat.id
  const data = query.data
  const messageId = query.message.message_id

  // Get Profile for context
  const { data: profile } = await supabase.from('profiles').select('*').eq('telegram_chat_id', chatId).single()
  if (!profile) return // Should not happen

  if (data === 'view_orders') {
    const { data: orders } = await supabase.from('orders').select('*').eq('user_id', profile.id).order('created_at', { ascending: false }).limit(5)
    
    if (!orders || orders.length === 0) {
      await sendTelegramMessage(chatId, "You have no recent orders.")
    } else {
      let msg = "<b>📦 Recent Orders:</b>\n\n"
      orders.forEach((o: any) => {
        msg += `• <b>#${o.id.slice(0,8)}</b> - $${o.total_amount} (${o.status})\n`
      })
      await sendTelegramMessage(chatId, msg)
    }
  } 
  
  else if (data === 'view_cart') {
    console.log(`Fetching cart for user ${profile.id}`)
    
    const { data: cart, error } = await supabase
      .from('cart_items')
      .select('*, products(*)')
      .eq('user_id', profile.id)
    
    if (error) {
      console.error("Cart Fetch Error:", error)
      await sendTelegramMessage(chatId, `⚠️ Error fetching cart: ${error.message}`)
      return
    }

    console.log("Cart Data:", JSON.stringify(cart))
    
    if (!cart || cart.length === 0) {
      await sendTelegramMessage(chatId, "🛒 Your cart is empty.")
    } else {
      let msg = "<b>🛒 Your Cart:</b>\n\n"
      let total = 0
      cart.forEach((item: any) => {
        // Handle case where product might be null (if FK exists but product deleted, or join failed silently)
        const productName = item.products?.name || "Unknown Item"
        const price = item.products?.price || 0
        const variant = item.variant_name ? ` (${item.variant_name})` : ""
        
        total += price * item.quantity
        msg += `• ${item.quantity}x <b>${productName}${variant}</b> - $${price * item.quantity}\n`
      })
      msg += `\n<b>Total: $${total}</b>`
      await sendTelegramMessage(chatId, msg, [[{ text: "Checkout on Website", url: "https://aeterna.store/cart" }]])
    }
  }

  else if (data.startsWith('explore')) {
    const parts = data.split(':')
    const index = parts.length > 1 ? parseInt(parts[1]) : 0
    
    console.log(`Fetching products for explore (Index: ${index})...`)
    const { data: products, error } = await supabase.from('products').select('*').order('name')
    
    if (error) {
        console.error("Product Fetch Error:", error)
        await sendTelegramMessage(chatId, "⚠️ Error fetching products.")
        return
    }

    if (products && products.length > 0) {
      // Circular navigation
      const safeIndex = (index + products.length) % products.length
      const p = products[safeIndex]

      // Handle relative image URLs
      let imageUrl = p.image_url
      if (imageUrl && imageUrl.startsWith('/')) {
        // Try to use the real domain if possible, otherwise placeholder
        // Assuming images are hosted at https://aeterna.store
        imageUrl = `https://aeterna.store${imageUrl}`
      } else if (!imageUrl || !imageUrl.startsWith('http')) {
           imageUrl = "https://placehold.co/600x400?text=No+Image"
      }

      const caption = `
<b>${p.name}</b>
${p.description ? p.description.slice(0, 100) + '...' : ''}

Price: <b>$${p.price}</b>
      `

      const navigationButtons = [
        { text: "⬅️ Prev", callback_data: `explore:${safeIndex - 1}` },
        { text: ` ${safeIndex + 1} / ${products.length} `, callback_data: "noop" },
        { text: "Next ➡️", callback_data: `explore:${safeIndex + 1}` }
      ]

      const keyboard = [
        [{ text: "➕ Add to Cart", callback_data: `add_cart:${p.id}` }],
        navigationButtons,
        [{ text: "🔙 Back to Menu", callback_data: "start" }] // Optional back button
      ]

      // If it's a new request (explore) send a new photo
      // If it's navigation (explore:1), edit the existing media
      if (data === 'explore') {
         await sendTelegramPhoto(chatId, imageUrl, caption, keyboard)
      } else {
         // For navigation, we delete the old one and send new (simpler than editMedia for now)
         // Or better: use editMessageMedia if possible, but sendPhoto is safer for compatibility
         // To make it "menu like", we usually edit. Let's try to just send a new one for now to avoid complexity with file_ids
         // Actually, deleting the previous message gives a cleaner "app-like" feel
         await deleteMessage(chatId, messageId)
         await sendTelegramPhoto(chatId, imageUrl, caption, keyboard)
      }

    } else {
        await sendTelegramMessage(chatId, "No products found.")
    }
  }

  else if (data.startsWith('add_cart:')) {
    const productId = data.split(':')[1]
    
    // 1. Fetch Product to get default variant
    const { data: product } = await supabase.from('products').select('*').eq('id', productId).single()
    
    let variantName = 'Standard'
    if (product) {
        // Try to parse variants JSON
        try {
            const variants = typeof product.variants === 'string' ? JSON.parse(product.variants) : product.variants
            if (Array.isArray(variants) && variants.length > 0) {
                variantName = variants[0].name // Use first variant as default
            }
        } catch (e) {
            // If parsing fails, check if there's a simple color field
            if (product.color) variantName = product.color
        }
    }

    // 2. Add to cart with variant
    const { error } = await supabase.from('cart_items').upsert({
      user_id: profile.id,
      product_id: productId,
      quantity: 1,
      variant_name: variantName
    }, { onConflict: 'user_id, product_id, variant_name' })

    if (error) {
        console.error("Add to Cart Error:", error)
        await answerCallbackQuery(query.id, "❌ Error adding to cart")
    } else {
        await answerCallbackQuery(query.id, `✅ Added ${product?.name || 'Item'} (${variantName})`)
    }
  }

  else if (data === 'sign_out') {
    await supabase
      .from('profiles')
      .update({ telegram_chat_id: null })
      .eq('id', profile.id)

    await sendTelegramMessage(chatId, `
<b>👋 Signed Out Successfully</b>

You have been disconnected from your AETERNA account.
To sign in again, please verify your 6-digit code.
    `)
  }

  // Acknowledge callback
  await answerCallbackQuery(query.id)
}




// --- Helpers ---

function getMainKeyboard() {
  return [
    [{ text: "📦 My Orders", callback_data: "view_orders" }, { text: "🛒 My Cart", callback_data: "view_cart" }],
    [{ text: "🔍 Explore Products", callback_data: "explore" }],
    [{ text: "🌐 Visit Website", url: "https://aeterna.store" }],
    [{ text: "❌ Sign Out", callback_data: "sign_out" }]
  ]
}

async function sendTelegramMessage(chatId: number, text: string, inlineKeyboard: any[] = []) {
  const body: any = { chat_id: chatId, text, parse_mode: 'HTML' }
  if (inlineKeyboard.length > 0) body.reply_markup = { inline_keyboard: inlineKeyboard }
  
  await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })
}

async function sendTelegramPhoto(chatId: number, photo: string, caption: string, inlineKeyboard: any[] = []) {
  const body: any = { chat_id: chatId, photo, caption, parse_mode: 'HTML' }
  if (inlineKeyboard.length > 0) body.reply_markup = { inline_keyboard: inlineKeyboard }
  
  await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })
}

async function deleteMessage(chatId: number, messageId: number) {
  await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/deleteMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, message_id: messageId })
  })
}

async function answerCallbackQuery(callbackQueryId: string, text?: string) {
  const body: any = { callback_query_id: callbackQueryId }
  if (text) body.text = text
  
  await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/answerCallbackQuery`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })
}

async function sendChatAction(chatId: number, action: string) {
  await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendChatAction`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, action })
  })
}

async function generateGeminiResponse(prompt: string, profile: any) {
  if (!GEMINI_API_KEY) return "⚠️ Gemini API Key is missing."

  const context = `
    User: ${profile.full_name}
    Email: ${profile.email}
    Address: ${profile.city}, ${profile.country}
  `

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `You are the AI assistant for AETERNA.
            Context about user: ${context}
            
            Be helpful, professional, and concise.
            User asks: ${prompt}`
          }]
        }]
      })
    }
  )

  const data = await response.json()
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "I'm sorry, I couldn't process that."
}