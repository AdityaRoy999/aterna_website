import React, { createContext, useContext, useState, useEffect } from 'react';

interface BookmarkContextType {
  bookmarkedIds: string[];
  toggleBookmark: (id: string) => void;
  isBookmarked: (id: string) => boolean;
}

const BookmarkContext = createContext<BookmarkContextType | undefined>(undefined);

export const BookmarkProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);

  // Load from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem('aeterna_bookmarks');
    if (saved) {
      try {
        setBookmarkedIds(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse bookmarks', e);
      }
    }
  }, []);

  // Save to local storage on change
  useEffect(() => {
    localStorage.setItem('aeterna_bookmarks', JSON.stringify(bookmarkedIds));
  }, [bookmarkedIds]);

  const toggleBookmark = (id: string) => {
    setBookmarkedIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(itemId => itemId !== id);
      } else {
        return [...prev, id];
      }
    });
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