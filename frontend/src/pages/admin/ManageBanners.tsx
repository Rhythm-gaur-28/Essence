import React, { useEffect, useState } from 'react';
import { Banner } from '@/types';
import { Trash2, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { bannerAPI } from '@/lib/api';

const ManageBanners = () => {
  const [bannerList, setBannerList] = useState<Banner[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', subtitle: '', link: '' });

  const loadBanners = async () => {
    try {
      const data = await bannerAPI.getActive();
      setBannerList(data || []);
    } catch (error) {
      console.error('Failed to load banners:', error);
      toast.error('Failed to load banners');
    }
  };

  useEffect(() => {
    loadBanners();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await bannerAPI.create(form);
      setForm({ title: '', subtitle: '', link: '' });
      setShowForm(false);
      await loadBanners();
      toast.success('Banner added');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to create banner';
      toast.error(message);
    }
  };

  const toggleActive = async (id: number, isActive: boolean) => {
    try {
      await bannerAPI.update(id, { is_active: !isActive });
      setBannerList(prev => prev.map(x => x.id === id ? { ...x, is_active: !x.is_active } : x));
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to update banner';
      toast.error(message);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await bannerAPI.delete(id);
      setBannerList(prev => prev.filter(x => x.id !== id));
      toast.success('Deleted');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to delete banner';
      toast.error(message);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-2xl font-bold">Manage Banners</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn-gold text-xs flex items-center gap-1">
          <Plus className="w-4 h-4" /> Add Banner
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="bg-card rounded-xl p-5 border border-border mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <input placeholder="Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required
            className="bg-muted rounded-lg px-3 py-2 text-sm outline-none" />
          <input placeholder="Subtitle" value={form.subtitle} onChange={e => setForm({ ...form, subtitle: e.target.value })}
            className="bg-muted rounded-lg px-3 py-2 text-sm outline-none" />
          <input placeholder="Link" value={form.link} onChange={e => setForm({ ...form, link: e.target.value })}
            className="bg-muted rounded-lg px-3 py-2 text-sm outline-none" />
          <button type="submit" className="btn-gold text-xs py-2 md:col-span-3 w-fit">Save Banner</button>
        </form>
      )}

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted">
              <th className="text-left p-3 text-xs uppercase text-muted-foreground font-medium">Title</th>
              <th className="text-left p-3 text-xs uppercase text-muted-foreground font-medium">Subtitle</th>
              <th className="text-left p-3 text-xs uppercase text-muted-foreground font-medium">Active</th>
              <th className="text-right p-3 text-xs uppercase text-muted-foreground font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {bannerList.map(b => (
              <tr key={b.id} className="border-b border-border last:border-0">
                <td className="p-3 font-medium">{b.title}</td>
                <td className="p-3 text-muted-foreground">{b.subtitle}</td>
                <td className="p-3">
                  <button onClick={() => toggleActive(b.id, b.is_active)}
                    className={`text-xs px-2 py-1 rounded-full ${b.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {b.is_active ? 'Active' : 'Inactive'}
                  </button>
                </td>
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

export default ManageBanners;
