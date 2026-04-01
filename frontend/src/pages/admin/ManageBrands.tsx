import React, { useEffect, useState } from 'react';
import { Brand } from '@/types';
import { Trash2, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { brandAPI } from '@/lib/api';

const ManageBrands = () => {
  const [brandList, setBrandList] = useState<Brand[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', country: '', description: '' });

  const loadBrands = async () => {
    try {
      const data = await brandAPI.getAll();
      setBrandList(data || []);
    } catch (error) {
      console.error('Failed to load brands:', error);
      toast.error('Failed to load brands');
    }
  };

  useEffect(() => {
    loadBrands();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await brandAPI.create(form);
      setForm({ name: '', country: '', description: '' });
      setShowForm(false);
      await loadBrands();
      toast.success('Brand added');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to create brand';
      toast.error(message);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await brandAPI.delete(id);
      setBrandList(prev => prev.filter(x => x.id !== id));
      toast.success('Deleted');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to delete brand';
      toast.error(message);
    }
  };

  return (
    <div>
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
                  <button onClick={() => handleDelete(b.id)}
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

export default ManageBrands;
