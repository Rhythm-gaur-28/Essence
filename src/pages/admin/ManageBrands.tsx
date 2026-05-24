import React, { useState, useEffect } from 'react';
import { Trash2, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import ConfirmModal from '@/components/ConfirmModal';

const ManageBrands = () => {
  const token = localStorage.getItem('be_token');
  const [brandList, setBrandList] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', country: '', description: '' });
  const [loading, setLoading] = useState(true);
  const [confirmId, setConfirmId] = useState<number | null>(null);

  useEffect(() => {
    fetch('http://localhost:5000/api/brands', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => setBrandList(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('http://localhost:5000/api/brands', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(form)
    });
    const data = await res.json();
    if (res.ok) {
      setBrandList(prev => [...prev, data]);
      setForm({ name: '', country: '', description: '' });
      setShowForm(false);
      toast.success('Brand added');
    } else {
      toast.error(data.msg || 'Failed to add brand');
    }
  };

  const handleDelete = async (id: number) => {
    const res = await fetch(`http://localhost:5000/api/brands/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) {
      setBrandList(prev => prev.filter(x => x.id !== id));
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
          title="Delete Brand"
          message="Are you sure you want to delete this item?"
          confirmLabel="Yes, Delete"
          onConfirm={() => handleDelete(confirmId)}
          onCancel={() => setConfirmId(null)}
        />
      )}

      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-2xl font-bold">Manage Brands</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn-gold text-xs flex items-center gap-1">
          <Plus className="w-4 h-4" /> Add Brand
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="bg-card rounded-xl p-5 border border-border mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <input placeholder="Brand Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required
            className="bg-muted rounded-lg px-3 py-2 text-sm outline-none" />
          <input placeholder="Country" value={form.country} onChange={e => setForm({ ...form, country: e.target.value })} required
            className="bg-muted rounded-lg px-3 py-2 text-sm outline-none" />
          <input placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
            className="bg-muted rounded-lg px-3 py-2 text-sm outline-none" />
          <button type="submit" className="btn-gold text-xs py-2 md:col-span-3 w-fit">Save Brand</button>
        </form>
      )}

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted">
              <th className="text-left p-3 text-xs uppercase text-muted-foreground font-medium">Name</th>
              <th className="text-left p-3 text-xs uppercase text-muted-foreground font-medium">Country</th>
              <th className="text-right p-3 text-xs uppercase text-muted-foreground font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {brandList.map(b => (
              <tr key={b.id} className="border-b border-border last:border-0">
                <td className="p-3 font-medium">{b.name}</td>
                <td className="p-3 text-muted-foreground">{b.country}</td>
                <td className="p-3 text-right">
                  <button
                    onClick={() => setConfirmId(b.id)}
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

export default ManageBrands;
