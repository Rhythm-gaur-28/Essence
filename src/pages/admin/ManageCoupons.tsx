import React, { useState, useEffect } from 'react';
import { Trash2, Plus } from 'lucide-react';
import { formatDate } from '@/utils/formatDate';
import toast from 'react-hot-toast';
import ConfirmModal from '@/components/ConfirmModal';

const ManageCoupons = () => {
  const token = localStorage.getItem('be_token');
  const [couponList, setCouponList] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ code: '', discount_percent: '', max_uses: '', expiry_date: '' });
  const [loading, setLoading] = useState(true);
  const [confirmId, setConfirmId] = useState<number | null>(null);

  useEffect(() => {
    fetch('http://localhost:5000/api/coupons', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => setCouponList(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('http://localhost:5000/api/coupons', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        code: form.code.toUpperCase(),
        discount_percent: Number(form.discount_percent),
        max_uses: Number(form.max_uses),
        expiry_date: form.expiry_date,
      })
    });
    const data = await res.json();
    if (res.ok) {
      setCouponList(prev => [...prev, data]);
      setForm({ code: '', discount_percent: '', max_uses: '', expiry_date: '' });
      setShowForm(false);
      toast.success('Coupon created');
    } else {
      toast.error(data.msg || 'Failed to create coupon');
    }
  };

  const toggleActive = async (id: number) => {
    const res = await fetch(`http://localhost:5000/api/coupons/${id}/toggle`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) {
      setCouponList(prev => prev.map(c => c.id === id ? { ...c, is_active: !c.is_active } : c));
    } else {
      toast.error('Failed to toggle coupon');
    }
  };

  const handleDelete = async (id: number) => {
    const res = await fetch(`http://localhost:5000/api/coupons/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) {
      setCouponList(prev => prev.filter(x => x.id !== id));
      toast.success('Deleted');
    } else {
      toast.error('Failed to delete');
    }
    setConfirmId(null);
  };

  if (loading) return <p className="text-muted-foreground text-sm">Loading...</p>;

  return (
    <div>
      {confirmId !== null && (
        <ConfirmModal
          title="Delete Coupon"
          message="Are you sure you want to delete this item?"
          confirmLabel="Yes, Delete"
          onConfirm={() => handleDelete(confirmId)}
          onCancel={() => setConfirmId(null)}
        />
      )}

      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-2xl font-bold">Manage Coupons</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn-gold text-xs flex items-center gap-1">
          <Plus className="w-4 h-4" /> Add Coupon
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="bg-card rounded-xl p-5 border border-border mb-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <input placeholder="Code" value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} required
            className="bg-muted rounded-lg px-3 py-2 text-sm outline-none uppercase" />
          <input type="number" placeholder="Discount %" value={form.discount_percent} onChange={e => setForm({ ...form, discount_percent: e.target.value })} required
            className="bg-muted rounded-lg px-3 py-2 text-sm outline-none" />
          <input type="number" placeholder="Max Uses" value={form.max_uses} onChange={e => setForm({ ...form, max_uses: e.target.value })} required
            className="bg-muted rounded-lg px-3 py-2 text-sm outline-none" />
          <input type="date" value={form.expiry_date} onChange={e => setForm({ ...form, expiry_date: e.target.value })} required
            className="bg-muted rounded-lg px-3 py-2 text-sm outline-none" />
          <button type="submit" className="btn-gold text-xs py-2 col-span-2 md:col-span-4 w-fit">Save Coupon</button>
        </form>
      )}

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted">
              <th className="text-left p-3 text-xs uppercase text-muted-foreground font-medium">Code</th>
              <th className="text-left p-3 text-xs uppercase text-muted-foreground font-medium">Discount</th>
              <th className="text-left p-3 text-xs uppercase text-muted-foreground font-medium">Uses</th>
              <th className="text-left p-3 text-xs uppercase text-muted-foreground font-medium">Expiry</th>
              <th className="text-left p-3 text-xs uppercase text-muted-foreground font-medium">Active</th>
              <th className="text-right p-3 text-xs uppercase text-muted-foreground font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {couponList.map(c => (
              <tr key={c.id} className="border-b border-border last:border-0">
                <td className="p-3 font-medium font-mono">{c.code}</td>
                <td className="p-3">{c.discount_percent}%</td>
                <td className="p-3 text-muted-foreground">{c.used_count}/{c.max_uses}</td>
                <td className="p-3 text-muted-foreground">{formatDate(c.expiry_date)}</td>
                <td className="p-3">
                  <button onClick={() => toggleActive(c.id)}
                    className={`text-xs px-2 py-1 rounded-full ${c.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {c.is_active ? 'Active' : 'Inactive'}
                  </button>
                </td>
                <td className="p-3 text-right">
                  <button
                    onClick={() => setConfirmId(c.id)}
                    className="p-1.5 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageCoupons;
