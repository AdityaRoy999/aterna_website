import React, { useState, useEffect, useRef } from 'react';
import { Menu, ShoppingBag, User, Heart } from 'lucide-react'; // Removed 'Sun' icon
import { X } from '@/components/ui/icons/x';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
// Removed LightThemeProvider import

const appLogo = '/images/app_logo.png';

interface HeaderProps {
  onNavigate: (page: string, params?: any) => void;
  currentPage: string;
  onOpenAuth: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onNavigate, currentPage, onOpenAuth }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  // Removed lightTheme state
  
  const { itemCount, setIsCartOpen } = useCart();
  const { user } = useAuth();
  const [animateCart, setAnimateCart] = useState(false);
  const prevCountRef = useRef(itemCount);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (itemCount > prevCountRef.current) {
      setAnimateCart(true);
      const timer = setTimeout(() => setAnimateCart(false), 300);
      prevCountRef.current = itemCount;
      return () => clearTimeout(timer);
    }
    prevCountRef.current = itemCount;
  }, [itemCount]);

  function navLinkClass(page: string) {
    return `relative px-2 py-1 transition-colors duration-300 ${currentPage === page ? 'text-luxury' : 'hover:text-luxury'}`;
  }

  function handleMobileNav(page: string) {
    setIsMenuOpen(false);
    onNavigate(page);
  }

  return (
    <>
      {/* Header Render - No Theme Provider Wrapper anymore */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out pointer-events-none ${
          isScrolled ? 'py-4' : 'py-8'
        }`}
      >
        <div className="container mx-auto px-6">
          <div
            className={`relative w-full flex lg:grid lg:grid-cols-3 items-center justify-between px-6 py-4 rounded-full transition-all duration-500 pointer-events-auto border ${
              isScrolled
                ? 'bg-void/10 backdrop-blur-2xl border-white/5 shadow-2xl'
                : 'bg-transparent border-transparent'
            }`}
          >
            {/* LEFT SECTION: Logo */}
            <div className="flex items-center lg:justify-self-start">
              <button
                onClick={() => onNavigate('home')}
                className="flex items-center gap-3 hover:opacity-80 transition-all duration-300 hover:scale-105 origin-left"
                data-hover="true"
              >
                <img src={appLogo} alt="AETERNA Logo" className="h-8 w-auto md:h-10" />
                <span className="font-display text-3xl text-luxury tracking-wider hidden md:block">
                  AETERNA
                </span>
              </button>
            </div>

            {/* MIDDLE SECTION: Navigation */}
            <nav className="hidden lg:flex justify-center items-center space-x-12 font-body text-sm tracking-widest text-offwhite/80 lg:justify-self-center">
              {['shop', 'collections', 'maison', 'journal'].map((page) => (
                <button 
                  key={page}
                  onClick={() => onNavigate(page)} 
                  className={`group relative px-2 py-1 transition-colors duration-300 ${currentPage === page ? 'text-luxury' : 'hover:text-luxury'}`}
                  data-hover="true"
                >
                  <span className="relative">
                    {page.toUpperCase()}
                    <span className={`absolute -bottom-1 left-0 w-full h-[0.5px] bg-luxury transform origin-left transition-transform duration-500 ease-out ${currentPage === page ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`} />
                  </span>
                </button>
              ))}
            </nav>

            {/* RIGHT SECTION: Actions */}
            <div className="flex items-center justify-end gap-4 lg:justify-self-end">
              <button 
                onClick={() => onNavigate('wishlist')}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-white/5 hover:bg-luxury hover:text-void transition-all duration-300 relative group hover:scale-110 active:scale-95"
                title="Wishlist"
                data-hover="true"
              >
                 <Heart size={18} />
              </button>
              <button 
                onClick={() => user ? onNavigate('profile') : onOpenAuth()}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-white/5 hover:bg-luxury hover:text-void transition-all duration-300 relative group hover:scale-110 active:scale-95"
                title={user ? "My Account" : "Sign In"}
                data-hover="true"
              >
                 <User size={18} />
              </button>
              <button 
                onClick={() => setIsCartOpen(true)}
                className={`flex items-center justify-center w-10 h-10 rounded-full hover:bg-luxury hover:text-void transition-all duration-300 relative group hover:scale-110 active:scale-95 ${
                  animateCart 
                    ? 'bg-luxury text-void scale-110 shadow-[0_0_20px_rgba(232,207,160,0.4)]' 
                    : 'bg-white/5'
                }`}
                data-hover="true"
              >
                 <ShoppingBag 
                   size={18} 
                   className={`transition-transform duration-300 ${animateCart ? '-rotate-12 scale-110' : ''}`}
                 />
                 {itemCount > 0 && (
                   <span className={`absolute -top-1 -right-1 w-4 h-4 bg-luxury text-void text-[10px] font-bold rounded-full flex items-center justify-center transition-transform duration-300 ${animateCart ? 'scale-150' : 'scale-100'}`}>
                     {itemCount}
                   </span>
                 )}
              </button>
              
              {/* THEME TOGGLE BUTTON REMOVED HERE */}

              <button 
                onClick={() => setIsMenuOpen(true)}
                className="group flex items-center gap-3 bg-transparent hover:bg-luxury border border-white/10 hover:border-luxury px-3 md:px-5 py-2 rounded-full transition-all duration-300 hover:scale-105 active:scale-95"
                data-hover="true"
              >
                <span className="hidden md:block font-body text-xs uppercase tracking-widest text-luxury group-hover:text-void font-medium">
                  Menu
                </span>
                <Menu size={20} className="text-luxury group-hover:text-void md:w-4 md:h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile / Full Screen Menu Overlay */}
      <div 
        className={`fixed inset-0 z-[60] bg-void flex flex-col transition-all duration-700 ease-in-out ${
          isMenuOpen ? 'translate-y-0 opacity-100 pointer-events-auto' : '-translate-y-full opacity-0 pointer-events-none'
        }`}
      >
        <div className="absolute top-0 right-0 p-8 z-10">
          <button 
            onClick={() => setIsMenuOpen(false)}
            className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center text-luxury hover:bg-luxury hover:text-void transition-all duration-300 border border-white/10 hover:rotate-90"
            data-hover="true"
          >
            <X size={28} animateOnHover />
          </button>
        </div>
        <div className="flex-1 flex flex-col justify-center items-center gap-8 p-6">
           {['Home', 'Shop', 'Collections', 'Maison', 'Journal'].map((item, idx) => (
             <button
               key={item}
               onClick={() => handleMobileNav(item.toLowerCase())}
               className={`font-display text-5xl md:text-7xl text-offwhite hover:text-luxury transition-all duration-300 hover:scale-105 ${isMenuOpen ? 'animate-slide-up opacity-0' : ''}`}
               style={{ animationDelay: `${idx * 100 + 300}ms`, animationFillMode: 'forwards' }}
               data-hover="true"
             >
               {item}
             </button>
           ))}
        </div>
        <div className="p-8 border-t border-white/5 flex justify-between items-center text-offwhite/40 font-body text-xs tracking-widest uppercase">
          <span>© 2025 Aeterna</span>
          <div className="flex gap-6">
             <a href="#" className="hover:text-luxury transition-colors hover:-translate-y-1 inline-block" data-hover="true">Instagram</a>
             <a href="#" className="hover:text-luxury transition-colors hover:-translate-y-1 inline-block" data-hover="true">Twitter</a>
          </div>
        </div>
      </div>
    </>
  );
};