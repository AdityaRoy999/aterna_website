import React, { useState, useEffect } from 'react';
import { X, Plus, Minus, Trash2, ArrowRight, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { CartItem } from '../types';

interface CartSidebarProps {
  onCheckout: () => void;
}

// Sub-component for individual animated rows
const CartItemRow: React.FC<{ 
  item: CartItem; 
  onRemove: (id: string) => void; 
  onUpdateQuantity: (id: string, qty: number) => void; 
}> = ({ item, onRemove, onUpdateQuantity }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [prevQty, setPrevQty] = useState(item.quantity);
  const [qtyAnim, setQtyAnim] = useState('');

  // Entry Animation
  useEffect(() => {
    // Small delay to allow render before transition
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  // Quantity Update Animation
  useEffect(() => {
    if (item.quantity !== prevQty) {
      setQtyAnim('scale-125 text-luxury');
      const timer = setTimeout(() => {
        setQtyAnim('');
        setPrevQty(item.quantity);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [item.quantity, prevQty]);

  const handleRemove = () => {
    setIsRemoving(true);
    // Wait for animation to finish before actual removal
    setTimeout(() => {
      onRemove(item.id);
    }, 500); 
  };

  return (
    <div 
      className={`flex gap-4 group transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
        isVisible && !isRemoving 
          ? 'opacity-100 translate-x-0 max-h-40 mb-0' 
          : 'opacity-0 translate-x-8 max-h-0 mb-0 overflow-hidden'
      }`}
    >
      <div className="w-24 h-32 bg-void rounded-lg overflow-hidden shrink-0 border border-white/5 relative group-hover:border-luxury/30 transition-colors duration-500">
        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
        <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-300"/>
      </div>
      
      <div className="flex-1 flex flex-col justify-between py-1">
        <div>
          <div className="flex justify-between items-start">
            <h3 className="font-display text-xl text-offwhite leading-tight">{item.name}</h3>
            <button 
              onClick={handleRemove}
              className="text-offwhite/20 hover:text-red-400 transition-colors p-1 hover:bg-white/5 rounded-full opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-300"
              data-hover="true"
            >
              <Trash2 size={14} />
            </button>
          </div>
          <p className="font-ui text-xs text-luxury mb-1 mt-1">${item.price.toLocaleString()}</p>
          {item.selectedColor && (
            <p className="font-body text-[10px] text-offwhite/40 uppercase tracking-widest">Color: {item.selectedColor}</p>
          )}
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center border border-white/10 rounded-full bg-void/30">
            <button 
              onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
              className="w-8 h-8 flex items-center justify-center text-offwhite/50 hover:text-offwhite transition-colors active:scale-90"
              data-hover="true"
            >
              <Minus size={10} />
            </button>
            <span className={`font-ui text-sm w-6 text-center text-offwhite transition-all duration-300 ${qtyAnim}`}>
              {item.quantity}
            </span>
            <button 
              onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
              className="w-8 h-8 flex items-center justify-center text-offwhite/50 hover:text-offwhite transition-colors active:scale-90"
              data-hover="true"
            >
              <Plus size={10} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const CartSidebar: React.FC<CartSidebarProps> = ({ onCheckout }) => {
  const { items, removeFromCart, updateQuantity, cartTotal, isCartOpen, setIsCartOpen } = useCart();
  const [totalKey, setTotalKey] = useState(0);

  // Trigger animation on total price change
  useEffect(() => {
    setTotalKey(prev => prev + 1);
  }, [cartTotal]);

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-void/80 backdrop-blur-sm z-[60] transition-opacity duration-500 ${
          isCartOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsCartOpen(false)}
      />

      {/* Sidebar */}
      <div 
        className={`fixed top-0 right-0 h-full w-full md:w-[450px] bg-stone-900 border-l border-white/5 z-[70] transform transition-transform duration-700 cubic-bezier(0.22, 1, 0.36, 1) flex flex-col shadow-2xl ${
          isCartOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-stone-900 z-10 relative">
          <div className="flex items-center gap-3">
            <ShoppingBag size={20} className="text-luxury" />
            <h2 className="font-display text-2xl text-offwhite">Your Selection</h2>
          </div>
          <button 
            onClick={() => setIsCartOpen(false)}
            className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-offwhite transition-colors active:scale-90"
            data-hover="true"
          >
            <X size={20} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar relative">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-offwhite/40 space-y-4 animate-fade-in">
              <ShoppingBag size={48} className="opacity-20" />
              <p className="font-body text-sm">Your bag is empty.</p>
              <button 
                onClick={() => setIsCartOpen(false)}
                className="font-ui text-luxury text-xs uppercase tracking-widest hover:text-white transition-colors border-b border-luxury/30 pb-1"
                data-hover="true"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            items.map((item) => (
              <CartItemRow 
                key={item.id} 
                item={item} 
                onRemove={removeFromCart} 
                onUpdateQuantity={updateQuantity} 
              />
            ))
          )}
        </div>

        {/* Footer */}
        <div className={`p-6 border-t border-white/5 bg-stone-900 transition-all duration-500 ${items.length > 0 ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0 pointer-events-none'}`}>
          <div className="space-y-3 mb-6">
            <div className="flex justify-between text-sm">
              <span className="text-offwhite/50 font-body">Subtotal</span>
              <span key={totalKey} className="text-offwhite font-ui animate-pulse-slow">${cartTotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-offwhite/50 font-body">Shipping</span>
              <span className="text-offwhite font-ui">Calculated at checkout</span>
            </div>
          </div>
          <button 
            onClick={() => {
              setIsCartOpen(false);
              onCheckout();
            }}
            className="w-full bg-luxury text-void font-ui font-bold text-xs uppercase tracking-widest py-4 rounded-lg hover:bg-white transition-all duration-300 flex items-center justify-center gap-2 group shadow-[0_0_20px_rgba(232,207,160,0.2)]"
            data-hover="true"
          >
            Proceed to Checkout
            <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </div>
    </>
  );
};