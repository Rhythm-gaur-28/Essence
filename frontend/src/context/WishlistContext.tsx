import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Product, WishlistItem } from '@/types';
import toast from 'react-hot-toast';

interface WishlistContextType {
  wishlistItems: WishlistItem[];
  isInWishlist: (productId: number) => boolean;
  toggleWishlist: (product: Product) => void;
  removeFromWishlist: (productId: number) => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider = ({ children }: { children: ReactNode }) => {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);

  const isInWishlist = (productId: number) => wishlistItems.some(item => item.product_id === productId);

  const toggleWishlist = (product: Product) => {
    if (isInWishlist(product.id)) {
      setWishlistItems(prev => prev.filter(item => item.product_id !== product.id));
      toast.success('Removed from wishlist');
    } else {
      setWishlistItems(prev => [...prev, { id: Date.now(), product_id: product.id, product }]);
      toast.success('Added to wishlist');
    }
  };

  const removeFromWishlist = (productId: number) => {
    setWishlistItems(prev => prev.filter(item => item.product_id !== productId));
    toast.success('Removed from wishlist');
  };

  return (
    <WishlistContext.Provider value={{ wishlistItems, isInWishlist, toggleWishlist, removeFromWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider');
  return ctx;
};
