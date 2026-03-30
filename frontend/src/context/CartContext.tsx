import React, { createContext, useContext, useState, ReactNode } from 'react';
import { CartItem, Product } from '@/types';
import toast from 'react-hot-toast';

interface CartContextType {
  cartItems: CartItem[];
  cartCount: number;
  cartTotal: number;
  addToCart: (product: Product, qty?: number) => void;
  removeFromCart: (cartItemId: number) => void;
  updateQty: (cartItemId: number, qty: number) => void;
  clearCart: () => void;
  appliedCoupon: { code: string; discount_percent: number } | null;
  applyCoupon: (code: string) => boolean;
  removeCoupon: () => void;
  discountAmount: number;
  finalTotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount_percent: number } | null>(null);

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cartItems.reduce((sum, item) => sum + (item.product.discount_price || item.product.price) * item.quantity, 0);
  const discountAmount = appliedCoupon ? Math.round(cartTotal * appliedCoupon.discount_percent / 100) : 0;
  const finalTotal = cartTotal - discountAmount;

  const addToCart = (product: Product, qty = 1) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.product_id === product.id);
      if (existing) {
        toast.success('Updated quantity in cart');
        return prev.map(item => item.product_id === product.id ? { ...item, quantity: item.quantity + qty } : item);
      }
      toast.success('Added to cart');
      return [...prev, { id: Date.now(), product_id: product.id, product, quantity: qty }];
    });
  };

  const removeFromCart = (cartItemId: number) => {
    setCartItems(prev => prev.filter(item => item.id !== cartItemId));
    toast.success('Removed from cart');
  };

  const updateQty = (cartItemId: number, qty: number) => {
    if (qty < 1) return removeFromCart(cartItemId);
    setCartItems(prev => prev.map(item => item.id === cartItemId ? { ...item, quantity: qty } : item));
  };

  const clearCart = () => {
    setCartItems([]);
    setAppliedCoupon(null);
  };

  const applyCoupon = (code: string): boolean => {
    const validCoupons: Record<string, number> = { FIRST10: 10, LUXURY20: 20 };
    const upper = code.toUpperCase();
    if (validCoupons[upper]) {
      setAppliedCoupon({ code: upper, discount_percent: validCoupons[upper] });
      toast.success(`Coupon ${upper} applied!`);
      return true;
    }
    toast.error('Invalid coupon code');
    return false;
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    toast.success('Coupon removed');
  };

  return (
    <CartContext.Provider value={{ cartItems, cartCount, cartTotal, addToCart, removeFromCart, updateQty, clearCart, appliedCoupon, applyCoupon, removeCoupon, discountAmount, finalTotal }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};
