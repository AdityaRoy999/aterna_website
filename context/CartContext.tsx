import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, CartItem } from '../types';
import { useAuth } from './AuthContext';
import { supabase } from '../src/supabaseClient';

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number, color?: string) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  clearLocalCart: () => void;
  cartTotal: number;
  itemCount: number;
  isCartOpen: boolean;
  setIsCartOpen: (isOpen: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { user } = useAuth();

  // Load cart from local storage on mount (only if not logged in initially)
  useEffect(() => {
    if (!user) {
      const savedCart = localStorage.getItem('aeterna_cart');
      if (savedCart) {
        try {
          setItems(JSON.parse(savedCart));
        } catch (e) {
          console.error('Failed to parse cart', e);
        }
      }
    }
  }, [user]);

  // Sync with Supabase when user logs in
  useEffect(() => {
    if (user) {
      fetchServerCart();
    }
  }, [user]);

  // Save cart to local storage whenever it changes (backup)
  useEffect(() => {
    localStorage.setItem('aeterna_cart', JSON.stringify(items));
  }, [items]);

  const fetchServerCart = async () => {
    if (!user) return;
    try {
      // 1. Fetch Cart Items
      const { data: cartData, error: cartError } = await supabase
        .from('cart_items')
        .select('*')
        .eq('user_id', user.id);

      if (cartError) throw cartError;

      if (cartData && cartData.length > 0) {
        // 2. Get unique product IDs
        const productIds = [...new Set(cartData.map((item: any) => item.product_id))];

        // 3. Fetch Product Details from Supabase
        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select('*')
          .in('id', productIds);

        if (productsError) throw productsError;

        // 4. Map Cart Items with Product Details
        const serverItems: CartItem[] = cartData.map((item: any) => {
          const product = productsData?.find(p => p.id === item.product_id);
          if (!product) return null;

          // Parse variants if needed (similar to Shop.tsx logic)
          let variants = [];
          try {
             variants = typeof product.variants === 'string' ? JSON.parse(product.variants) : product.variants;
          } catch (e) { variants = []; }

          return {
            id: `${item.product_id}-${item.variant_name}`, // Reconstruct unique ID
            name: product.name,
            price: product.price,
            category: product.category,
            imageUrl: product.image_url,
            description: product.description,
            isNew: product.is_new,
            variants: variants,
            variantType: product.variant_type,
            quantity: item.quantity,
            selectedColor: item.variant_name
          };
        }).filter(Boolean) as CartItem[];

        setItems(serverItems);
      } else if (items.length > 0) {
        // If server is empty but local has items, sync local to server
        items.forEach(item => syncItemToServer(item));
      }
    } catch (error) {
      console.error('Error fetching server cart:', error);
    }
  };

  const syncItemToServer = async (item: CartItem) => {
    if (!user) return;
    const originalProductId = item.id.includes('-') ? item.id.split('-')[0] : item.id;

    await supabase.from('cart_items').upsert({
      user_id: user.id,
      product_id: originalProductId,
      variant_name: item.selectedColor,
      quantity: item.quantity
    }, { onConflict: 'user_id, product_id, variant_name' });
  };

  const removeItemFromServer = async (productId: string, variantName: string) => {
    if (!user) return;
    await supabase.from('cart_items').delete().match({
      user_id: user.id,
      product_id: productId,
      variant_name: variantName
    });
  };

  const addToCart = (product: Product, quantity = 1, color = 'Gold') => {
    setItems(prev => {
      const uniqueId = `${product.id}-${color}`;
      const existing = prev.find(item => item.id === uniqueId);
      let newItems;
      
      if (existing) {
        newItems = prev.map(item => 
          item.id === uniqueId 
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        newItems = [...prev, { ...product, id: uniqueId, quantity, selectedColor: color }];
      }
      
      // Sync to server
      if (user) {
        const itemToSync = newItems.find(i => i.id === uniqueId);
        if (itemToSync) syncItemToServer(itemToSync);
      }
      
      return newItems;
    });
  };

  const removeFromCart = (uniqueId: string) => {
    setItems(prev => {
      const item = prev.find(i => i.id === uniqueId);
      if (item && user) {
        const originalId = uniqueId.includes('-') ? uniqueId.split('-')[0] : uniqueId;
        removeItemFromServer(originalId, item.selectedColor || 'Gold');
      }
      return prev.filter(item => item.id !== uniqueId);
    });
  };

  const updateQuantity = (uniqueId: string, quantity: number) => {
    if (quantity < 1) {
      removeFromCart(uniqueId);
      return;
    }
    setItems(prev => {
      const newItems = prev.map(item => 
        item.id === uniqueId ? { ...item, quantity } : item
      );
      
      if (user) {
        const item = newItems.find(i => i.id === uniqueId);
        if (item) syncItemToServer(item);
      }
      
      return newItems;
    });
  };

  const clearCart = async () => {
    setItems([]);
    if (user) {
      await supabase.from('cart_items').delete().eq('user_id', user.id);
    }
  };

  const clearLocalCart = () => {
    setItems([]);
    localStorage.removeItem('aeterna_cart');
  };

  const cartTotal = items.reduce((total, item) => total + (item.price * item.quantity), 0);
  const itemCount = items.reduce((count, item) => count + item.quantity, 0);

  return (
    <CartContext.Provider value={{
      items,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      clearLocalCart,
      cartTotal,
      itemCount,
      isCartOpen,
      setIsCartOpen
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};