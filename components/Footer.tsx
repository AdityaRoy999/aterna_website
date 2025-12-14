import React, { useState, useEffect, useRef } from 'react';
import { Instagram, Twitter, Facebook, Linkedin, AlertCircle, ArrowUp } from 'lucide-react';
import { Check } from '@/components/ui/icons/check';
import { ArrowRight } from '@/components/ui/icons/arrow-right';

interface FooterProps {
  onNavigate: (page: string, params?: any) => void;
}

const FooterLinkGroup: React.FC<{ title: string; links: { label: string; action?: () => void }[] }> = ({ title, links }) => (
  <div className="flex flex-col gap-6">
    <h4 className="font-ui text-luxury font-bold text-xs tracking-[0.2em] uppercase">
      {title}
    </h4>
    <ul className="space-y-4">
      {links.map((link) => (
        <li key={link.label} className="overflow-hidden">
          <button 
            onClick={link.action}
            className="font-body text-offwhite/60 hover:text-white transition-all duration-500 text-sm hover:translate-x-2 inline-block relative group text-left"
            data-hover="true"
          >
            <span className="relative z-10">{link.label}</span>
            <span className="absolute bottom-0 left-0 w-0 h-px bg-luxury transition-all duration-300 group-hover:w-full"></span>
          </button>
        </li>
      ))}
    </ul>
  </div>
);

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const [email, setEmail] = useState('');
  const [subscriptionStatus, setSubscriptionStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [showScrollTop, setShowScrollTop] = useState(false);
  const containerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 500) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic Email Regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email) {
      setSubscriptionStatus('error');
      setMessage('Please enter an email address.');
      return;
    }

    if (!emailRegex.test(email)) {
      setSubscriptionStatus('error');
      setMessage('Please enter a valid email address.');
      return;
    }

    try {
      const form = e.target as HTMLFormElement;
      const data = new FormData(form);

      const response = await fetch(import.meta.env.VITE_FORMSPREE_URL, {
        method: "POST",
        body: data,
        headers: {
            'Accept': 'application/json'
        }
      });

      if (response.ok) {
        setSubscriptionStatus('success');
        setMessage('Email sent successfully. Welcome to the circle.');
        setEmail('');

        // Reset status after delay
        setTimeout(() => {
          setSubscriptionStatus('idle');
          setMessage('');
        }, 4000);
      } else {
        setSubscriptionStatus('error');
        setMessage('Something went wrong. Please try again.');
      }
    } catch (error) {
      setSubscriptionStatus('error');
      setMessage('Unable to subscribe. Please check your connection.');
    }
  };

  return (
    <footer ref={containerRef} className="bg-void border-t border-white/5 pt-32 pb-8 relative overflow-hidden">
      {/* Background Ambient Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-64 bg-luxury/5 blur-[120px] pointer-events-none rounded-full" />

      <div className="container mx-auto px-6 relative z-10">
        
        {/* Top Section: Newsletter & Socials */}
        <div className="footer-top flex flex-col lg:flex-row justify-between items-start lg:items-end mb-24 gap-12">
          <div className="max-w-xl w-full">
            <h2 className="font-display text-5xl md:text-6xl text-offwhite mb-6 leading-tight">
              Join the <span className="text-luxury italic font-script">Inner Circle</span>
            </h2>
            <p className="font-body text-offwhite/50 mb-10 text-lg font-light leading-relaxed">
              Subscribe to receive invitations to private viewings, exclusive product drops, and the latest from our ateliers.
            </p>
            
            <form 
              className="relative group max-w-md" 
              onSubmit={handleSubscribe}
              action={import.meta.env.VITE_FORMSPREE_URL}
              method="POST"
            >
              <input
                type="email"
                name="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (subscriptionStatus === 'error') setSubscriptionStatus('idle');
                }}
                placeholder="Email Address"
                className={`w-full bg-transparent border-b py-4 text-offwhite font-body text-lg focus:outline-none transition-colors placeholder:text-white/20 ${
                  subscriptionStatus === 'error' 
                    ? 'border-red-500/50 focus:border-red-500' 
                    : 'border-white/20 focus:border-luxury'
                }`}
                disabled={subscriptionStatus === 'success'}
              />
              <button 
                type="submit"
                className={`absolute right-0 top-1/2 -translate-y-1/2 transition-colors duration-300 ${
                  subscriptionStatus === 'success' 
                    ? 'text-green-500 cursor-default' 
                    : 'text-offwhite/50 hover:text-luxury'
                }`}
                disabled={subscriptionStatus === 'success'}
                data-hover={subscriptionStatus !== 'success'}
              >
                <span className="sr-only">Subscribe</span>
                {subscriptionStatus === 'success' ? (
                  <Check size={24} className="animate-scale-in" animate />
                ) : (
                  <ArrowRight 
                    size={24} 
                    className="transform transition-transform duration-300 group-focus-within:translate-x-1 group-hover:translate-x-1" 
                    animation="pointing"
                    animateOnHover
                  />
                )}
              </button>
              
              {/* Feedback Messages */}
              <div className="absolute left-0 -bottom-8 h-6">
                {subscriptionStatus === 'error' && (
                  <div className="flex items-center gap-2 text-red-400 text-xs font-body animate-fade-in">
                    <AlertCircle size={12} />
                    <span>{message}</span>
                  </div>
                )}
                {subscriptionStatus === 'success' && (
                  <div className="flex items-center gap-2 text-green-400 text-xs font-body animate-fade-in">
                    <span>{message}</span>
                  </div>
                )}
              </div>
            </form>
          </div>

          <div className="flex gap-8">
             {[Instagram, Twitter, Facebook, Linkedin].map((Icon, i) => (
               <a 
                 key={i} 
                 href="#" 
                 className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-offwhite/50 hover:text-void hover:bg-luxury hover:border-luxury transition-all duration-500 hover:-translate-y-1 group"
                 data-hover="true"
               >
                 <Icon size={20} className="transition-transform duration-500 group-hover:scale-110" />
               </a>
             ))}
          </div>
        </div>

        <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-20" />

        {/* Middle Section: Links */}
        <div className="footer-links grid grid-cols-2 md:grid-cols-4 gap-12 lg:gap-8 mb-24">
          <div className="col-span-2 md:col-span-1">
             <h3 className="font-display text-3xl text-offwhite mb-6">AETERNA</h3>
             <p className="font-body text-offwhite/40 text-sm leading-relaxed max-w-xs">
               12 Rue de la Paix<br />
               75002 Paris, France<br />
               <br />
               +33 1 42 60 00 00<br />
               concierge@aeterna.com
             </p>
          </div>
          <FooterLinkGroup 
            title="Collections" 
            links={[
              { label: 'Timepieces', action: () => onNavigate('collections') },
              { label: 'Fine Jewelry', action: () => onNavigate('collections') },
              { label: 'Fragrances', action: () => onNavigate('collections') },
              { label: 'Accessories', action: () => onNavigate('collections') }
            ]} 
          />
          <FooterLinkGroup 
            title="The Maison" 
            links={[
              { label: 'Our Heritage', action: () => onNavigate('maison') },
              { label: 'The Ateliers', action: () => onNavigate('maison') },
              { label: 'Sustainability', action: () => onNavigate('maison') },
              { label: 'Careers', action: () => onNavigate('careers') }
            ]} 
          />
          <FooterLinkGroup 
            title="Client Care" 
            links={[
              { label: 'Contact Us', action: () => onNavigate('contact') },
              { label: 'Shipping & Returns', action: () => onNavigate('shipping') },
              { label: 'Book Appointment', action: () => onNavigate('appointment') },
              { label: 'Track Your Order', action: () => onNavigate('tracking') }
            ]} 
          />
        </div>

        {/* Bottom Copyright Section */}
        <div className="footer-bottom flex flex-col md:flex-row justify-between items-center border-t border-white/5 pt-8 pb-4 relative z-20">
          <p className="font-body text-xs text-offwhite/30 uppercase tracking-widest order-2 md:order-1 mt-4 md:mt-0">
            © 2025 AETERNA Luxury Holdings.
          </p>
          <div className="flex gap-8 order-1 md:order-2">
            <button 
              onClick={() => onNavigate('privacy')}
              className="font-body text-xs text-offwhite/30 uppercase tracking-widest hover:text-luxury transition-colors" 
              data-hover="true"
            >
              Privacy Policy
            </button>
            <button 
              onClick={() => onNavigate('terms')}
              className="font-body text-xs text-offwhite/30 uppercase tracking-widest hover:text-luxury transition-colors" 
              data-hover="true"
            >
              Terms of Use
            </button>
          </div>
        </div>
      </div>

      {/* Massive Watermark - Absolute Positioned at Bottom */}
      <div className="footer-watermark absolute bottom-0 left-0 w-full flex justify-center overflow-hidden pointer-events-none select-none opacity-20 z-0">
         <span className="font-display text-[20vw] leading-none text-transparent bg-clip-text bg-gradient-to-b from-white/10 to-transparent tracking-tighter transform translate-y-[35%]">
           AETERNA
         </span>
      </div>

      {/* Scroll To Top Button */}
      <button
        onClick={scrollToTop}
        className={`fixed bottom-8 left-8 z-40 w-12 h-12 rounded-full bg-stone-900 border border-luxury/30 text-luxury flex items-center justify-center shadow-lg transition-all duration-500 hover:bg-luxury hover:text-void hover:scale-110 group ${
          showScrollTop ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0 pointer-events-none'
        }`}
        data-hover="true"
        aria-label="Scroll to top"
      >
        <ArrowUp size={20} className="transition-transform duration-300 group-hover:-translate-y-1" />
      </button>
    </footer>
  );
};