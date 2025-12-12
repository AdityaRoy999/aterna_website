import React, { useState, useEffect, useRef } from 'react';
import { Menu, ShoppingBag, X } from 'lucide-react';
import { useCart } from '../context/CartContext';

interface HeaderProps {
  onNavigate: (page: string, params?: any) => void;
  currentPage: string;
}

export const Header: React.FC<HeaderProps> = ({ onNavigate, currentPage }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { itemCount, setIsCartOpen } = useCart();
  const [animateCart, setAnimateCart] = useState(false);
  const prevCountRef = useRef(itemCount);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Trigger animation when items are added
  useEffect(() => {
    if (itemCount > prevCountRef.current) {
      setAnimateCart(true);
      const timer = setTimeout(() => setAnimateCart(false), 300);
      prevCountRef.current = itemCount;
      return () => clearTimeout(timer);
    }
    prevCountRef.current = itemCount;
  }, [itemCount]);

  // Lock body scroll when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isMenuOpen]);

  const navLinkClass = (page: string) => 
    `cursor-pointer transition-colors relative after:content-[''] after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[1px] after:bg-luxury after:transition-all after:duration-300 hover:text-luxury whitespace-nowrap ${
      currentPage === page ? 'text-luxury after:w-full' : 'hover:after:w-full hover:-translate-y-0.5 transform transition-transform duration-300'
    }`;

  const handleMobileNav = (page: string) => {
    onNavigate(page);
    setIsMenuOpen(false);
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out pointer-events-none ${
          isScrolled ? 'py-4' : 'py-8'
        }`}
      >
        <div className="container mx-auto px-6">
          <div
            className={`relative flex items-center justify-between px-6 py-4 rounded-full transition-all duration-500 pointer-events-auto border ${
              isScrolled
                ? 'bg-void/10 backdrop-blur-2xl border-white/5 shadow-2xl'
                : 'bg-transparent border-transparent'
            }`}
          >
            {/* Logo */}
            <div className="flex-1">
              <button
                onClick={() => onNavigate('home')}
                className="font-display text-3xl text-luxury tracking-wider hover:opacity-80 transition-all duration-300 hover:scale-105 origin-left"
                data-hover="true"
              >
                AETERNA
              </button>
            </div>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center space-x-12 font-body text-sm tracking-widest text-offwhite/80 absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <button 
                onClick={() => onNavigate('shop')} 
                className={navLinkClass('shop')}
                data-hover="true"
              >
                SHOP
              </button>
              <button 
                onClick={() => onNavigate('collections')} 
                className={navLinkClass('collections')}
                data-hover="true"
              >
                COLLECTIONS
              </button>
              <button 
                onClick={() => onNavigate('maison')} 
                className={navLinkClass('maison')}
                data-hover="true"
              >
                MAISON
              </button>
              <button 
                onClick={() => onNavigate('journal')} 
                className={navLinkClass('journal')}
                data-hover="true"
              >
                JOURNAL
              </button>
            </nav>

            {/* Right Actions */}
            <div className="flex-1 flex justify-end items-center gap-4">
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
              
              <button 
                onClick={() => setIsMenuOpen(true)}
                className="group flex items-center gap-3 bg-transparent hover:bg-luxury border border-white/10 hover:border-luxury px-3 md:px-5 py-2 rounded-full transition-all duration-300 hover:scale-105 active:scale-95"
                data-hover="true"
              >
                {/* Hidden on mobile, visible on md+ */}
                <span className="hidden md:block font-body text-xs uppercase tracking-widest text-luxury group-hover:text-void font-medium">
                  Menu
                </span>
                {/* Icon only on mobile */}
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
            <X size={28} />
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