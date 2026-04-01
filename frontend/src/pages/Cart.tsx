import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Minus, Plus, ShoppingBag, Tag } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { formatPrice } from '@/lib/format';

const Cart = () => {
  const { cartItems, cartCount, cartTotal, updateQty, removeFromCart, appliedCoupon, applyCoupon, removeCoupon, discountAmount, finalTotal } = useCart();
  const { isAuthenticated } = useAuth();
  const [couponCode, setCouponCode] = useState('');

  if (cartItems.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <ShoppingBag className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="font-heading text-xl font-bold mb-2">Your cart is empty</h2>
          <p className="text-sm text-muted-foreground mb-4">Discover beautiful fragrances to add to your cart</p>
          <Link to="/shop" className="btn-gold text-sm">Shop Now</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 md:px-8 py-8">
      <h1 className="font-heading text-2xl md:text-3xl font-bold mb-8">Shopping Cart ({cartCount})</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map(item => (
            <div key={item.id} className="bg-card rounded-xl p-4 border border-border flex items-center gap-4">
              <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                <span className="text-xl opacity-30">🌸</span>
              </div>
              <div className="flex-1 min-w-0">
                <Link to={`/product/${item.product.id}`} className="font-heading text-sm font-semibold hover:text-primary transition-colors line-clamp-1">
                  {item.product.name}
                </Link>
                <p className="text-xs text-muted-foreground">{item.product.brand_name}</p>
                <p className="text-sm font-semibold mt-1">{formatPrice(item.product.discount_price || item.product.price)}</p>
              </div>
              <div className="flex items-center border border-border rounded-lg">
                <button onClick={() => updateQty(item.id, item.quantity - 1)} className="p-1.5"><Minus className="w-3 h-3" /></button>
                <span className="px-3 text-sm">{item.quantity}</span>
                <button onClick={() => updateQty(item.id, item.quantity + 1)} className="p-1.5"><Plus className="w-3 h-3" /></button>
              </div>
              <p className="text-sm font-semibold min-w-[80px] text-right">
                {formatPrice((item.product.discount_price || item.product.price) * item.quantity)}
              </p>
              <button onClick={() => removeFromCart(item.id)} className="p-2 text-muted-foreground hover:text-destructive transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="bg-card rounded-xl p-6 border border-border h-fit sticky top-24">
          <h2 className="font-heading text-lg font-bold mb-4">Order Summary</h2>

          {/* Coupon */}
          <div className="mb-4">
            {appliedCoupon ? (
              <div className="flex items-center justify-between bg-primary/10 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">{appliedCoupon.code}</span>
                  <span className="text-xs text-muted-foreground">(-{appliedCoupon.discount_percent}%)</span>
                </div>
                <button onClick={removeCoupon} className="text-xs text-destructive hover:underline">Remove</button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input value={couponCode} onChange={e => setCouponCode(e.target.value)}
                  placeholder="Coupon code" className="flex-1 bg-muted rounded-lg px-3 py-2 text-sm outline-none" />
                <button onClick={() => { applyCoupon(couponCode); setCouponCode(''); }} className="btn-gold text-xs py-2 px-4">Apply</button>
              </div>
            )}
          </div>

          <div className="space-y-2 mb-4 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{formatPrice(cartTotal)}</span></div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-green-600"><span>Discount</span><span>-{formatPrice(discountAmount)}</span></div>
            )}
            <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span className="text-green-600">Free</span></div>
          </div>

          <div className="border-t border-border pt-3 mb-4">
            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>{formatPrice(finalTotal)}</span>
            </div>
          </div>

          {isAuthenticated ? (
            <Link to="/checkout" className="btn-gold block text-center text-sm w-full">Proceed to Checkout</Link>
          ) : (
            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-2">Please login to proceed</p>
              <Link to="/login" className="btn-gold block text-center text-sm w-full">Login to Checkout</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Cart;
