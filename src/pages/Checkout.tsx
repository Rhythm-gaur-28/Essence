import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/data/mockData';
import toast from 'react-hot-toast';

const steps = ['Address', 'Payment', 'Review'];

const Checkout = () => {
  const { cartItems, finalTotal, discountAmount, cartTotal, clearCart, appliedCoupon } = useCart();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [address, setAddress] = useState({ full_name: '', phone: '', street: '', city: '', state: '', pincode: '' });
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'upi' | 'card'>('cod');

  const handlePlaceOrder = () => {
    toast.success('Order placed successfully!');
    clearCart();
    navigate('/order-success');
  };

  if (cartItems.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="container mx-auto px-4 md:px-8 py-8 max-w-3xl">
      <h1 className="font-heading text-2xl font-bold mb-8">Checkout</h1>

      {/* Steps */}
      <div className="flex items-center justify-center gap-4 mb-10">
        {steps.map((s, i) => (
          <React.Fragment key={s}>
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${i <= step ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                {i < step ? <Check className="w-4 h-4" /> : i + 1}
              </div>
              <span className={`text-sm ${i <= step ? 'font-medium' : 'text-muted-foreground'}`}>{s}</span>
            </div>
            {i < steps.length - 1 && <div className={`h-px w-12 ${i < step ? 'bg-primary' : 'bg-border'}`} />}
          </React.Fragment>
        ))}
      </div>

      {/* Step 1: Address */}
      {step === 0 && (
        <div className="bg-card rounded-xl p-6 border border-border">
          <h2 className="font-heading text-lg font-semibold mb-4">Shipping Address</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(['full_name', 'phone', 'street', 'city', 'state', 'pincode'] as const).map(field => (
              <div key={field} className={field === 'street' ? 'md:col-span-2' : ''}>
                <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1 block capitalize">
                  {field.replace('_', ' ')}
                </label>
                <input value={address[field]} onChange={e => setAddress({ ...address, [field]: e.target.value })}
                  className="w-full bg-muted rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
            ))}
          </div>
          <button onClick={() => {
            if (Object.values(address).some(v => !v.trim())) { toast.error('Please fill all fields'); return; }
            setStep(1);
          }} className="btn-gold text-sm mt-6">Continue to Payment</button>
        </div>
      )}

      {/* Step 2: Payment */}
      {step === 1 && (
        <div className="bg-card rounded-xl p-6 border border-border">
          <h2 className="font-heading text-lg font-semibold mb-4">Payment Method</h2>
          <div className="space-y-3">
            {([['cod', 'Cash on Delivery'], ['upi', 'UPI Payment'], ['card', 'Credit / Debit Card']] as const).map(([key, label]) => (
              <label key={key} className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${paymentMethod === key ? 'border-primary bg-primary/5' : 'border-border'}`}>
                <input type="radio" name="payment" checked={paymentMethod === key} onChange={() => setPaymentMethod(key)}
                  className="accent-primary" />
                <span className="text-sm font-medium">{label}</span>
                {key !== 'cod' && <span className="text-[10px] text-muted-foreground ml-auto">(UI Only)</span>}
              </label>
            ))}
          </div>
          <div className="flex gap-3 mt-6">
            <button onClick={() => setStep(0)} className="btn-outline-gold text-sm py-2">Back</button>
            <button onClick={() => setStep(2)} className="btn-gold text-sm">Review Order</button>
          </div>
        </div>
      )}

      {/* Step 3: Review */}
      {step === 2 && (
        <div className="bg-card rounded-xl p-6 border border-border">
          <h2 className="font-heading text-lg font-semibold mb-4">Order Review</h2>

          <div className="space-y-3 mb-6">
            {cartItems.map(item => (
              <div key={item.id} className="flex items-center justify-between text-sm">
                <div>
                  <span className="font-medium">{item.product.name}</span>
                  <span className="text-muted-foreground ml-2">×{item.quantity}</span>
                </div>
                <span>{formatPrice((item.product.discount_price || item.product.price) * item.quantity)}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-border pt-4 space-y-2 text-sm mb-4">
            <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{formatPrice(cartTotal)}</span></div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-green-600"><span>Discount ({appliedCoupon?.code})</span><span>-{formatPrice(discountAmount)}</span></div>
            )}
            <div className="flex justify-between font-bold text-lg border-t border-border pt-2"><span>Total</span><span>{formatPrice(finalTotal)}</span></div>
          </div>

          <div className="bg-muted rounded-lg p-3 text-sm mb-6">
            <p className="font-medium mb-1">Shipping to:</p>
            <p className="text-muted-foreground">{address.full_name}, {address.street}, {address.city}, {address.state} - {address.pincode}</p>
            <p className="text-muted-foreground mt-1">Payment: {paymentMethod.toUpperCase()}</p>
          </div>

          <div className="flex gap-3">
            <button onClick={() => setStep(1)} className="btn-outline-gold text-sm py-2">Back</button>
            <button onClick={handlePlaceOrder} className="btn-gold text-sm flex-1">Place Order</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Checkout;
