import React, { useRef, useEffect, useState } from 'react';
import { useCart } from '../context/CartContext';
import { Product } from '../types';
import { ArrowUpRight } from 'lucide-react';
import { ParallaxBackground } from './ParallaxBackground';
import { supabase } from '../src/supabaseClient';

// BentoGrid should fetch products from the database so price updates reflect across the site
const DEFAULT_IMAGES = {
  clockGold: '/images/clock_gold.png',
  noirStan: '/images/noir_stan.png'
};

interface ProductCardProps {
  product: Product;
  onNavigate: (page: string, params?: any) => void;
  index: number;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onNavigate, index }) => {
  const handleNavigate = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    onNavigate('shop', { productId: product.id });
  };

  const { addToCart, items: cartItems, updateQuantity, removeFromCart } = useCart();

  const cartItem = cartItems.find(ci => ci.id === product.id || ci.id.startsWith(`${product.id}-`));
  const qty = cartItem?.quantity || 0;

  const handleIncrease = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product, 1, cartItem?.selectedColor || 'Gold');
  };

  const handleDecrease = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!cartItem) return;
    if (cartItem.quantity <= 1) {
      removeFromCart(cartItem.id);
    } else {
      updateQuantity(cartItem.id, cartItem.quantity - 1);
    }
  };

  return (
    <div 
      onClick={handleNavigate}
      className={`bento-card group relative overflow-hidden rounded-[2rem] bg-stone-900 border border-white/5 ${product.span || 'col-span-1'} min-h-[300px] cursor-pointer`}
      data-hover="true"
    >
      {/* Background Image Wrapper for Parallax */}
      <ParallaxBackground 
        src={product.imageUrl} 
        alt={product.name}
        className="transition-transform duration-1000 ease-out group-hover:scale-110 opacity-80 group-hover:opacity-100"
      />

      {/* Gradient Overlay - Static relative to card */}
      <div className="absolute inset-0 bg-gradient-to-t from-void via-void/70 to-transparent opacity-90 transition-opacity duration-500 group-hover:opacity-80 pointer-events-none" />

      {/* Content */}
      <div className="absolute inset-0 p-6 md:p-8 flex flex-col justify-end transform translate-y-2 transition-transform duration-500 group-hover:translate-y-0 z-10">
        <div className="flex justify-between items-end">
          <div>
            <p className="font-body text-luxury/70 text-[10px] md:text-xs uppercase tracking-widest mb-3 transition-all duration-300 group-hover:text-luxury">
              {product.category}
            </p>
            <h3 className="font-display text-2xl md:text-3xl text-offwhite mb-2 leading-tight">
              {product.name}
            </h3>
            <p className="font-ui font-medium text-base md:text-lg text-offwhite/80">
              ${product.price.toLocaleString()}
            </p>
          </div>
          
          <button 
            onClick={handleNavigate}
            className="w-12 h-12 rounded-full bg-luxury text-void flex items-center justify-center transform translate-y-12 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 hover:bg-muted group/btn" 
            data-hover="true"
          >
            <ArrowUpRight size={20} className="transition-transform duration-300 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
          </button>
        </div>
      </div>

      {/* Tags */}
      {product.isNew && (
        <div className="absolute top-6 left-6 px-4 py-1.5 rounded-full bg-luxury/20 backdrop-blur-sm border border-luxury/30 z-10">
          <span className="font-ui text-xs font-bold text-luxury uppercase tracking-wider">New Arrival</span>
        </div>
      )}

      {qty > 0 && (
        <div className="absolute bottom-6 right-6 z-20 flex items-center gap-2 bg-black/40 rounded-full px-3 py-1 backdrop-blur-sm border border-white/5">
          <button onClick={handleDecrease} className="text-white/80 px-2 py-1 rounded-md">−</button>
          <span className="text-offwhite font-medium px-2">{qty}</span>
          <button onClick={handleIncrease} className="text-white/80 px-2 py-1 rounded-md">+</button>
        </div>
      )}
    </div>
  );
};

interface BentoGridProps {
  onNavigate: (page: string, params?: any) => void;
}

export const BentoGrid: React.FC<BentoGridProps> = ({ onNavigate }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const { items: cartItems } = useCart();

  useEffect(() => {
    let isMounted = true;

    const fetchProducts = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('id, name, price, category, image_url, is_new')
          .order('created_at', { ascending: false })
          .limit(4);

        if (error) {
          console.error('BentoGrid fetch error:', error);
          return;
        }

        if (!data || !isMounted) return;

        const spans = [
          'col-span-1 md:col-span-2 row-span-2',
          'col-span-1',
          'col-span-1',
          'col-span-1 md:col-span-2'
        ];

        const mapped: Product[] = data.map((p: any, idx: number) => ({
          id: String(p.id),
          name: p.name || 'Untitled',
          price: typeof p.price === 'number' ? p.price : Number(p.price) || 0,
          category: p.category || 'Essentials',
          imageUrl: p.image_url || (idx % 2 === 0 ? DEFAULT_IMAGES.clockGold : DEFAULT_IMAGES.noirStan),
          isNew: !!p.is_new,
          span: spans[idx] || 'col-span-1'
        }));

        setProducts(mapped);
      } catch (err) {
        console.error('Error loading BentoGrid products', err);
      }
    };

    fetchProducts();

    return () => { isMounted = false; };
  }, []);

  return (
    <section ref={containerRef} className="py-24 px-4 bg-void relative z-20">
      <div className="container mx-auto">
        <div className="flex items-end justify-between mb-12 px-2">
          <h2 className="bento-title font-display text-4xl md:text-5xl text-offwhite">
            Curated <span className="text-muted italic font-script">Essentials</span>
          </h2>
          <button 
            onClick={() => onNavigate('collections')}
            className="bento-btn hidden md:block font-ui text-sm text-luxury hover:text-white transition-colors uppercase tracking-widest border-b border-luxury/30 pb-1" 
            data-hover="true"
          >
            View All Collection
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 auto-rows-[300px] md:auto-rows-[350px]">
          {products.map((product, index) => (
            <ProductCard key={product.id} product={product} onNavigate={onNavigate} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};