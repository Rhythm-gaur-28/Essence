import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Check, Tag, MapPin } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/data/mockData';
import toast from 'react-hot-toast';

const API = 'http://localhost:5000';
const steps = ['Address', 'Payment', 'Review'];

const Checkout = () => {
  const { cartItems, finalTotal, discountAmount, cartTotal, clearCart, appliedCoupon } = useCart();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);

  const [address, setAddress] = useState({
    full_name: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    pincode: '',
  });

  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'upi' | 'card'>('cod');

  // Saved addresses
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [selectedAddrId, setSelectedAddrId] = useState<number | null>(null);
  const [showManualForm, setShowManualForm] = useState(false);
  const [addrLoaded, setAddrLoaded] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('be_token');
    if (!token) { setAddrLoaded(true); return; }

    fetch(`${API}/api/addresses`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => {
        const addrs = Array.isArray(data) ? data : [];
        setSavedAddresses(addrs);

        // Autofill from default address
        const defaultAddr = addrs.find((a: any) => a.is_default === 1) || addrs[0];
        if (defaultAddr) {
          setSelectedAddrId(defaultAddr.id);
          setAddress({
            full_name: defaultAddr.receiver_name,
            phone: defaultAddr.phone,
            street: defaultAddr.street,
            city: defaultAddr.city,
            state: defaultAddr.state,
            pincode: defaultAddr.pincode,
          });
        } else {
          setShowManualForm(true);
        }
      })
      .catch(() => setShowManualForm(true))
      .finally(() => setAddrLoaded(true));
  }, []);

  const selectSavedAddress = (addr: any) => {
    setSelectedAddrId(addr.id);
    setAddress({
      full_name: addr.receiver_name,
      phone: addr.phone,
      street: addr.street,
      city: addr.city,
      state: addr.state,
      pincode: addr.pincode,
    });
    setShowManualForm(false);
  };

  const handlePlaceOrder = async () => {
    try {
      const token = localStorage.getItem('be_token');
      if (!token) { toast.error('Please login first'); navigate('/login'); return; }

      const res = await fetch(`${API}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          address,
          paymentMethod,
          items: cartItems.map(item => ({
            id: item.product.id,
            quantity: item.quantity,
            effectivePrice: item.product.discount_price ?? item.product.price,
          })),
          total: finalTotal,
          couponCode: appliedCoupon?.code || null,
          discountAmount: discountAmount || 0,
        }),
      });

      const data = await res.json();
      if (!res.ok) { toast.error(data?.msg || 'Order failed'); return; }

      toast.success('Order placed successfully!');
      clearCart();
      navigate('/order-success', { state: { orderId: data.orderId } });
    } catch (err) {
      console.error(err);
      toast.error('Something went wrong');
    }
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
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${
                i <= step ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}>
                {i < step ? <Check className="w-4 h-4" /> : i + 1}
              </div>
              <span className={`text-sm ${i <= step ? 'font-medium' : 'text-muted-foreground'}`}>{s}</span>
            </div>
            {i < steps.length - 1 && (
              <div className={`h-px w-12 ${i < step ? 'bg-primary' : 'bg-border'}`} />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* ─── Step 1: Address ─── */}
      {step === 0 && (
        <div className="bg-card rounded-xl p-6 border border-border">
          <h2 className="font-heading text-lg font-semibold mb-4">Shipping Address</h2>

          {!addrLoaded ? (
            <p className="text-sm text-muted-foreground mb-4">Loading saved addresses...</p>
          ) : savedAddresses.length > 0 ? (
            <div className="space-y-2 mb-5">
              {savedAddresses.map(addr => (
                <label
                  key={addr.id}
                  className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedAddrId === addr.id ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30'
                  }`}
                >
                  <input
                    type="radio"
                    checked={selectedAddrId === addr.id}
                    onChange={() => selectSavedAddress(addr)}
                    className="accent-primary mt-0.5"
                  />
                  <div className="flex-1 text-sm">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{addr.receiver_name}</p>
                      {addr.is_default === 1 && (
                        <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-medium">Default</span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{addr.phone}</p>
                    <p className="text-xs text-muted-foreground">
                      {addr.street}, {addr.city}, {addr.state} – {addr.pincode}
                    </p>
                  </div>
                </label>
              ))}

              {/* Add New Address option */}
              <label
                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                  showManualForm && selectedAddrId === null ? 'border-primary bg-primary/5' : 'border-dashed border-border hover:border-primary/30'
                }`}
              >
                <input
                  type="radio"
                  checked={showManualForm && selectedAddrId === null}
                  onChange={() => { setShowManualForm(true); setSelectedAddrId(null); setAddress({ full_name: '', phone: '', street: '', city: '', state: '', pincode: '' }); }}
                  className="accent-primary"
                />
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span>Enter a new address</span>
                </div>
              </label>
            </div>
          ) : (
            <div className="mb-4 p-3 bg-muted/50 rounded-lg flex items-center justify-between text-sm">
              <span className="text-muted-foreground">No saved addresses found.</span>
              <Link to="/profile" className="text-primary text-xs hover:underline">Add in Profile →</Link>
            </div>
          )}

          {/* Manual address form — shown when "Enter new address" selected or no saved addresses */}
          {(showManualForm || savedAddresses.length === 0) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
              {(['full_name', 'phone', 'street', 'city', 'state', 'pincode'] as const).map(field => (
                <div key={field} className={field === 'street' ? 'md:col-span-2' : ''}>
                  <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1 block capitalize">
                    {field.replace('_', ' ')}
                  </label>
                  <input
                    value={address[field]}
                    onChange={e => {
                      let value = e.target.value;
                      if (field === 'full_name') value = value.replace(/[^A-Za-z\s]/g, '');
                      if (field === 'phone') value = value.replace(/[^0-9]/g, '').slice(0, 10);
                      if (field === 'pincode') value = value.replace(/[^0-9]/g, '').slice(0, 6);
                      setAddress({ ...address, [field]: value });
                    }}
                    className="w-full bg-muted rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
              ))}
            </div>
          )}

          <button
            onClick={() => {
              if (Object.values(address).some(v => !v.trim())) {
                toast.error('Please fill all fields');
                return;
              }
              if (address.phone.length !== 10) {
                toast.error('Enter a valid 10-digit phone number');
                return;
              }
              if (address.pincode.length !== 6) {
                toast.error('Enter a valid 6-digit pincode');
                return;
              }
              setStep(1);
            }}
            className="btn-gold text-sm mt-6"
          >
            Continue to Payment
          </button>
        </div>
      )}

      {/* ─── Step 2: Payment ─── */}
      {step === 1 && (
        <div className="bg-card rounded-xl p-6 border border-border">
          <h2 className="font-heading text-lg font-semibold mb-4">Payment Method</h2>

          <div className="space-y-3">
            {([
              ['cod', 'Cash on Delivery', 'Pay when your order arrives'],
              ['upi', 'UPI Payment', 'Google Pay, PhonePe, Paytm'],
              ['card', 'Credit / Debit Card', 'Visa, Mastercard, RuPay'],
            ] as const).map(([key, label, sub]) => (
              <label
                key={key}
                className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                  paymentMethod === key ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30'
                }`}
              >
                <input type="radio" checked={paymentMethod === key} onChange={() => setPaymentMethod(key)} className="accent-primary" />
                <div>
                  <p className="text-sm font-medium">{label}</p>
                  <p className="text-xs text-muted-foreground">{sub}</p>
                </div>
              </label>
            ))}
          </div>

          <div className="flex gap-3 mt-6">
            <button onClick={() => setStep(0)} className="btn-outline-gold text-sm">Back</button>
            <button onClick={() => setStep(2)} className="btn-gold text-sm">Review Order</button>
          </div>
        </div>
      )}

      {/* ─── Step 3: Review ─── */}
      {step === 2 && (
        <div className="bg-card rounded-xl p-6 border border-border">
          <h2 className="font-heading text-lg font-semibold mb-4">Order Review</h2>

          {/* Address summary */}
          <div className="bg-muted/50 rounded-lg p-3 mb-4 text-sm">
            <p className="font-medium mb-1">Shipping to</p>
            <p className="text-muted-foreground">{address.full_name} · {address.phone}</p>
            <p className="text-muted-foreground">
              {address.street}, {address.city}, {address.state} – {address.pincode}
            </p>
          </div>

          {/* Items */}
          <div className="space-y-3 mb-5">
            {cartItems.map(item => {
              const effectivePrice = item.product.discount_price ?? item.product.price;
              const lineTotal = effectivePrice * item.quantity;
              return (
                <div key={item.id} className="flex items-center justify-between text-sm">
                  <div className="flex-1">
                    <p className="font-medium line-clamp-1">{item.product.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.product.brand_name} · qty {item.quantity}
                      {item.product.discount_price && (
                        <span className="ml-2 line-through text-muted-foreground/60">
                          {formatPrice(item.product.price)}
                        </span>
                      )}
                    </p>
                  </div>
                  <span className="font-semibold ml-4">{formatPrice(lineTotal)}</span>
                </div>
              );
            })}
          </div>

          {/* Price Breakdown */}
          <div className="border-t border-border pt-4 space-y-2 text-sm mb-5">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatPrice(cartTotal)}</span>
            </div>

            {appliedCoupon && (
              <div className="flex justify-between text-green-600">
                <span className="flex items-center gap-1">
                  <Tag className="w-3 h-3" />
                  Coupon ({appliedCoupon.code} · {appliedCoupon.discount_percent}% off)
                </span>
                <span>− {formatPrice(discountAmount)}</span>
              </div>
            )}

            <div className="flex justify-between">
              <span className="text-muted-foreground">Shipping</span>
              <span className="text-green-600">Free</span>
            </div>

            <div className="flex justify-between font-bold text-base border-t border-border pt-2 mt-1">
              <span>Total</span>
              <span>{formatPrice(finalTotal)}</span>
            </div>

            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Payment</span>
              <span className="uppercase">{paymentMethod}</span>
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={() => setStep(1)} className="btn-outline-gold text-sm">Back</button>
            <button onClick={handlePlaceOrder} className="btn-gold flex-1 text-sm">
              Place Order · {formatPrice(finalTotal)}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Checkout;
