import { supabase } from '../src/supabaseClient';
import emailjs from '@emailjs/browser';

// Configuration for Admin Alerts
const ADMIN_EMAIL = 'adiroyboy2@gmail.com'; 

// TELEGRAM CONFIGURATION
const TELEGRAM_BOT_TOKEN = '7705800565:AAG036O-CLRKD44PXMbcqE2HCkNxcK8M-sQ';
// TODO: Replace with your Chat ID (See instructions below)
const TELEGRAM_CHAT_ID = '5576106715'; 

export const sendAdminAlert = async (type: 'order' | 'stock' | 'message', title: string, message: string, relatedId?: string) => {
  try {
    // 1. Insert into Supabase Notifications
    const { error } = await supabase
      .from('notifications')
      .insert([
        {
          type,
          title,
          message,
          related_id: relatedId,
          is_read: false
        }
      ]);

    if (error) console.error('Error creating notification:', error);

    // 2. Send Telegram Alert (Priority)
    const emojis = {
      order: '📦',
      stock: '⚠️',
      message: '💬'
    };
    
    const emoji = emojis[type] || '🔔';
    const timestamp = new Date().toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true, month: 'short', day: 'numeric' });
    
    // Escape HTML special characters in message to prevent parsing errors
    const safeMessage = message.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    
    const formattedMessage = `
<b>${emoji} ${title.toUpperCase()}</b>
—————————————————
${safeMessage}

<i>📅 ${timestamp}</i>
`.trim();

    const keyboard = {
      inline_keyboard: [
        [
          { text: "👀 View Dashboard", url: window.location.origin.includes('localhost') ? 'https://google.com' : window.location.origin }
        ]
      ]
    };

    // Send Telegram immediately and don't let it block
    await sendTelegramMessage(formattedMessage, keyboard);

    // 3. Send Email Alert (using EmailJS)
    try {
      await emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        'template_xkb8abl', // Admin Alert Template
        {
          to_email: ADMIN_EMAIL,
          subject: `[Admin Alert] ${title}`,
          message: message,
          type: type,
          timestamp: new Date().toLocaleString()
        },
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY
      );
    } catch (emailError) {
      console.error('Error sending admin email:', emailError);
    }

  } catch (err) {
    console.error('Error in sendAdminAlert:', err);
  }
};

const sendTelegramMessage = async (text: string, replyMarkup?: any) => {
  if (!TELEGRAM_CHAT_ID) {
    console.warn('Telegram Chat ID not set. Skipping alert.');
    return;
  }

  try {
    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: text,
        parse_mode: 'HTML',
        reply_markup: replyMarkup
      }),
    });

    const data = await response.json();
    if (!data.ok) {
      throw new Error(data.description || 'Failed to send Telegram message');
    }
    console.log('Telegram alert sent successfully');
  } catch (error) {
    console.error('Failed to send Telegram alert:', error);
  }
};
