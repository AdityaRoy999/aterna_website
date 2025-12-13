import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Sparkles, CreditCard, CheckCircle, ShoppingBag, Trash2 } from 'lucide-react';
import { GoogleGenAI, Chat } from "@google/genai";
import emailjs from '@emailjs/browser';
import Lenis from 'lenis';
import { shopProducts } from './productData';
import { useBookmarks } from '../context/BookmarkContext';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../src/supabaseClient';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  type?: 'text' | 'payment_request' | 'payment_success' | 'product_display' | 'auth_request';
  paymentDetails?: {
    product: string;
    price: number;
    currency: string;
    imageUrl?: string;
    customerDetails: {
      firstName: string;
      lastName: string;
      email: string;
      address: string;
      city: string;
      zip: string;
      country: string;
    };
  };
  productDisplay?: {
    name: string;
    imageUrl: string;
    price: number;
    variant?: string;
  };
}

const productCatalog = shopProducts.map(p => {
  const variants = p.variants?.map(v => `${v.name}`).join(', ');
  return `- ${p.name}: $${p.price.toLocaleString()} (${p.category}) [Variants: ${variants}]`;
}).join('\n');

const SYSTEM_INSTRUCTION = `You are the AETERNA Concierge, an expert advisor for a high-end luxury lifestyle brand. Your tone is sophisticated, concise, and effortless.

Core Guidelines:
Tone: Use elegant, editorial language. Avoid corporate jargon. Never use emojis.
Brevity: Keep initial responses under 2 sentences unless asked for details.
Role: You are a curator, not a salesperson.

PRODUCT CATALOG:
${productCatalog}

CAPABILITIES:
1. DISPLAY PRODUCTS: If a user mentions a specific product or asks to see it, you MUST display it using the JSON action below.
2. CHECK BOOKMARKS: You have access to the user's bookmarked items in the context. If asked, list them.
3. TAKE ORDERS: You can process orders directly.

ORDERING PROTOCOL:
To place an order, the user MUST be signed in.
If the user is NOT signed in (check context), politely ask them to sign in first. Do NOT collect details or process orders for guests.

If the user IS signed in, check the "User Profile" provided in the context.
1. If the profile contains a full address (Name, Address, City, Zip, Country), ASK the user if they want to use their saved shipping details.
   - If YES: Use those details immediately.
   - If NO: Ask for new details.
2. If the profile is incomplete or missing, ask ONLY for the missing fields.

Once ALL fields are collected (either from profile or user input) and the user confirms the total price, output the "request_payment" JSON.

JSON ACTIONS:
Output ONLY the JSON block when performing these actions.

1. To Display a Product:
{"action": "show_product", "productName": "Exact Product Name", "variant": "Optional Variant Name"}

2. To Request Payment (Only after collecting ALL details):
{"action": "request_payment", "product": "Product Name", "variant": "Optional Variant Name", "price": 1234, "currency": "USD", "customerDetails": {"firstName": "...", "lastName": "...", "email": "...", "address": "...", "city": "...", "zip": "...", "country": "..."}}
`;

// Helper function to parse bold text and lists
const formatMessage = (text: string, sender: 'user' | 'ai') => {
  return text.split('\n').map((line, i) => {
    const isListItem = line.trim().startsWith('* ') || line.trim().startsWith('- ');
    const cleanLine = isListItem ? line.trim().substring(1).trim() : line;
    
    const parts = cleanLine.split(/(\*\*.*?\*\*)/g);
    const children = parts.map((part, j) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong 
            key={j} 
            className={`font-bold ${sender === 'ai' ? 'text-[#E8CFA0]' : 'text-inherit'}`}
          >
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });

    if (isListItem) {
      return (
        <div key={i} className="flex gap-2 ml-1">
          <span className={`${sender === 'ai' ? 'text-[#E8CFA0]' : 'text-inherit'} mt-0.5`}>•</span>
          <span>{children}</span>
        </div>
      );
    }

    return <div key={i} className={`${line.trim() === '' ? 'h-2' : ''}`}>{children}</div>;
  });
};

