import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { orderAPI } from '@/lib/api';
import { formatPrice } from '@/lib/format';
import { Order } from '@/types';

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  shipped: 'bg-purple-100 text-purple-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

const Profile = () => {
  const { user } = useAuth();
  const [tab, setTab] = useState<'orders' | 'settings'>('orders');
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);

  useEffect(() => {
    const loadOrders = async () => {
      try {
        setIsLoadingOrders(true);
        const data = await orderAPI.getMyOrders();
        setOrders(data || []);
      } catch (error) {
        console.error('Failed to load orders:', error);
        setOrders([]);
      } finally {
        setIsLoadingOrders(false);
      }
    };

    loadOrders();
  }, []);

  return (
    <div className="container mx-auto px-4 md:px-8 py-8 max-w-4xl">
      <h1 className="font-heading text-2xl md:text-3xl font-bold mb-8">My Account</h1>

      {/* Tabs */}
      <div className="flex gap-4 mb-8 border-b border-border">
        {(['orders', 'settings'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`pb-3 text-sm font-medium capitalize transition-colors ${tab === t ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground'}`}>
            {t === 'orders' ? 'My Orders' : 'Account Settings'}
          </button>
        ))}
      </div>

      {/* Orders */}
      {tab === 'orders' && (
        <div className="space-y-4">
          {isLoadingOrders ? (
            <p className="text-center text-muted-foreground py-10">Loading your orders...</p>
          ) : orders.length > 0 ? orders.map(order => (
            <div key={order.id} className="bg-card rounded-xl p-5 border border-border">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <span className="font-heading text-sm font-semibold">Order #{order.id}</span>
                  <span className="text-xs text-muted-foreground ml-3">{order.created_at}</span>
                </div>
                <span className={`text-xs px-3 py-1 rounded-full capitalize font-medium ${statusColors[order.status]}`}>
                  {order.status}
                </span>
              </div>
              <div className="space-y-1 mb-3">
                {order.items.map(item => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{item.product_name} ×{item.quantity}</span>
                    <span>{formatPrice(item.price_at_purchase * item.quantity)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-border pt-2 flex justify-between">
                <span className="text-xs text-muted-foreground">{order.payment_method.toUpperCase()}</span>
                <span className="font-semibold">{formatPrice(order.total_amount)}</span>
              </div>
            </div>
          )) : (
            <p className="text-center text-muted-foreground py-10">No orders yet 🌸</p>
          )}
        </div>
      )}

      {/* Settings */}
      {tab === 'settings' && (
        <div className="bg-card rounded-xl p-6 border border-border max-w-lg">
          <h2 className="font-heading text-lg font-semibold mb-4">Update Profile</h2>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1 block">Name</label>
              <input value={name} onChange={e => setName(e.target.value)}
                className="w-full bg-muted rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div>
              <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1 block">Email</label>
              <input value={email} onChange={e => setEmail(e.target.value)}
                className="w-full bg-muted rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <button className="btn-gold text-sm">Save Changes</button>
          </div>

          <h2 className="font-heading text-lg font-semibold mt-8 mb-4">Change Password</h2>
          <div className="space-y-4">
            <input type="password" placeholder="Current Password"
              className="w-full bg-muted rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30" />
            <input type="password" placeholder="New Password"
              className="w-full bg-muted rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30" />
            <button className="btn-gold text-sm">Update Password</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
