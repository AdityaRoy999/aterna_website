import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { PageHero } from './PageHero';
import { ArrowUpRight, ChevronDown, X, ShoppingBag, Star } from 'lucide-react';
import { Product } from '../types';
import { ParallaxBackground } from './ParallaxBackground';
import { useCart } from '../context/CartContext';
import { useBookmarks } from '../context/BookmarkContext';

import clockGold from '../src_images/clock_gold.png';
import clockSilver from '../src_images/clock_silver.png';
import clockOynx from '../src_images/clock_oynx.png';
import channel50 from '../src_images/channel_50.png';
import channel100 from '../src_images/channel_100.png';
import channel200 from '../src_images/channel_200.png';
import goldAbstract from '../src_images/gold_abstract.png';
import noirStan from '../src_images/noir_stan.png';
import noirMatte from '../src_images/noir_matte.png';
import goldChrono from '../src_images/gold_chrono.png';
import silverChrono from '../src_images/silver_chrono.png';
import oynxChrono from '../src_images/oynx_chrono.png';
import amb50 from '../src_images/amb50.png';
import amb100 from '../src_images/amb100.png';
import amb200 from '../src_images/amb200.png';
import pearlWhite from '../src_images/pearl_white.png';
import pearlGold from '../src_images/pearl_gold.png';
import pink from '../src_images/pink.png';
import shopBg from '../src_images/shop.png';

