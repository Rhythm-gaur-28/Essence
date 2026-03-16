import React, { useState } from 'react';
import { sampleOrders, formatPrice } from '@/data/mockData';
import { Order } from '@/types';
import toast from 'react-hot-toast';

const ManageOrders = () => {
  const [orders, setOrders] = useState<Order[]>(sampleOrders);

  const updateStatus = (id: number, status: Order['status']) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
    toast.success(`Order #${id} updated to ${status}`);
  };

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold mb-6">Manage Orders</h1>
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted">
                <th className="text-left p-3 text-xs uppercase text-muted-foreground font-medium">Order ID</th>
                <th className="text-left p-3 text-xs uppercase text-muted-foreground font-medium">Total</th>
                <th className="text-left p-3 text-xs uppercase text-muted-foreground font-medium">Payment</th>
                <th className="text-left p-3 text-xs uppercase text-muted-foreground font-medium">Status</th>
                <th className="text-left p-3 text-xs uppercase text-muted-foreground font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(o => (
                <tr key={o.id} className="border-b border-border last:border-0">
                  <td className="p-3 font-medium">#{o.id}</td>
                  <td className="p-3">{formatPrice(o.total_amount)}</td>
                  <td className="p-3 uppercase text-xs">{o.payment_method}</td>
                  <td className="p-3">
                    <select value={o.status} onChange={e => updateStatus(o.id, e.target.value as Order['status'])}
                      className="text-xs bg-muted px-2 py-1 rounded-lg outline-none capitalize">
                      {['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'].map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                  <td className="p-3 text-muted-foreground">{o.created_at}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManageOrders;
