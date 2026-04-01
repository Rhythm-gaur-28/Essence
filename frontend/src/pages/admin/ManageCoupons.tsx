import React, { useEffect, useState } from 'react';
import { Coupon } from '@/types';
import { Trash2, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { couponAPI } from '@/lib/api';

const ManageCoupons = () => {
  const [couponList, setCouponList] = useState<Coupon[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ code: '', discount_percent: '', max_uses: '', expiry_date: '' });

  const loadCoupons = async () => {
    try {
      const data = await couponAPI.getAll();
      setCouponList(data || []);
    } catch (error) {
      console.error('Failed to load coupons:', error);
      toast.error('Failed to load coupons');
    }
  };

  useEffect(() => {
    loadCoupons();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await couponAPI.create({
        code: form.code,
        discount_percent: Number(form.discount_percent),
        max_uses: Number(form.max_uses),
        expiry_date: form.expiry_date,
      });
      setForm({ code: '', discount_percent: '', max_uses: '', expiry_date: '' });
      setShowForm(false);
      await loadCoupons();
      toast.success('Coupon created');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to create coupon';
      toast.error(message);
    }
  };

  const toggleActive = async (id: number, isActive: boolean) => {
    try {
      await couponAPI.update(id, { is_active: !isActive });
      setCouponList(prev => prev.map(c => c.id === id ? { ...c, is_active: !c.is_active } : c));
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to update coupon';
      toast.error(message);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await couponAPI.delete(id);
      setCouponList(prev => prev.filter(x => x.id !== id));
      toast.success('Deleted');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to delete coupon';
      toast.error(message);
    }
  };

  return (
    <div>
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
                <td className="p-3 text-muted-foreground">{c.expiry_date}</td>
                <td className="p-3">
                  <button onClick={() => toggleActive(c.id, c.is_active)}
                    className={`text-xs px-2 py-1 rounded-full ${c.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {c.is_active ? 'Active' : 'Inactive'}
                  </button>
                </td>
                <td className="p-3 text-right">
                  <button onClick={() => handleDelete(c.id)}
                    className="p-1.5 text-muted-foreground hover:text-destructive"><Trash2 className="w-4 h-4" /></button>
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
