import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Sparkles } from 'lucide-react';
import { GoogleGenAI, Chat } from "@google/genai";

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
}

const SYSTEM_INSTRUCTION = `You are the AETERNA Concierge, an expert advisor for a high-end luxury lifestyle brand. Your tone is sophisticated, concise, and effortless.

Core Guidelines:

Tone: Use elegant, editorial language (e.g., 'exquisite,' 'crafted,' 'timeless'). Avoid corporate jargon or overly enthusiastic exclamation points. Never use emojis.

Brevity: Luxury is quiet. Keep initial responses under 2 sentences unless the user asks for a detailed story.

Role: You are not a salesperson; you are a curator. Do not push for a sale. Instead, 'recommend' or 'invite' the user to explore.

Formatting: Use bullet points or elegant line breaks for readability. Use bolding sparingly for key product names.

Prohibitions: Never mention 'discounts,' 'coupons,' or 'cheap deals.' AETERNA does not do sales. If asked about price, state it neutrally as 'The investment is...'`;

export const Chatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', text: "Welcome to AETERNA. I am your personal concierge. How may I assist you with your collection today?", sender: 'ai' }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatSessionRef = useRef<Chat | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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

      const result = await chatSessionRef.current.sendMessage({ message: newUserMsg.text });
      const responseText = result.text;

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
          className="group relative w-14 h-14 bg-luxury rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(232,207,160,0.2)] hover:scale-110 transition-all duration-300"
          data-hover="true"
        >
          <div className="absolute inset-0 rounded-full border border-luxury animate-ping opacity-20"></div>
          <MessageSquare className="text-void w-6 h-6" />
          <span className="absolute -top-2 -right-2 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-green-500 border-2 border-void"></span>
          </span>
        </button>
      )}

      {/* Chat Window - Reduced Dimensions */}
      <div 
        className={`absolute bottom-0 right-0 w-[300px] md:w-[340px] bg-void/95 backdrop-blur-xl border border-luxury/20 rounded-2xl shadow-2xl overflow-hidden transition-all duration-500 origin-bottom-right transform ${
          isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'
        }`}
      >
        {/* Header */}
        <div className="bg-luxury/10 p-3 border-b border-luxury/10 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-full bg-luxury flex items-center justify-center text-void">
              <Sparkles size={12} />
            </div>
            <div>
              <h3 className="font-display text-luxury text-base leading-none">AETERNA</h3>
              <span className="text-[9px] uppercase tracking-widest text-offwhite/50">Concierge</span>
            </div>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="text-offwhite/50 hover:text-luxury transition-colors"
            data-hover="true"
          >
            <X size={16} />
          </button>
        </div>

        {/* Messages - Reduced Height */}
        <div className="h-[300px] overflow-y-auto p-4 space-y-4 custom-scrollbar bg-gradient-to-b from-void to-stone-950/50">
          {messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap ${
                  msg.sender === 'user' 
                    ? 'bg-luxury text-void rounded-tr-none font-medium' 
                    : 'bg-white/5 text-offwhite border border-white/5 rounded-tl-none'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-white/5 px-4 py-3 rounded-2xl rounded-tl-none border border-white/5 flex gap-1">
                <div className="w-1 h-1 bg-luxury/50 rounded-full animate-bounce"></div>
                <div className="w-1 h-1 bg-luxury/50 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                <div className="w-1 h-1 bg-luxury/50 rounded-full animate-bounce [animation-delay:0.4s]"></div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-3 border-t border-white/5 bg-void">
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
            className="relative"
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type your inquiry..."
              className="w-full bg-white/5 border border-white/10 rounded-full pl-4 pr-10 py-2.5 text-xs text-offwhite focus:outline-none focus:border-luxury/50 transition-colors placeholder:text-white/20"
            />
            <button 
              type="submit"
              disabled={!inputValue.trim() || isTyping}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 w-7 h-7 bg-luxury text-void rounded-full flex items-center justify-center hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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