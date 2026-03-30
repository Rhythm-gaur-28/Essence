import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CartItem, Product } from '@/types';
import { cartAPI, couponAPI } from '@/lib/api';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

interface CartContextType {
  cartItems: CartItem[];
  cartCount: number;
  cartTotal: number;
  isLoading: boolean;
  addToCart: (product: Product, qty?: number) => Promise<void>;
  removeFromCart: (cartItemId: number) => Promise<void>;
  updateQty: (cartItemId: number, qty: number) => Promise<void>;
  clearCart: () => void;
  appliedCoupon: { code: string; discount_percent: number } | null;
  applyCoupon: (code: string) => Promise<boolean>;
  removeCoupon: () => void;
  discountAmount: number;
  finalTotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount_percent: number } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated } = useAuth();

  // Fetch cart from backend
  useEffect(() => {
    if (isAuthenticated) {
      loadCart();
    } else {
      setCartItems([]);
    }
  }, [isAuthenticated]);

  const loadCart = async () => {
    try {
      setIsLoading(true);
      const data = await cartAPI.getAll();
      setCartItems(data);
    } catch (error: any) {
      console.error('Failed to load cart:', error);
      // Fail silently
    } finally {
      setIsLoading(false);
    }
  };

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cartItems.reduce((sum, item) => sum + (item.product.discount_price || item.product.price) * item.quantity, 0);
  const discountAmount = appliedCoupon ? Math.round(cartTotal * appliedCoupon.discount_percent / 100) : 0;
  const finalTotal = cartTotal - discountAmount;

  const addToCart = async (product: Product, qty = 1) => {
    try {
      await cartAPI.add(product.id, qty);
      await loadCart();
      toast.success('Added to cart');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to add to cart';
      toast.error(message);
    }
  };

  const removeFromCart = async (cartItemId: number) => {
    try {
      await cartAPI.remove(cartItemId);
      setCartItems(prev => prev.filter(item => item.id !== cartItemId));
      toast.success('Removed from cart');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to remove from cart';
      toast.error(message);
    }
  };

  const updateQty = async (cartItemId: number, qty: number) => {
    if (qty < 1) return removeFromCart(cartItemId);
    try {
      await cartAPI.update(cartItemId, qty);
      setCartItems(prev => prev.map(item => item.id === cartItemId ? { ...item, quantity: qty } : item));
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to update quantity';
      toast.error(message);
    }
  };

  const clearCart = () => {
    setCartItems([]);
    setAppliedCoupon(null);
  };

  const applyCoupon = async (code: string): Promise<boolean> => {
    try {
      const result = await couponAPI.validate(code, cartTotal);
      if (result.valid) {
        setAppliedCoupon({ code, discount_percent: result.discount_percent });
        toast.success(`Coupon ${code} applied!`);
        return true;
      }
      return false;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Invalid coupon code';
      toast.error(message);
      return false;
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    toast.success('Coupon removed');
  };

  return (
    <CartContext.Provider value={{ cartItems, cartCount, cartTotal, isLoading, addToCart, removeFromCart, updateQty, clearCart, appliedCoupon, applyCoupon, removeCoupon, discountAmount, finalTotal }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};
