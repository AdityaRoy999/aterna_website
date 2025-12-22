import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { PageHero } from './PageHero';
import { ArrowUpRight, ChevronDown, ShoppingBag, Star, MessageSquare } from 'lucide-react';
import { X } from '@/components/ui/icons/x';
import { Product } from '../types';
import { ParallaxBackground } from './ParallaxBackground';
import { useCart } from '../context/CartContext';
import { useBookmarks } from '../context/BookmarkContext';
import { Reviews } from './Reviews';
import { supabase } from '../src/supabaseClient';

// import { shopProducts } from './productData'; // Removed in favor of Supabase
const shopBg = '/images/shop.png';

type SortOption = 'default' | 'price-asc' | 'price-desc' | 'name-asc';

// Quick View Modal Component
const QuickViewModal: React.FC<{ product: Product; onClose: () => void }> = ({ product, onClose }) => {
  const [isClosing, setIsClosing] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState(product.variants?.[0]?.name || 'Gold');
  const [activeTab, setActiveTab] = useState<'details' | 'reviews'>('details');
  const { addToCart } = useCart();
  const { toggleBookmark, isBookmarked } = useBookmarks();

  const currentVariant = product.variants?.find(v => v.name === selectedVariant);
  const displayImage = currentVariant?.imageUrl || product.imageUrl;

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(onClose, 300); // Match animation duration
  };

  const handleAddToCart = () => {
    // Determine the effective price: use variant price if set, otherwise product base price
    const effectivePrice = currentVariant?.price || product.price;
    // Create a product object that includes the specific price so the CartContext can use it immediately if needed,
    // although CartContext logic often re-fetches or recalculates. We'll ensure CartContext handles this.
    // We override the price in the object we pass to addToCart.
    const productToAdd = { ...product, imageUrl: displayImage, price: effectivePrice };
    
    addToCart(productToAdd, 1, selectedVariant);
    // Close modal after adding to cart to return to page state and allow card to disappear
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
          <X size={16} animateOnHover />
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
        <div 
          className="w-full md:w-1/2 flex-1 md:h-full p-6 md:p-10 flex flex-col overflow-y-auto custom-scrollbar relative"
          data-lenis-prevent="true"
        >
          
          {/* Tabs */}
          <div className="flex gap-6 mb-6 border-b border-white/5 pb-4">
            <button
              onClick={() => setActiveTab('details')}
              className={`text-sm uppercase tracking-widest transition-colors pb-1 relative ${
                activeTab === 'details' ? 'text-luxury' : 'text-white/40 hover:text-white'
              }`}
            >
              Details
              {activeTab === 'details' && <span className="absolute bottom-[-17px] left-0 w-full h-[1px] bg-luxury" />}
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`text-sm uppercase tracking-widest transition-colors pb-1 relative ${
                activeTab === 'reviews' ? 'text-luxury' : 'text-white/40 hover:text-white'
              }`}
            >
              Reviews
              {activeTab === 'reviews' && <span className="absolute bottom-[-17px] left-0 w-full h-[1px] bg-luxury" />}
            </button>
          </div>

          {activeTab === 'details' ? (
            <>
              {/* Header Info */}
              <div className="mb-auto animate-fade-in">
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
                   ${(currentVariant?.price || product.price).toLocaleString()}
                 </p>

                 <p className="font-body text-offwhite/60 leading-relaxed text-sm mb-6">
                   {currentVariant?.description || product.description || "Meticulously crafted to embody the essence of AETERNA. This piece represents a harmonious blend of traditional artistry and contemporary design."}
                 </p>

                 {/* Visual Variants */}
                 {product.variants && (
                   <div className="mb-6">
                     <span className="font-ui text-[10px] text-offwhite/40 uppercase tracking-widest block mb-2">
                       Select {product.variantType === 'Size' ? 'Quantity' : (product.variantType || 'Option')}
                     </span>
                     <div className="flex gap-3">
                       {product.variants.map(variant => (
                         <button
                           key={variant.name}
                           onClick={() => setSelectedVariant(variant.name)}
                           className={`
                             ${product.variantType === 'Size' ? 'px-4 py-2 border text-xs rounded-md' : 'w-6 h-6 rounded-full border-2'} 
                             transition-all 
                             ${selectedVariant === variant.name 
                               ? (product.variantType === 'Size' ? 'bg-luxury text-void border-luxury font-bold' : 'border-white scale-110 ring-2 ring-white/10') 
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
                   
                   {/* Stock Status for Modal */}
                   {product.quantity !== undefined && product.quantity <= 10 && product.quantity > 0 && (
                     <p className={`text-xs font-bold uppercase tracking-wider mb-4 ${product.quantity === 1 ? 'text-red-500' : 'text-orange-500'}`}>
                       {product.quantity === 1 ? 'Only 1 item left in stock' : `Only few pieces left (${product.quantity})`}
                     </p>
                   )}
                   {product.quantity === 0 && (
                      <p className="text-xs font-bold uppercase tracking-wider mb-4 text-red-500">
                        Out of Stock
                      </p>
                   )}
                   
              </div>

              {/* Actions */}
              <div className="mt-4 pt-6 border-t border-white/5 flex flex-col sm:flex-row gap-3 animate-fade-in">
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
            </>
          ) : (
            <Reviews productId={product.id} />
          )}

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
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [sortOption, setSortOption] = useState<SortOption>('default');
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showBookmarkedOnly, setShowBookmarkedOnly] = useState(false);
  const { bookmarkedIds } = useBookmarks();

  // Derive categories from products
  const categories = useMemo(() => {
    const uniqueCategories = Array.from(new Set(products.map(p => p.category)));
    return ['All', ...uniqueCategories.sort()];
  }, [products]);

  // Fetch products from Supabase
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*');
        
        if (error) throw error;

        if (data) {
          // Client-side deduplication and merging of variants
          const productMap = new Map<string, Product>();

          data.forEach(p => {
            const normalizedName = p.name.trim(); // Normalize name
            const existing = productMap.get(normalizedName);
            
            const currentVariant = {
              name: p.color || 'Standard',
              imageUrl: p.image_url,
              colorCode: '#000000', // Default
              description: p.description,
              price: undefined // Base variant usually inherits base price, but can be explicit
            };

            // Parse existing variants from DB (if any)
            let dbVariants: any[] = [];
            if (Array.isArray(p.variants)) {
              dbVariants = p.variants;
            } else if (typeof p.variants === 'string') {
              try {
                dbVariants = JSON.parse(p.variants);
              } catch (e) {
                dbVariants = [];
              }
            }

            // If this row has no explicit variants but has a color, treat itself as a variant
            if (dbVariants.length === 0 && p.color) {
               dbVariants.push(currentVariant);
            }

            if (existing) {
              // Merge variants
              const existingVariants = existing.variants || [];
              const newVariants = dbVariants.length > 0 ? dbVariants : [currentVariant];
              
              // Combine and deduplicate by variant name
              const combined = [...existingVariants, ...newVariants];
              const uniqueVariants = Array.from(new Map(combined.map(v => [v.name, v])).values());
              
              existing.variants = uniqueVariants;
              productMap.set(normalizedName, existing);
            } else {
              // Create new entry
              productMap.set(normalizedName, {
                id: p.id,
                name: p.name, // Keep original casing for display
                price: p.price,
                category: p.category,
                imageUrl: p.image_url,
                description: p.description,
                color: p.color,
                isNew: p.is_new,
                variantType: p.variant_type || 'Color',
                variants: dbVariants.length > 0 ? dbVariants : [currentVariant]
              });
            }
          });

          setProducts(Array.from(productMap.values()));
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Effect to handle initial product selection from navigation params
  useEffect(() => {
    if (initialProductId && products.length > 0) {
      const product = products.find(p => p.id === initialProductId);
      if (product) {
        setSelectedProduct(product);
      }
    }
  }, [initialProductId, products]);

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
      ? [...products] 
      : products.filter(p => p.category === activeCategory);

    if (showBookmarkedOnly) {
      filtered = filtered.filter(p => bookmarkedIds.includes(p.id));
    }

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
  }, [activeCategory, sortOption, showBookmarkedOnly, bookmarkedIds, products]);

  

  const handleSortChange = (option: SortOption) => {
    setSortOption(option);
    setIsSortOpen(false);
  };

  return (
    <div className="min-h-screen bg-void/50 animate-fade-in relative z-10">
      
      {/* Loading State */}
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-void/80 backdrop-blur-sm">
          <div className="w-12 h-12 border-2 border-luxury border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

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
            <button 
              onClick={() => setShowBookmarkedOnly(!showBookmarkedOnly)}
              className={`flex items-center gap-2 font-ui text-xs uppercase tracking-widest transition-colors bg-transparent border-none ${showBookmarkedOnly ? 'text-luxury' : 'text-offwhite/60 hover:text-luxury'}`}
              data-hover="true"
              title="Show Bookmarked"
            >
              <Star size={14} fill={showBookmarkedOnly ? "currentColor" : "none"} />
              <span className="hidden sm:inline">Saved</span>
            </button>

            <div className="w-px h-4 bg-white/10"></div>

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
                className="group relative"
                data-hover="true"
                data-aos="fade-up"
                data-aos-delay={index * 50}
              >
                <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-stone-900 mb-6">
                  <ParallaxBackground 
                    src={product.imageUrl} 
                    alt={product.name}
                    className={`transition-transform duration-700 group-hover:scale-110 opacity-90 group-hover:opacity-100 cursor-pointer ${product.quantity === 0 ? 'grayscale' : ''}`}
                    onClick={() => product.quantity !== 0 && setSelectedProduct(product)}
                  />
                  
                  {product.isNew && product.quantity !== 0 && (
                    <div className="absolute top-4 left-4 px-3 py-1 bg-luxury text-void font-ui text-[10px] font-bold uppercase tracking-wider rounded-full pointer-events-none z-10">
                      New
                    </div>
                  )}

                  {product.quantity === 0 && (
                     <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-10 pointer-events-none">
                        <span className="font-display text-xl text-white uppercase tracking-widest border-2 border-white px-6 py-2">Out of Stock</span>
                     </div>
                  )}

                  {/* Stock Warnings for Grid */}
                  {product.quantity !== undefined && product.quantity > 0 && product.quantity <= 10 && (
                    <div className="absolute bottom-4 left-4 right-4 z-10">
                       <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-sm ${product.quantity === 1 ? 'bg-red-500 text-white' : 'bg-orange-500 text-white'}`}>
                          {product.quantity === 1 ? 'Only 1 item left' : 'Few pieces left'}
                       </span>
                    </div>
                  )}

                  {/* Quick View Button */}
                  {product.quantity !== 0 && (
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
                  )}
                </div>

                <div className="flex justify-between items-start">
                  <div>
                    <h3 className={`font-display text-xl mb-1 transition-colors cursor-pointer ${product.quantity === 0 ? 'text-offwhite/40 cursor-not-allowed' : 'text-offwhite group-hover:text-luxury'}`} onClick={() => product.quantity !== 0 && setSelectedProduct(product)}>{product.name}</h3>
                    <p className="font-ui text-xs text-offwhite/50 uppercase tracking-wider mb-2">{product.category}</p>
                    <p className={`font-ui font-medium ${product.quantity === 0 ? 'text-offwhite/40 decoration-line-through' : 'text-luxury'}`}>${product.price.toLocaleString()}</p>
                  </div>
                  {product.quantity !== 0 && (
                    <button className="text-offwhite/40 hover:text-luxury transition-colors group/btn" data-hover="true">
                      <ArrowUpRight size={20} className="transition-transform duration-300 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
                    </button>
                  )}
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