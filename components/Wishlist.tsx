import React from 'react';
import { PageHero } from './PageHero';
import { useBookmarks } from '../context/BookmarkContext';
import { useCart } from '../context/CartContext';
import { shopProducts } from './productData';
import { Trash2, ShoppingBag, Heart } from 'lucide-react';
import { ArrowRight } from '@/components/ui/icons/arrow-right';

interface WishlistProps {
  onNavigate: (page: string, params?: any) => void;
}

export const Wishlist: React.FC<WishlistProps> = ({ onNavigate }) => {
  const { bookmarkedIds, toggleBookmark } = useBookmarks();
  const { addToCart } = useCart();

  const wishlistItems = shopProducts.filter(product => bookmarkedIds.includes(product.id));

  const handleAddToCart = (product: any) => {
    addToCart(product, 1, product.variants?.[0]?.name || 'Standard');
  };

  return (
    <div className="min-h-screen bg-void animate-fade-in">
      <PageHero 
        title="PRIVATE COLLECTION" 
        subtitle="Your curated selection of exceptional pieces."
        bgImage="https://images.unsplash.com/photo-1515377905703-c4788e51af15?q=80&w=2000&auto=format&fit=crop"
      />
      
      <section className="py-24 px-6 max-w-7xl mx-auto">
        {wishlistItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-20">
            <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center text-offwhite/20 mb-8">
              <Heart size={48} />
            </div>
            <h2 className="font-display text-3xl text-offwhite mb-4">Your collection is empty</h2>
            <p className="font-body text-offwhite/60 max-w-md mb-8">
              Discover our timepieces and fragrances to curate your personal wishlist.
            </p>
            <button 
              onClick={() => onNavigate('shop')}
              className="bg-luxury text-void px-8 py-3 rounded-lg font-ui font-bold text-sm uppercase tracking-widest hover:bg-white transition-all duration-300 flex items-center gap-2"
            >
              Explore Collection <ArrowRight size={16} animation="pointing" animateOnHover />
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {wishlistItems.map((product) => (
              <div 
                key={product.id}
                className="group bg-stone-900/30 border border-white/5 rounded-2xl overflow-hidden hover:border-luxury/30 transition-all duration-500"
              >
                {/* Image Container */}
                <div className="relative aspect-[4/5] overflow-hidden bg-white/5">
                  <img 
                    src={product.imageUrl} 
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  
                  {/* Overlay Actions */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4">
                    <button
                      onClick={() => handleAddToCart(product)}
                      className="w-12 h-12 rounded-full bg-luxury text-void flex items-center justify-center hover:bg-white transition-colors transform translate-y-4 group-hover:translate-y-0 duration-300 delay-100"
                      title="Add to Cart"
                    >
                      <ShoppingBag size={20} />
                    </button>
                    <button
                      onClick={() => toggleBookmark(product.id)}
                      className="w-12 h-12 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-red-500/20 hover:text-red-400 transition-colors transform translate-y-4 group-hover:translate-y-0 duration-300 delay-200 backdrop-blur-md"
                      title="Remove from Wishlist"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-ui text-[10px] uppercase tracking-widest text-luxury mb-1">{product.category}</p>
                      <h3 className="font-display text-xl text-offwhite">{product.name}</h3>
                    </div>
                    <p className="font-body text-offwhite/80">${product.price.toLocaleString()}</p>
                  </div>
                  
                  <button 
                    onClick={() => onNavigate('shop', { productId: product.id })}
                    className="mt-4 text-xs font-ui uppercase tracking-widest text-offwhite/40 hover:text-luxury transition-colors flex items-center gap-2"
                  >
                    View Details <ArrowRight size={12} animation="pointing" animateOnHover />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
