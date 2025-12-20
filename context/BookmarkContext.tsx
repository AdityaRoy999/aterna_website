import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../src/supabaseClient';

interface BookmarkContextType {
  bookmarkedIds: string[];
  toggleBookmark: (id: string) => void;
  isBookmarked: (id: string) => boolean;
}

const BookmarkContext = createContext<BookmarkContextType | undefined>(undefined);

export const BookmarkProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);
  const { user } = useAuth();

  // Load from local storage on mount (if not logged in)
  useEffect(() => {
    if (!user) {
      const saved = localStorage.getItem('aeterna_bookmarks');
      if (saved) {
        try {
          setBookmarkedIds(JSON.parse(saved));
        } catch (e) {
          console.error('Failed to parse bookmarks', e);
        }
      }
    }
  }, [user]);

  // Sync with Supabase when user logs in
  useEffect(() => {
    const fetchAndMergeBookmarks = async () => {
      if (!user) return;
      
      // 1. Fetch server bookmarks
      const { data, error } = await supabase
        .from('wishlist')
        .select('product_id')
        .eq('user_id', user.id);
        
      if (error) {
        console.error('Error fetching wishlist:', error);
        return;
      }
      
      const serverIds = data ? data.map((item: any) => item.product_id) : [];
      
      // 2. Merge with local bookmarks (that might have been added before login)
      const localIds = JSON.parse(localStorage.getItem('aeterna_bookmarks') || '[]');
      const mergedIds = [...new Set([...serverIds, ...localIds])];
      
      setBookmarkedIds(mergedIds);
      
      // 3. Sync back to server (add any local-only bookmarks to server)
      const newToSync = localIds.filter((id: string) => !serverIds.includes(id));
      if (newToSync.length > 0) {
          const updates = newToSync.map((id: string) => ({
              user_id: user.id,
              product_id: id
          }));
          const { error: syncError } = await supabase.from('wishlist').upsert(updates, { onConflict: 'user_id, product_id' });
          if (syncError) console.error('Error syncing local bookmarks to server:', syncError);
      }
    };
    
    fetchAndMergeBookmarks();
  }, [user]);

  // Save to local storage on change (backup)
  useEffect(() => {
    localStorage.setItem('aeterna_bookmarks', JSON.stringify(bookmarkedIds));
  }, [bookmarkedIds]);

  const toggleBookmark = async (id: string) => {
    const isCurrentlyBookmarked = bookmarkedIds.includes(id);
    
    // Optimistic update
    setBookmarkedIds(prev => {
      if (isCurrentlyBookmarked) {
        return prev.filter(itemId => itemId !== id);
      } else {
        return [...prev, id];
      }
    });

    if (user) {
      if (isCurrentlyBookmarked) {
        // Remove from server
        const { error } = await supabase
          .from('wishlist')
          .delete()
          .match({ user_id: user.id, product_id: id });
          
        if (error) console.error('Error removing from wishlist:', error);
      } else {
        // Add to server
        const { error } = await supabase
          .from('wishlist')
          .insert({ user_id: user.id, product_id: id });
          
        if (error) console.error('Error adding to wishlist:', error);
      }
    }
  };

  const isBookmarked = (id: string) => bookmarkedIds.includes(id);

  return (
    <BookmarkContext.Provider value={{ bookmarkedIds, toggleBookmark, isBookmarked }}>
      {children}
    </BookmarkContext.Provider>
  );
};

export const useBookmarks = () => {
  const context = useContext(BookmarkContext);
  if (context === undefined) {
    throw new Error('useBookmarks must be used within a BookmarkProvider');
  }
  return context;
};