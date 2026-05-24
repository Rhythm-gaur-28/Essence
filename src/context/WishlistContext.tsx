import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Product, WishlistItem } from '@/types';
import toast from 'react-hot-toast';
import { useAuth } from "@/context/AuthContext";

interface WishlistContextType {
  wishlistItems: WishlistItem[];
  isInWishlist: (productId: number) => boolean;
  toggleWishlist: (product: Product) => void;
  removeFromWishlist: (productId: number) => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider = ({ children }: { children: ReactNode }) => {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setWishlistItems([]);
      return;
    }

    const token = localStorage.getItem("be_token");
    if (!token) return;

    fetch("http://localhost:5000/api/wishlist", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => {
        const formatted = data.map((p: Product) => ({
          id: p.id,
          product_id: p.id,
          product: p
        }));
        setWishlistItems(formatted);
      })
      .catch(() => setWishlistItems([]));

  }, [user]);

  const isInWishlist = (productId: number) =>
    wishlistItems.some(item => item.product_id === productId);

  const toggleWishlist = async (product: Product) => {
    const token = localStorage.getItem("be_token");
    if (!token) {
      toast.error("Login required");
      return;
    }

    if (isInWishlist(product.id)) {
      await fetch(`http://localhost:5000/api/wishlist/${product.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });

      setWishlistItems(prev =>
        prev.filter(item => item.product_id !== product.id)
      );

    } else {
      await fetch(`http://localhost:5000/api/wishlist/${product.id}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });

      setWishlistItems(prev => [
        ...prev,
        { id: Date.now(), product_id: product.id, product }
      ]);
    }
  };

  const removeFromWishlist = async (productId: number) => {
    const token = localStorage.getItem("be_token");
    if (!token) return;

    await fetch(`http://localhost:5000/api/wishlist/${productId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    });

    setWishlistItems(prev =>
      prev.filter(item => item.product_id !== productId)
    );
  };

  return (
    <WishlistContext.Provider value={{ wishlistItems, isInWishlist, toggleWishlist, removeFromWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
};