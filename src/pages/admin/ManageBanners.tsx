import React, { useState, useEffect, useRef } from 'react';
import { Trash2, Plus, Upload, X, ImageIcon, Pencil } from 'lucide-react';
import toast from 'react-hot-toast';
import ConfirmModal from '@/components/ConfirmModal';

const API = 'http://localhost:5000';
const inputCls = 'w-full bg-muted rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30';

interface Banner {
  id: number;
  image_url: string;
  title: string | null;
  subtitle: string | null;
  link: string | null;
  is_active: number;
}

const ManageBanners = () => {
  const token = localStorage.getItem('be_token');
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  // Add form state
  const [showForm, setShowForm] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: '', subtitle: '', link: '' });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Edit state
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ title: '', subtitle: '', link: '' });
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [editImagePreview, setEditImagePreview] = useState<string | null>(null);
  const [editSaving, setEditSaving] = useState(false);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch(`${API}/api/banners/all`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => setBanners(Array.isArray(data) ? data : []))
      .catch(() => setBanners([]))
      .finally(() => setLoading(false));
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, forEdit = false) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error('Max 5 MB'); return; }
    if (forEdit) {
      setEditImageFile(file);
      setEditImagePreview(URL.createObjectURL(file));
    } else {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const resetForm = () => {
    setForm({ title: '', subtitle: '', link: '' });
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    setShowForm(false);
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    const fd = new FormData();
    fd.append('image', file);
    try {
      const upRes = await fetch(`${API}/api/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      const upData = await upRes.json();
      if (!upRes.ok) { toast.error(upData.msg || 'Upload failed'); return null; }
      return upData.image_url;
    } catch {
      toast.error('Image upload failed');
      return null;
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageFile) { toast.error('Please select a banner image'); return; }
    setSaving(true);

    const imageUrl = await uploadImage(imageFile);
    if (!imageUrl) { setSaving(false); return; }

    try {
      const res = await fetch(`${API}/api/banners`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ image_url: imageUrl, title: form.title || null, subtitle: form.subtitle || null, link: form.link || null }),
      });
      const data = await res.json();
      if (res.ok) {
        setBanners(prev => [data, ...prev]);
        resetForm();
        toast.success('Banner added');
      } else {
        toast.error(data.msg || 'Failed to save banner');
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (banner: Banner) => {
    setEditingId(banner.id);
    setEditForm({ title: banner.title || '', subtitle: banner.subtitle || '', link: banner.link || '' });
    setEditImagePreview(banner.image_url.startsWith('http') ? banner.image_url : `${API}${banner.image_url}`);
    setEditImageFile(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditImageFile(null);
    setEditImagePreview(null);
    if (editFileInputRef.current) editFileInputRef.current.value = '';
  };

  const handleSaveEdit = async (bannerId: number, currentImageUrl: string) => {
    setEditSaving(true);
    let imageUrl = currentImageUrl;

    if (editImageFile) {
      const uploaded = await uploadImage(editImageFile);
      if (!uploaded) { setEditSaving(false); return; }
      imageUrl = uploaded;
    }

    try {
      const res = await fetch(`${API}/api/banners/${bannerId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ image_url: imageUrl, title: editForm.title || null, subtitle: editForm.subtitle || null, link: editForm.link || null }),
      });
      if (res.ok) {
        setBanners(prev => prev.map(b =>
          b.id === bannerId
            ? { ...b, image_url: imageUrl, title: editForm.title || null, subtitle: editForm.subtitle || null, link: editForm.link || null }
            : b
        ));
        cancelEdit();
        toast.success('Banner updated');
      } else {
        toast.error('Failed to update banner');
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setEditSaving(false);
    }
  };

  const toggleActive = async (id: number) => {
    const res = await fetch(`${API}/api/banners/${id}/toggle`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      setBanners(prev => prev.map(b => b.id === id ? { ...b, is_active: b.is_active ? 0 : 1 } : b));
    } else {
      toast.error('Failed to toggle');
    }
  };

  const handleDelete = async (id: number) => {
    const res = await fetch(`${API}/api/banners/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      setBanners(prev => prev.filter(b => b.id !== id));
      toast.success('Deleted');
    } else {
      toast.error('Failed to delete');
    }
    setConfirmDeleteId(null);
  };

  const imgSrc = (url: string) => url.startsWith('http') ? url : `${API}${url}`;

  if (loading) return <p className="text-muted-foreground text-sm">Loading...</p>;

  return (
    <div>
      {confirmDeleteId !== null && (
        <ConfirmModal
          onConfirm={() => handleDelete(confirmDeleteId)}
          onCancel={() => setConfirmDeleteId(null)}
        />
      )}

      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-2xl font-bold">Manage Banners</h1>
        <button onClick={() => setShowForm(s => !s)} className="btn-gold text-xs flex items-center gap-1">
          <Plus className="w-4 h-4" /> Add Banner
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <form onSubmit={handleAdd} className="bg-card rounded-xl border border-border p-5 mb-6 space-y-4">
          <div>
            <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2 block">
              Banner Image * <span className="normal-case text-muted-foreground/70">(max 5 MB · JPEG / PNG / WebP)</span>
            </label>
            {imagePreview ? (
              <div className="relative w-full max-w-sm h-32 rounded-xl overflow-hidden border border-border group">
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => { setImageFile(null); setImagePreview(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                  className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full max-w-sm h-32 rounded-xl border-2 border-dashed border-border hover:border-primary/50 flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <ImageIcon className="w-8 h-8" />
                <span className="text-xs">Click to upload banner image</span>
              </button>
            )}
            <input ref={fileInputRef} type="file" accept="image/jpeg,image/jpg,image/png,image/webp" onChange={e => handleImageChange(e, false)} className="hidden" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1 block">Title (optional)</label>
              <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Summer Sale" className={inputCls} />
            </div>
            <div>
              <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1 block">Subtitle (optional)</label>
              <input value={form.subtitle} onChange={e => setForm(f => ({ ...f, subtitle: e.target.value }))} placeholder="e.g. Up to 30% off" className={inputCls} />
            </div>
            <div>
              <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1 block">Link (optional)</label>
              <input value={form.link} onChange={e => setForm(f => ({ ...f, link: e.target.value }))} placeholder="e.g. /shop" className={inputCls} />
            </div>
          </div>

          <div className="flex gap-3 pt-1">
            <button type="submit" disabled={saving} className="btn-gold text-xs py-2 px-5 disabled:opacity-60 flex items-center gap-2">
              {saving ? <><Upload className="w-3 h-3 animate-bounce" /> Saving...</> : 'Add Banner'}
            </button>
            <button type="button" onClick={resetForm} className="btn-outline-gold text-xs py-2 px-5">Cancel</button>
          </div>
        </form>
      )}

      {/* Banner list */}
      {banners.length === 0 ? (
        <div className="bg-card rounded-xl border border-border p-10 text-center text-muted-foreground text-sm">
          No banners yet. Click "Add Banner" above to create one.
        </div>
      ) : (
        <div className="space-y-3">
          {banners.map(banner => (
            <div key={banner.id} className="bg-card rounded-xl border border-border p-4">
              {editingId === banner.id ? (
                /* Inline Edit Form */
                <div className="space-y-3">
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Editing Banner #{banner.id}</p>

                  {/* Edit image */}
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Banner Image</label>
                    {editImagePreview ? (
                      <div className="relative w-full max-w-xs h-28 rounded-xl overflow-hidden border border-border group">
                        <img src={editImagePreview} alt="Preview" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => editFileInputRef.current?.click()}
                          className="absolute inset-0 bg-black/40 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          Change Image
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => editFileInputRef.current?.click()}
                        className="w-full max-w-xs h-28 rounded-xl border-2 border-dashed border-border flex items-center justify-center text-muted-foreground text-xs hover:border-primary/50 transition-colors"
                      >
                        Click to upload
                      </button>
                    )}
                    <input ref={editFileInputRef} type="file" accept="image/jpeg,image/jpg,image/png,image/webp" onChange={e => handleImageChange(e, true)} className="hidden" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Title</label>
                      <input value={editForm.title} onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))} className={inputCls} />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Subtitle</label>
                      <input value={editForm.subtitle} onChange={e => setEditForm(f => ({ ...f, subtitle: e.target.value }))} className={inputCls} />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Link</label>
                      <input value={editForm.link} onChange={e => setEditForm(f => ({ ...f, link: e.target.value }))} className={inputCls} />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSaveEdit(banner.id, banner.image_url)}
                      disabled={editSaving}
                      className="btn-gold text-xs py-1.5 px-4 disabled:opacity-60"
                    >
                      {editSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button onClick={cancelEdit} className="btn-outline-gold text-xs py-1.5 px-4">Cancel</button>
                  </div>
                </div>
              ) : (
                /* Normal view */
                <div className="flex items-center gap-4">
                  <div className="w-32 h-[4.5rem] rounded-lg overflow-hidden bg-muted flex-shrink-0">
                    <img src={imgSrc(banner.image_url)} alt={banner.title || 'Banner'} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {banner.title || <span className="text-muted-foreground italic text-xs">No title</span>}
                    </p>
                    {banner.subtitle && <p className="text-xs text-muted-foreground truncate">{banner.subtitle}</p>}
                    {banner.link && <p className="text-xs text-primary truncate mt-0.5">{banner.link}</p>}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => toggleActive(banner.id)}
                      className={`text-xs px-3 py-1 rounded-full font-medium transition-colors ${
                        banner.is_active ? 'bg-green-100 text-green-700' : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {banner.is_active ? 'Active' : 'Inactive'}
                    </button>
                    <button
                      onClick={() => startEdit(banner)}
                      className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setConfirmDeleteId(banner.id)}
                      className="p-1.5 text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ManageBanners;
