import React from 'react';
import { Product } from '../types';
import { ArrowUpRight } from 'lucide-react';
import { ParallaxBackground } from './ParallaxBackground';

const products: Product[] = [
  {
    id: '1',
    name: 'Ulania Watch',
    price: 18100.00,
    category: 'Timepieces',
    imageUrl: 'src_images//clock_gold.png',
    span: 'col-span-1 md:col-span-2 row-span-2',
    isNew: true
  },
  {
    id: '2',
    name: 'Chanel No. 5',
    price: 259.00,
    category: 'Fragrance',
    imageUrl: 'https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=1004&auto=format&fit=crop',
    span: 'col-span-1',
  },
  {
    id: '3',
    name: 'Gold Abstract',
    price: 1250.50,
    category: 'Jewelry',
    imageUrl: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=1887&auto=format&fit=crop',
    span: 'col-span-1',
  },
  {
    id: '4',
    name: 'Noir Elegance',
    price: 450.00,
    category: 'Accessories',
    imageUrl: 'src_images//noir_stan.png',
    span: 'col-span-1 md:col-span-2',
  },
];

interface ProductCardProps {
  product: Product;
  onNavigate: (page: string, params?: any) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onNavigate }) => {
  const handleNavigate = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    onNavigate('shop', { productId: product.id });
  };

  return (
    <div 
      onClick={handleNavigate}
      className={`group relative overflow-hidden rounded-[2rem] bg-stone-900 border border-white/5 ${product.span || 'col-span-1'} min-h-[300px] cursor-pointer`}
      data-hover="true"
    >
      {/* Background Image Wrapper for Parallax */}
      <ParallaxBackground 
        src={product.imageUrl} 
        alt={product.name}
        className="transition-transform duration-1000 ease-out group-hover:scale-110 opacity-80 group-hover:opacity-100"
      />

      {/* Gradient Overlay - Static relative to card */}
      <div className="absolute inset-0 bg-gradient-to-t from-void via-void/50 to-transparent opacity-80 transition-opacity duration-500 group-hover:opacity-60 pointer-events-none" />

      {/* Content */}
      <div className="absolute inset-0 p-8 flex flex-col justify-end transform translate-y-2 transition-transform duration-500 group-hover:translate-y-0 z-10">
        <div className="flex justify-between items-end">
          <div>
            <p className="font-body text-luxury/70 text-xs uppercase tracking-widest mb-2 transition-all duration-300 group-hover:text-luxury">
              {product.category}
            </p>
            <h3 className="font-display text-3xl text-offwhite mb-1">
              {product.name}
            </h3>
            <p className="font-ui font-medium text-lg text-offwhite/80">
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
    </div>
  );
};

interface BentoGridProps {
  onNavigate: (page: string, params?: any) => void;
}

export const BentoGrid: React.FC<BentoGridProps> = ({ onNavigate }) => {
  return (
    <section className="py-24 px-4 bg-void relative z-20">
      <div className="container mx-auto">
        <div className="flex items-end justify-between mb-12 px-2">
          <h2 className="font-display text-4xl md:text-5xl text-offwhite">
            Curated <span className="text-muted italic font-script">Essentials</span>
          </h2>
          <button 
            onClick={() => onNavigate('collections')}
            className="hidden md:block font-ui text-sm text-luxury hover:text-white transition-colors uppercase tracking-widest border-b border-luxury/30 pb-1" 
            data-hover="true"
          >
            View All Collection
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 auto-rows-[300px] md:auto-rows-[350px]">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} onNavigate={onNavigate} />
          ))}
        </div>
      </div>
    </section>
  );
};