const shopProducts: Product[] = [
  {
    id: '1',
    name: 'Ulania Watch',
    price: 18100.00,
    category: 'Timepieces',
    imageUrl: clockGold,
    isNew: true,
    variantType: 'Finish',
    variants: [
      { name: 'Gold', imageUrl: clockGold, colorCode: '#E8CFA0' },
      { name: 'Silver', imageUrl: clockSilver, colorCode: '#C0C0C0' },
      { name: 'Onyx', imageUrl: clockOynx, colorCode: '#1A1A1A' }
    ]
  },
  {
    id: '2',
    name: 'Chanel No. 5',
    price: 259.00,
    category: 'Fragrance',
    imageUrl: channel50,
    variantType: 'Size',
    variants: [
      { name: '50ml', imageUrl: channel50 },
      { name: '100ml', imageUrl: channel100 },
      { name: '200ml', imageUrl: channel200 }
    ]
  },
  {
    id: '3',
    name: 'Gold Abstract',
    price: 1250.50,
    category: 'Jewelry',
    imageUrl: goldAbstract,
    variantType: 'Finish',
    variants: [
      { name: 'Gold', imageUrl: goldAbstract, colorCode: '#E8CFA0' },
      { name: 'Silver', imageUrl: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=1887&auto=format&fit=crop', colorCode: '#C0C0C0' }
    ]
  },
  {
    id: '4',
    name: 'Noir Elegance',
    price: 450.00,
    category: 'Accessories',
    imageUrl: noirStan,
    variantType: 'Style',
    variants: [
      { name: 'Standard', imageUrl: noirStan, colorCode: '#1A1A1A' },
      { name: 'Textured', imageUrl: noirMatte, colorCode: '#333333' }
    ]
  },
  {
    id: '5',
    name: 'Royal Chrono',
    price: 24500.00,
    category: 'Timepieces',
    imageUrl: goldChrono,
    variantType: 'Finish',
    variants: [
      { name: 'Gold', imageUrl: goldChrono, colorCode: '#E8CFA0' },
      { name: 'Silver', imageUrl: silverChrono, colorCode: '#C0C0C0' },
      { name: 'Onyx', imageUrl: oynxChrono, colorCode: '#1A1A1A' }
    ]
  },
  {
    id: '6',
    name: 'Amber Essence',
    price: 310.00,
    category: 'Fragrance',
    imageUrl: amb50,
    isNew: true,
    variantType: 'Size',
    variants: [
      { name: '50ml', imageUrl: amb50 },
      { name: '100ml', imageUrl: amb100 },
      { name: '200ml', imageUrl: amb200 }
    ]
  },
  {
    id: '7',
    name: 'Pearl Drop',
    price: 890.00,
    category: 'Jewelry',
    imageUrl: pearlWhite,
    variantType: 'Finish',
    variants: [
      { name: 'Gold', imageUrl: pearlGold, colorCode: '#E8CFA0' },
      { name: 'White', imageUrl: pearlWhite, colorCode: '#eeeae3ff' }
    ]
  },
  {
    id: '8',
    name: 'Pink Glow',
    price: 1200.00,
    category: 'Accessories',
    imageUrl: 'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?q=80&w=1000&auto=format&fit=crop',
    variantType: 'Style',
    variants: [
      { name: 'Standard', imageUrl: 'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?q=80&w=1000&auto=format&fit=crop', colorCode: '#b614b3ff' },
      { name: 'Matte', imageUrl: pink, colorCode: '#a40c9aff' }
    ]
  }
];

const categories = ['All', 'Timepieces', 'Fragrance', 'Jewelry', 'Accessories'];
type SortOption = 'default' | 'price-asc' | 'price-desc' | 'name-asc';

// Quick View Modal Component
const QuickViewModal: React.FC<{ product: Product; onClose: () => void }> = ({ product, onClose }) => {
  const [isClosing, setIsClosing] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState(product.variants?.[0]?.name || 'Gold');
  const { addToCart } = useCart();
  const { toggleBookmark, isBookmarked } = useBookmarks();

  const currentVariant = product.variants?.find(v => v.name === selectedVariant);
  const displayImage = currentVariant?.imageUrl || product.imageUrl;

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(onClose, 300); // Match animation duration
  };

  const handleAddToCart = () => {
    const productToAdd = { ...product, imageUrl: displayImage };
    addToCart(productToAdd, 1, selectedVariant);
    handleClose();
  };

  const isSaved = isBookmarked(product.id);

  return createPortal(
    <div className={`fixed inset-0 z-[100] flex items-center justify-center p-4 transition-opacity duration-300 ${isClosing ? 'opacity-0' : 'opacity-100'}`}>
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-void/90 backdrop-blur-md transition-opacity" 
        onClick={handleClose}
      />

      {/* Modal Card - Adjusted size */}
      <div className={`relative w-full max-w-4xl h-[85vh] md:h-[550px] bg-stone-900 rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl flex flex-col md:flex-row transform transition-all duration-500 ${isClosing ? 'scale-95 opacity-0' : 'scale-100 opacity-100 animate-slide-up'}`}>
        
        {/* Close Button */}
        <button 
          onClick={handleClose}
          className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-offwhite transition-colors backdrop-blur-md"
          data-hover="true"
        >
          <X size={16} />
        </button>

        {/* Left Column: Image */}
        <div className="w-full md:w-1/2 h-[35vh] md:h-full relative overflow-hidden bg-void">
          <img 
            src={displayImage} 
            alt={product.name} 
            className="w-full h-full object-cover transition-opacity duration-300"
            key={selectedVariant}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-transparent to-transparent opacity-50 md:hidden" />
          
          {/* New Tag */}
          {product.isNew && (
            <div className="absolute top-6 left-6 px-4 py-1.5 rounded-full bg-luxury text-void border border-luxury shadow-lg z-10">
              <span className="font-ui text-xs font-bold uppercase tracking-wider">New Arrival</span>
            </div>
          )}
        </div>

        {/* Right Column: Details */}
        <div className="w-full md:w-1/2 flex-1 md:h-full p-6 md:p-10 flex flex-col overflow-y-auto custom-scrollbar relative">
          
          {/* Header Info */}
          <div className="mb-auto">
             <div className="flex items-center gap-2 mb-3">
                <span className="font-ui text-[10px] text-luxury uppercase tracking-widest border border-luxury/30 px-2 py-0.5 rounded-full">{product.category}</span>
                <div className="flex items-center gap-1 text-luxury text-[10px]">
                  <Star size={10} fill="currentColor" />
                  <span className="font-ui font-medium">4.9</span>
                </div>
             </div>
             
             <h2 className="font-display text-3xl md:text-4xl text-offwhite mb-2 leading-tight">
               {product.name}
             </h2>
             
             <p className="font-ui text-xl text-luxury mb-6">
               ${product.price.toLocaleString()}
             </p>

             <p className="font-body text-offwhite/60 leading-relaxed text-sm mb-6">
               Meticulously crafted to embody the essence of AETERNA. This piece represents a harmonious blend of traditional artistry and contemporary design.
             </p>

             {/* Visual Variants */}
             {product.variants && (
               <div className="mb-6">
                 <span className="font-ui text-[10px] text-offwhite/40 uppercase tracking-widest block mb-2">
                   Select {product.variantType || 'Option'}
                 </span>
                 <div className="flex gap-3">
                   {product.variants.map(variant => (
                     <button
                       key={variant.name}
                       onClick={() => setSelectedVariant(variant.name)}
                       className={`
                         ${product.variantType === 'Size' ? 'px-3 py-1 border text-xs' : 'w-6 h-6 rounded-full border-2'} 
                         transition-all 
                         ${selectedVariant === variant.name 
                           ? (product.variantType === 'Size' ? 'bg-luxury text-void border-luxury' : 'border-white scale-110 ring-2 ring-white/10') 
                           : (product.variantType === 'Size' ? 'border-white/20 text-offwhite hover:border-white/40' : 'border-white/20 hover:border-white/40')}
                       `}
                       style={product.variantType !== 'Size' ? { backgroundColor: variant.colorCode } : {}}
                       data-hover="true"
                       title={variant.name}
                     >
                       {product.variantType === 'Size' ? variant.name : ''}
                     </button>
                   ))}
                 </div>
               </div>
             )}
          </div>

          {/* Actions */}
          <div className="mt-4 pt-6 border-t border-white/5 flex flex-col sm:flex-row gap-3">
            <button 
              onClick={handleAddToCart}
              className="flex-1 bg-luxury text-void font-ui font-bold text-xs uppercase tracking-widest py-3.5 rounded-lg hover:bg-white transition-all duration-300 flex items-center justify-center gap-2 group shadow-[0_0_20px_rgba(232,207,160,0.2)]" 
              data-hover="true"
            >
              <ShoppingBag size={16} className="transition-transform group-hover:-translate-y-0.5" />
              Add to Cart
            </button>
            <button 
              onClick={() => toggleBookmark(product.id)}
              className={`px-5 py-3.5 border rounded-lg transition-colors ${isSaved ? 'bg-luxury/20 border-luxury text-luxury' : 'border-white/10 text-offwhite hover:bg-white/5'}`} 
              data-hover="true"
              title={isSaved ? "Remove from Wishlist" : "Add to Wishlist"}
            >
               <span className="sr-only">Wishlist</span>
               <Star size={18} fill={isSaved ? "currentColor" : "none"} className={isSaved ? "text-luxury" : "text-offwhite/50 hover:text-luxury transition-colors"} />
            </button>
          </div>

        </div>
      </div>
    </div>,
    document.body
  );
};

