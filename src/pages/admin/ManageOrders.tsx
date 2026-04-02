import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { formatPrice } from '@/data/mockData';
import { formatDate } from '@/utils/formatDate';
import toast from 'react-hot-toast';
import ConfirmModal from '@/components/ConfirmModal';

const API = 'http://localhost:5000';

const PAYMENT_STATUS_LABELS: Record<string, string> = {
  yet_to_be_paid: 'Yet to be Paid',
  paid: 'Paid',
};

const ManageOrders = () => {
  const token = localStorage.getItem('be_token');
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [manualPaidAt, setManualPaidAt] = useState('');

  useEffect(() => {
    fetch(`${API}/api/orders/all`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => setOrders(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, []);

  const updateStatus = async (id: number, status: string) => {
    const res = await fetch(`${API}/api/orders/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
      if (selectedOrder?.id === id) setSelectedOrder((p: any) => ({ ...p, status }));
      toast.success(`Order #${id} → ${status}`);
    } else {
      toast.error('Failed to update status');
    }
  };

  const updatePaymentStatus = async (id: number, payment_status: string, paid_at?: string) => {
    const body: any = { payment_status };
    if (payment_status === 'paid' && paid_at) body.paid_at = paid_at;

    const res = await fetch(`${API}/api/orders/${id}/payment-status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      const data = await res.json();
      setOrders(prev => prev.map(o =>
        o.id === id ? { ...o, payment_status: data.payment_status, paid_at: data.paid_at } : o
      ));
      if (selectedOrder?.id === id) {
        setSelectedOrder((p: any) => ({ ...p, payment_status: data.payment_status, paid_at: data.paid_at }));
      }
      toast.success('Payment status updated');
    } else {
      toast.error('Failed to update payment status');
    }
  };

  const openOrderDetail = async (id: number) => {
    setSelectedOrder(null);
    setModalLoading(true);
    try {
      const res = await fetch(`${API}/api/orders/${id}/detail`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setSelectedOrder(data);
      else toast.error('Failed to load order');
    } catch {
      toast.error('Failed to load order');
    } finally {
      setModalLoading(false);
    }
  };

  if (loading) return <p className="text-muted-foreground text-sm">Loading...</p>;

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold mb-6">Manage Orders</h1>

      {/* ─── Orders Table ─── */}
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
                <th className="text-right p-3 text-xs uppercase text-muted-foreground font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(o => (
                <tr key={o.id} className="border-b border-border last:border-0">
                  <td className="p-3 font-medium">#{o.id}</td>
                  <td className="p-3">{formatPrice(o.total_amount)}</td>
                  <td className="p-3 uppercase text-xs">{o.payment_method}</td>
                  <td className="p-3">
                    <select
                      value={o.status}
                      onChange={e => updateStatus(o.id, e.target.value)}
                      className="text-xs bg-muted px-2 py-1 rounded-lg outline-none capitalize"
                    >
                      {['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'].map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                  <td className="p-3 text-muted-foreground">{formatDate(o.created_at, true)}</td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => openOrderDetail(o.id)}
                      className="text-xs text-primary hover:underline font-medium"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── Order Detail Modal ─── */}
      {(modalLoading || selectedOrder) && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={e => { if (e.target === e.currentTarget) setSelectedOrder(null); }}
        >
          <div className="bg-card rounded-xl border border-border w-full max-w-2xl max-h-[90vh] overflow-y-auto">

            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border sticky top-0 bg-card z-10">
              <h2 className="font-heading text-lg font-bold">
                {selectedOrder ? `Order #${selectedOrder.id}` : 'Loading...'}
              </h2>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalLoading && !selectedOrder ? (
              <div className="p-10 text-center text-muted-foreground text-sm">Loading order details...</div>
            ) : selectedOrder && (
              <div className="p-6 space-y-6">

                {/* Order Meta */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground mb-0.5">Order Date</p>
                    <p className="font-medium">{formatDate(selectedOrder.created_at, true)}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground mb-0.5">Customer</p>
                    <p className="font-medium">{selectedOrder.customer_name}</p>
                    <p className="text-xs text-muted-foreground">{selectedOrder.customer_email}</p>
                  </div>
                </div>

                {/* Shipping Address */}
                <div className="bg-muted/50 rounded-lg p-4 text-sm">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Shipping Address</p>
                  <p className="font-medium">{selectedOrder.full_name}</p>
                  <p className="text-muted-foreground">{selectedOrder.phone}</p>
                  <p className="text-muted-foreground mt-0.5">
                    {selectedOrder.street}, {selectedOrder.city}, {selectedOrder.state} – {selectedOrder.pincode}
                  </p>
                </div>

                {/* Payment & Status Controls */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Order Status */}
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1.5">Order Status</p>
                    <select
                      value={selectedOrder.status}
                      onChange={e => updateStatus(selectedOrder.id, e.target.value)}
                      className="w-full text-sm bg-muted px-3 py-2 rounded-lg outline-none capitalize focus:ring-2 focus:ring-primary/30"
                    >
                      {['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'].map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>

                  {/* Payment Status */}
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1.5">Payment Status</p>
                    <select
                      value={selectedOrder.payment_status || 'yet_to_be_paid'}
                      onChange={e => {
                        setManualPaidAt('');
                        updatePaymentStatus(selectedOrder.id, e.target.value);
                      }}
                      className="w-full text-sm bg-muted px-3 py-2 rounded-lg outline-none focus:ring-2 focus:ring-primary/30"
                    >
                      <option value="yet_to_be_paid">Yet to be Paid</option>
                      <option value="paid">Paid</option>
                    </select>

                    {/* Manual payment date/time input — shown when paid */}
                    {selectedOrder.payment_status === 'paid' && (
                      <div className="mt-2 space-y-1">
                        <p className="text-xs text-muted-foreground">Payment Date & Time</p>
                        <div className="flex gap-2 items-center">
                          <input
                            type="datetime-local"
                            value={manualPaidAt}
                            onChange={e => setManualPaidAt(e.target.value)}
                            className="flex-1 text-xs bg-muted px-2 py-1.5 rounded-lg outline-none focus:ring-2 focus:ring-primary/30"
                          />
                          {manualPaidAt && (
                            <button
                              onClick={() => updatePaymentStatus(selectedOrder.id, 'paid', manualPaidAt)}
                              className="text-xs bg-primary text-primary-foreground px-3 py-1.5 rounded-lg hover:bg-primary/90 transition-colors shrink-0"
                            >
                              Set
                            </button>
                          )}
                        </div>
                        {selectedOrder.paid_at && (
                          <p className="text-xs text-green-600">
                            Paid on {formatDate(selectedOrder.paid_at, true)}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Payment Method */}
                <div className="text-sm">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground mb-0.5">Payment Method</p>
                  <p className="font-medium uppercase">{selectedOrder.payment_method}</p>
                </div>

                {/* Items */}
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground mb-3">Ordered Items</p>
                  <div className="space-y-2">
                    {selectedOrder.items?.map((item: any, i: number) => (
                      <div key={i} className="flex items-center justify-between text-sm bg-muted/40 rounded-lg px-4 py-2.5">
                        <span className="text-foreground">{item.product_name} <span className="text-muted-foreground">× {item.quantity}</span></span>
                        <span className="font-semibold">{formatPrice(item.price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Total */}
                <div className="border-t border-border pt-4 space-y-1.5 text-sm">
                  {selectedOrder.coupon_code && selectedOrder.discount_amount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Coupon ({selectedOrder.coupon_code})</span>
                      <span>− {formatPrice(selectedOrder.discount_amount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-base">
                    <span>Total</span>
                    <span>{formatPrice(selectedOrder.total_amount)}</span>
                  </div>
                </div>

              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageOrders;