export const Chatbot: React.FC<{ onOpenAuth: () => void }> = ({ onOpenAuth }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', text: "Welcome to AETERNA. I am your personal concierge. How may I assist you with your collection today?", sender: 'ai' }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const lenisRef = useRef<Lenis | null>(null);
  const chatSessionRef = useRef<Chat | null>(null);
  const { bookmarkedIds } = useBookmarks();
  const { user } = useAuth();
  const [userProfile, setUserProfile] = useState<any>(null);

  // Initialize Lenis for Chatbot
  useEffect(() => {
    if (isOpen && chatContainerRef.current) {
      const lenis = new Lenis({
        wrapper: chatContainerRef.current,
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        gestureDirection: 'vertical',
        smooth: true,
        mouseMultiplier: 1,
        smoothTouch: false,
        touchMultiplier: 2,
      });

      lenisRef.current = lenis;

      function raf(time: number) {
        lenis.raf(time);
        requestAnimationFrame(raf);
      }

      requestAnimationFrame(raf);

      return () => {
        lenis.destroy();
        lenisRef.current = null;
      };
    }
  }, [isOpen]);

  // Fetch user profile when user logs in
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) {
        setUserProfile(null);
        return;
      }
      try {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        if (data) setUserProfile(data);
      } catch (error) {
        console.error("Error fetching profile for chat", error);
      }
    };
    fetchProfile();
  }, [user]);

  // Load chat history from localStorage
  useEffect(() => {
    const savedMessages = localStorage.getItem('aeterna_chat_history');
    if (savedMessages) {
      try {
        setMessages(JSON.parse(savedMessages));
      } catch (e) {
        console.error("Failed to parse chat history", e);
      }
    }
  }, []);

  // Save chat history to localStorage
  useEffect(() => {
    if (messages.length > 1) { // Don't save if it's just the welcome message
      localStorage.setItem('aeterna_chat_history', JSON.stringify(messages));
    }
  }, [messages]);

  const clearHistory = () => {
    localStorage.removeItem('aeterna_chat_history');
    setMessages([
      { id: Date.now().toString(), text: "Welcome to AETERNA. I am your personal concierge. How may I assist you with your collection today?", sender: 'ai' }
    ]);
    // Reset chat session
    const initChat = async () => {
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        chatSessionRef.current = ai.chats.create({
          model: 'gemini-2.5-flash',
          config: {
            systemInstruction: SYSTEM_INSTRUCTION,
          },
        });
      } catch (error) {
        console.error("Failed to initialize AETERNA AI", error);
      }
    };
    initChat();
  };

  useEffect(() => {
    if (lenisRef.current && messagesEndRef.current) {
       // Use Lenis to scroll smoothly to the bottom
       lenisRef.current.scrollTo(messagesEndRef.current, { immediate: false });
    } else {
       messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Initialize Chat Session on Mount
  useEffect(() => {
    const initChat = async () => {
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        chatSessionRef.current = ai.chats.create({
          model: 'gemini-2.5-flash',
          config: {
            systemInstruction: SYSTEM_INSTRUCTION,
          },
        });
      } catch (error) {
        console.error("Failed to initialize AETERNA AI", error);
      }
    };
    
    initChat();
  }, []);

  const handlePayment = async (details: NonNullable<Message['paymentDetails']>) => {
    setIsTyping(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Send Email Receipt
    try {
      const emailParams = {
        order_id: `ORD-${Date.now()}`,
        to_name: `${details.customerDetails.firstName} ${details.customerDetails.lastName}`,
        to_email: details.customerDetails.email,
        total_amount: details.price.toLocaleString(),
        order_date: new Date().toLocaleDateString(),
        tracking_link: '#',
        cart_items_html: `
          <tr>
            <td style="padding: 12px; border-bottom: 1px solid #333; color: #e0e0e0;">${details.product}</td>
            <td style="padding: 12px; border-bottom: 1px solid #333; color: #e0e0e0;">1</td>
            <td style="padding: 12px; border-bottom: 1px solid #333; color: #d4af37;">$${details.price.toLocaleString()}</td>
          </tr>
        `
      };

      await emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        emailParams,
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY
      );
    } catch (error) {
      console.error("Failed to send receipt email", error);
    }
    
    setIsTyping(false);
    
    const successMsg: Message = {
      id: Date.now().toString(),
      text: `Payment of $${details.price.toLocaleString()} received. Your order for the ${details.product} has been confirmed. A receipt has been sent to ${details.customerDetails.email}.`,
      sender: 'ai',
      type: 'payment_success'
    };
    setMessages(prev => [...prev, successMsg]);
  };

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const newUserMsg: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user'
    };

    setMessages(prev => [...prev, newUserMsg]);
    setInputValue('');
    setIsTyping(true);

    try {
      // Ensure chat session exists
      if (!chatSessionRef.current) {
         const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
         chatSessionRef.current = ai.chats.create({
          model: 'gemini-2.5-flash',
          config: {
            systemInstruction: SYSTEM_INSTRUCTION,
          },
         });
      }

      // Inject Context
      const bookmarkedProducts = shopProducts
        .filter(p => bookmarkedIds.includes(p.id))
        .map(p => p.name)
        .join(', ');
      
      const userDetailsContext = userProfile ? `
User Profile Details (Use these if user confirms):
- Name: ${userProfile.full_name || 'Not set'}
- Address: ${userProfile.address_line1 || 'Not set'} ${userProfile.address_line2 || ''}
- City: ${userProfile.city || 'Not set'}
- Zip: ${userProfile.postal_code || 'Not set'}
- Country: ${userProfile.country || 'Not set'}
- Email: ${user?.email}
` : "User Profile: None (Ask for all details)";

      const contextMessage = `[System Context: User is logged in: ${user ? 'YES' : 'NO'}. ${userDetailsContext}. User has bookmarked: ${bookmarkedProducts || 'None'}. Current User Input: "${newUserMsg.text}"]`;

      const result = await chatSessionRef.current.sendMessage({ message: contextMessage });
      const responseText = result.text;

      // Try to parse JSON response for actions
      try {
        const cleanText = responseText?.replace(/```json/g, '').replace(/```/g, '').trim();
        if (cleanText?.startsWith('{') && cleanText?.endsWith('}')) {
            const data = JSON.parse(cleanText);
            
            if (data.action === 'request_payment') {
               if (!user) {
                 const signInMsg: Message = {
                   id: (Date.now() + 1).toString(),
                   text: "Please sign in to complete your purchase.",
                   sender: 'ai',
                   type: 'text'
                 };
                 setMessages(prev => [...prev, signInMsg]);
                 onOpenAuth();
                 return;
               }

               // Find product image with specific variant support
               const productObj = shopProducts.find(p => p.name === data.product);
               let imageUrl = productObj ? productObj.imageUrl : undefined;
               let variantName = data.variant;

               // If a variant is specified, try to find its specific image
               if (productObj && variantName) {
                 const variant = productObj.variants?.find(v => 
                   v.name.toLowerCase().includes(variantName.toLowerCase()) || 
                   variantName.toLowerCase().includes(v.name.toLowerCase())
                 );
                 if (variant) {
                   imageUrl = variant.imageUrl;
                   variantName = variant.name; // Normalize name
                 }
               }

               const paymentMsg: Message = {
                 id: (Date.now() + 1).toString(),
                 text: `Please confirm your payment of $${data.price.toLocaleString()} for the ${data.product}${variantName ? ` (${variantName})` : ''}.`,
                 sender: 'ai',
                 type: 'payment_request',
                 paymentDetails: {
                   product: data.product + (variantName ? ` (${variantName})` : ''),
                   price: data.price,
                   currency: data.currency,
                   imageUrl: imageUrl,
                   customerDetails: data.customerDetails
                 }
               };
               setMessages(prev => [...prev, paymentMsg]);
               return;
            }

            if (data.action === 'show_product') {
              const product = shopProducts.find(p => p.name === data.productName);
              if (product) {
                let imageUrl = product.imageUrl;
                let variantName = '';
                
                // Try to find specific variant image
                if (data.variant) {
                  const variant = product.variants?.find(v => v.name.toLowerCase().includes(data.variant.toLowerCase()));
                  if (variant) {
                    imageUrl = variant.imageUrl;
                    variantName = variant.name;
                  }
                }

                const displayMsg: Message = {
                  id: (Date.now() + 1).toString(),
                  text: `Here is the ${product.name}${variantName ? ` (${variantName})` : ''}.`,
                  sender: 'ai',
                  type: 'product_display',
                  productDisplay: {
                    name: product.name,
                    imageUrl: imageUrl,
                    price: product.price,
                    variant: variantName
                  }
                };
                setMessages(prev => [...prev, displayMsg]);
                return;
              }
            }
        }
      } catch (e) {
        // Not JSON, continue to normal text rendering
      }

      const newAiMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: responseText || "I apologize, but I am unable to provide a response at this moment.",
        sender: 'ai'
      };
      
      setMessages(prev => [...prev, newAiMsg]);

    } catch (error) {
      console.error("Chat interaction failed", error);
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: "I apologize, but I am currently unable to connect to the concierge service.",
        sender: 'ai'
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-50 font-body">
      {/* Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group relative w-14 h-14 bg-[#E8CFA0] rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(232,207,160,0.2)] hover:scale-110 transition-all duration-300"
          data-hover="true"
        >
          <div className="absolute inset-0 rounded-full border border-[#E8CFA0] animate-ping opacity-20"></div>
          <MessageSquare className="text-[#050505] w-6 h-6" />
          <span className="absolute -top-2 -right-2 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-green-500 border-2 border-[#050505]"></span>
          </span>
        </button>
      )}

      {/* Chat Window - Reduced Dimensions */}
      <div 
        className={`absolute bottom-0 right-0 w-[300px] md:w-[340px] bg-[#050505]/95 backdrop-blur-xl border border-[#E8CFA0]/20 rounded-2xl shadow-2xl overflow-hidden transition-all duration-500 origin-bottom-right transform ${
          isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'
        }`}
      >
        {/* Header */}
        <div className="bg-[#E8CFA0]/10 p-3 border-b border-[#E8CFA0]/10 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-full bg-[#E8CFA0] flex items-center justify-center text-[#050505]">
              <Sparkles size={12} />
            </div>
            <div>
              <h3 className="font-display text-[#E8CFA0] text-base leading-none">AETERNA</h3>
              <span className="text-[9px] uppercase tracking-widest text-[#F2F2F2]/50">Concierge</span>
            </div>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="text-[#F2F2F2]/50 hover:text-[#E8CFA0] transition-colors"
            data-hover="true"
          >
            <X size={16} />
          </button>
        </div>

        {/* Toolbar */}
        <div className="bg-[#050505] px-3 py-2 border-b border-white/5 flex justify-end">
          <button 
            onClick={clearHistory}
            className="text-[#F2F2F2]/30 hover:text-red-400 transition-colors flex items-center gap-1 text-[10px] uppercase tracking-wider"
            title="Clear Chat History"
          >
            <Trash2 size={12} />
            <span>Clear History</span>
          </button>
        </div>

        {/* Messages - Reduced Height */}
        <div 
          ref={chatContainerRef}
          className="h-[300px] overflow-y-auto p-4 space-y-4 custom-scrollbar bg-gradient-to-b from-[#050505] to-stone-950/50"
        >
          {messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.type === 'payment_request' && msg.paymentDetails ? (
                <div className="bg-white/5 border border-[#E8CFA0]/30 p-4 rounded-2xl w-full max-w-[85%]">
                  <div className="flex items-center gap-2 mb-2 text-[#E8CFA0]">
                    <CreditCard size={16} />
                    <span className="text-xs font-bold uppercase tracking-wider">Secure Payment</span>
                  </div>
                  
                  {msg.paymentDetails.imageUrl && (
                    <div className="flex gap-3 mb-3 bg-white/5 p-2 rounded-lg">
                      <div className="w-12 h-12 rounded bg-white/10 overflow-hidden flex-shrink-0">
                        <img 
                          src={msg.paymentDetails.imageUrl} 
                          alt={msg.paymentDetails.product}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex flex-col justify-center">
                        <span className="text-[#E8CFA0] text-xs font-bold">{msg.paymentDetails.product}</span>
                        <span className="text-[#F2F2F2]/70 text-[10px]">${msg.paymentDetails.price.toLocaleString()}</span>
                      </div>
                    </div>
                  )}

                  <div className="mb-3 text-xs text-[#F2F2F2]/70 space-y-1 border-b border-white/5 pb-2">
                    <p><span className="text-[#E8CFA0]">Ship to:</span> {msg.paymentDetails.customerDetails.firstName} {msg.paymentDetails.customerDetails.lastName}</p>
                    <p>{msg.paymentDetails.customerDetails.address}, {msg.paymentDetails.customerDetails.city}</p>
                  </div>
                  <p className="text-[#F2F2F2] text-sm mb-3">
                    {msg.text}
                  </p>
                  <button
                    onClick={() => msg.paymentDetails && handlePayment(msg.paymentDetails)}
                    className="w-full bg-[#E8CFA0] text-[#050505] py-2 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-white transition-colors flex items-center justify-center gap-2"
                  >
                    Pay ${msg.paymentDetails.price.toLocaleString()}
                  </button>
                </div>
              ) : msg.type === 'product_display' && msg.productDisplay ? (
                <div className="bg-white/5 border border-[#E8CFA0]/30 p-3 rounded-2xl w-full max-w-[85%]">
                  <div className="relative aspect-square w-full mb-3 overflow-hidden rounded-lg bg-white/5">
                    <img 
                      src={msg.productDisplay.imageUrl} 
                      alt={msg.productDisplay.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="text-[#E8CFA0] font-display text-sm">{msg.productDisplay.name}</h4>
                      {msg.productDisplay.variant && (
                        <span className="text-[10px] text-[#F2F2F2]/50 uppercase tracking-wider">{msg.productDisplay.variant}</span>
                      )}
                    </div>
                    <span className="text-[#F2F2F2] font-medium text-sm">${msg.productDisplay.price.toLocaleString()}</span>
                  </div>
                  <button 
                    onClick={() => setInputValue(`I would like to order the ${msg.productDisplay?.name}`)}
                    className="w-full border border-[#E8CFA0]/30 text-[#E8CFA0] py-2 rounded-lg text-xs uppercase tracking-wider hover:bg-[#E8CFA0] hover:text-[#050505] transition-all flex items-center justify-center gap-2"
                  >
                    <ShoppingBag size={12} />
                    Order Now
                  </button>
                </div>
              ) : msg.type === 'payment_success' ? (
                <div className="bg-green-500/10 border border-green-500/30 p-4 rounded-2xl w-full max-w-[85%]">
                  <div className="flex items-center gap-2 mb-2 text-green-400">
                    <CheckCircle size={16} />
                    <span className="text-xs font-bold uppercase tracking-wider">Order Confirmed</span>
                  </div>
                  <p className="text-[#F2F2F2] text-sm">
                    {msg.text}
                  </p>
                </div>
              ) : (
                <div 
                  className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap ${
                    msg.sender === 'user' 
                      ? 'bg-[#E8CFA0] text-[#050505] rounded-tr-none font-medium' 
                      : 'bg-white/5 text-[#F2F2F2] border border-white/5 rounded-tl-none'
                  }`}
                >
                  {formatMessage(msg.text, msg.sender)}
                </div>
              )}
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-white/5 px-4 py-3 rounded-2xl rounded-tl-none border border-white/5 flex gap-1">
                <div className="w-1 h-1 bg-[#E8CFA0]/50 rounded-full animate-bounce"></div>
                <div className="w-1 h-1 bg-[#E8CFA0]/50 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                <div className="w-1 h-1 bg-[#E8CFA0]/50 rounded-full animate-bounce [animation-delay:0.4s]"></div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-3 border-t border-white/5 bg-[#050505]">
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
            className="relative"
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type your inquiry..."
              className="w-full bg-white/5 border border-white/10 rounded-full pl-4 pr-10 py-2.5 text-xs text-[#F2F2F2] focus:outline-none focus:border-[#E8CFA0]/50 transition-colors placeholder:text-white/20"
            />
            <button 
              type="submit"
              disabled={!inputValue.trim() || isTyping}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 w-7 h-7 bg-[#E8CFA0] text-[#050505] rounded-full flex items-center justify-center hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              data-hover="true"
            >
              <Send size={12} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};