interface ShopProps {
  initialProductId?: string;
}

export const Shop: React.FC<ShopProps> = ({ initialProductId }) => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [sortOption, setSortOption] = useState<SortOption>('default');
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Effect to handle initial product selection from navigation params
  useEffect(() => {
    if (initialProductId) {
      const product = shopProducts.find(p => p.id === initialProductId);
      if (product) {
        setSelectedProduct(product);
      }
    }
  }, [initialProductId]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (selectedProduct) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [selectedProduct]);

  // Filtering and Sorting Logic
  const filteredProducts = useMemo(() => {
    let filtered = activeCategory === 'All' 
      ? [...shopProducts] 
      : shopProducts.filter(p => p.category === activeCategory);

    switch (sortOption) {
      case 'price-asc':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'name-asc':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        break;
    }
    return filtered;
  }, [activeCategory, sortOption]);

  const handleSortChange = (option: SortOption) => {
    setSortOption(option);
    setIsSortOpen(false);
  };

  return (
    <div className="min-h-screen bg-void/50 pt-24 md:pt-0 animate-fade-in relative z-10">
      
      {/* Quick View Modal */}
      {selectedProduct && (
        <QuickViewModal 
          product={selectedProduct} 
          onClose={() => setSelectedProduct(null)} 
        />
      )}

      <PageHero 
        title="THE SHOP" 
        subtitle="Acquire the exceptional."
        bgImage={shopBg}
      />
      
      <section className="py-20 px-6 max-w-[1600px] mx-auto">
        {/* Toolbar */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-16 gap-8 border-b border-white/5 pb-8">
          
          {/* Filters */}
          <div className="flex flex-wrap gap-4">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`font-ui text-xs uppercase tracking-widest px-6 py-3 rounded-full border transition-all duration-300 ${
                  activeCategory === cat 
                    ? 'bg-luxury text-void border-luxury font-bold' 
                    : 'bg-transparent text-offwhite/60 border-white/10 hover:border-luxury hover:text-luxury'
                }`}
                data-hover="true"
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Sort / View */}
          <div className="relative flex items-center gap-6 z-20">
            <div className="relative">
              <button 
                onClick={() => setIsSortOpen(!isSortOpen)}
                className="flex items-center gap-2 font-ui text-xs uppercase tracking-widest text-offwhite/60 hover:text-luxury transition-colors bg-transparent border-none"
                data-hover="true"
              >
                Sort by <ChevronDown size={14} className={`transition-transform duration-300 ${isSortOpen ? 'rotate-180' : ''}`}/>
              </button>
              
              {isSortOpen && (
                <div className="absolute right-0 mt-4 w-48 bg-stone-900/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl py-2 flex flex-col overflow-hidden animate-slide-up origin-top-right">
                  {[
                    { label: 'Featured', value: 'default' },
                    { label: 'Price: Low to High', value: 'price-asc' },
                    { label: 'Price: High to Low', value: 'price-desc' },
                    { label: 'Name: A-Z', value: 'name-asc' },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => handleSortChange(opt.value as SortOption)}
                      className={`text-left px-6 py-3 text-sm font-body transition-colors hover:bg-white/5 ${sortOption === opt.value ? 'text-luxury' : 'text-offwhite/70'}`}
                      data-hover="true"
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product, index) => (
              <div 
                key={product.id} 
                className="group relative animate-slide-up"
                style={{ animationDelay: `${index * 50}ms` }}
                data-hover="true"
              >
                <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-stone-900 mb-6">
                  <ParallaxBackground 
                    src={product.imageUrl} 
                    alt={product.name}
                    className="transition-transform duration-700 group-hover:scale-110 opacity-90 group-hover:opacity-100 cursor-pointer"
                    onClick={() => setSelectedProduct(product)}
                  />
                  
                  {product.isNew && (
                    <div className="absolute top-4 left-4 px-3 py-1 bg-luxury text-void font-ui text-[10px] font-bold uppercase tracking-wider rounded-full pointer-events-none z-10">
                      New
                    </div>
                  )}

                  {/* Quick View Button */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-black/20 pointer-events-none z-10">
                     <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedProduct(product);
                        }}
                        className="pointer-events-auto bg-white/10 backdrop-blur-md text-white font-ui text-xs uppercase tracking-widest px-6 py-3 rounded-full border border-white/20 hover:bg-luxury hover:text-void hover:border-luxury transition-all transform translate-y-4 group-hover:translate-y-0 duration-200 ease-out shadow-xl" 
                        data-hover="true"
                     >
                       Quick View
                     </button>
                  </div>
                </div>

                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-display text-xl text-offwhite mb-1 group-hover:text-luxury transition-colors cursor-pointer" onClick={() => setSelectedProduct(product)}>{product.name}</h3>
                    <p className="font-ui text-xs text-offwhite/50 uppercase tracking-wider mb-2">{product.category}</p>
                    <p className="font-ui font-medium text-luxury">${product.price.toLocaleString()}</p>
                  </div>
                  <button className="text-offwhite/40 hover:text-luxury transition-colors group/btn" data-hover="true">
                    <ArrowUpRight size={20} className="transition-transform duration-300 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-4 flex flex-col items-center justify-center py-20 text-offwhite/40">
              <p className="font-display text-2xl mb-2">No treasures found.</p>
              <p className="font-body text-sm">Try adjusting your filters to discover our collection.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};