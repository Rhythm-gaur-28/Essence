import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product, WishlistItem } from '@/types';
import { wishlistAPI } from '@/lib/api';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

interface WishlistContextType {
  wishlistItems: WishlistItem[];
  isLoading: boolean;
  isInWishlist: (productId: number) => boolean;
  toggleWishlist: (product: Product) => Promise<void>;
  removeFromWishlist: (productId: number) => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider = ({ children }: { children: ReactNode }) => {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated } = useAuth();

  // Fetch wishlist from backend
  useEffect(() => {
    if (isAuthenticated) {
      loadWishlist();
    } else {
      setWishlistItems([]);
    }
  }, [isAuthenticated]);

  const loadWishlist = async () => {
    try {
      setIsLoading(true);
      const data = await wishlistAPI.getAll();
      setWishlistItems(data);
    } catch (error: any) {
      console.error('Failed to load wishlist:', error);
      // Fail silently
    } finally {
      setIsLoading(false);
    }
  };

  const isInWishlist = (productId: number) => wishlistItems.some(item => item.product.id === productId);

  const toggleWishlist = async (product: Product) => {
    try {
      if (isInWishlist(product.id)) {
        await removeFromWishlist(product.id);
      } else {
        await wishlistAPI.add(product.id);
        setWishlistItems(prev => [...prev, { id: Date.now(), product_id: product.id, product }]);
        toast.success('Added to wishlist');
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to update wishlist';
      toast.error(message);
    }
  };

  const removeFromWishlist = async (productId: number) => {
    try {
      await wishlistAPI.remove(productId);
      setWishlistItems(prev => prev.filter(item => item.product.id !== productId));
      toast.success('Removed from wishlist');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to remove from wishlist';
      toast.error(message);
    }
  };

  return (
    <WishlistContext.Provider value={{ wishlistItems, isLoading, isInWishlist, toggleWishlist, removeFromWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider');
  return ctx;
};
