import React, { useEffect, useState } from 'react';
import { formatPrice } from '@/lib/format';
import { Trash2, Pencil, Plus, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { brandAPI, categoryAPI, productAPI } from '@/lib/api';
import { Brand, Category, Product } from '@/types';

type ProductFormState = {
  name: string;
  brand_id: string;
  category_id: string;
  description: string;
  scent_family: Product['scent_family'];
  top_notes: string;
  middle_notes: string;
  base_notes: string;
  price: string;
  discount_price: string;
  stock: string;
  size_ml: string;
  is_featured: boolean;
  is_new_arrival: boolean;
};

const defaultForm: ProductFormState = {
  name: '',
  brand_id: '',
  category_id: '',
  description: '',
  scent_family: 'floral',
  top_notes: '',
  middle_notes: '',
  base_notes: '',
  price: '',
  discount_price: '',
  stock: '0',
  size_ml: '',
  is_featured: false,
  is_new_arrival: false,
};

const ManageProducts = () => {
  const [productList, setProductList] = useState<Product[]>([]);
  const [brandList, setBrandList] = useState<Brand[]>([]);
  const [categoryList, setCategoryList] = useState<Category[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingProductId, setEditingProductId] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState<ProductFormState>(defaultForm);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const loadProducts = async () => {
    try {
      const data = await productAPI.getAll({ page: 1, limit: 100 });
      setProductList(data.products || []);
    } catch (error) {
      console.error('Failed to load products:', error);
      toast.error('Failed to load products');
    }
  };

  useEffect(() => {
    loadProducts();
    loadMeta();
  }, []);

  const loadMeta = async () => {
    try {
      const [brands, categories] = await Promise.all([brandAPI.getAll(), categoryAPI.getAll()]);
      setBrandList(brands || []);
      setCategoryList(categories || []);
    } catch (error) {
      console.error('Failed to load brands/categories:', error);
      toast.error('Failed to load brand/category data');
    }
  };

  const resetForm = () => {
    setForm(defaultForm);
    setImageFile(null);
    setEditingProductId(null);
    setShowForm(false);
  };

  const startCreate = () => {
    setForm(defaultForm);
    setImageFile(null);
    setEditingProductId(null);
    setShowForm(true);
  };

  const startEdit = (product: Product) => {
    setForm({
      name: product.name,
      brand_id: String(product.brand_id),
      category_id: String(product.category_id),
      description: product.description || '',
      scent_family: product.scent_family,
      top_notes: product.top_notes || '',
      middle_notes: product.middle_notes || '',
      base_notes: product.base_notes || '',
      price: String(product.price ?? ''),
      discount_price: product.discount_price !== null ? String(product.discount_price) : '',
      stock: String(product.stock ?? 0),
      size_ml: product.size_ml ? String(product.size_ml) : '',
      is_featured: Boolean(product.is_featured),
      is_new_arrival: Boolean(product.is_new_arrival),
    });
    setImageFile(null);
    setEditingProductId(product.id);
    setShowForm(true);
  };

  const buildPayload = () => {
    const payload = new FormData();
    payload.append('name', form.name.trim());
    payload.append('brand_id', form.brand_id);
    payload.append('category_id', form.category_id);
    payload.append('description', form.description.trim());
    payload.append('scent_family', form.scent_family);
    payload.append('top_notes', form.top_notes.trim());
    payload.append('middle_notes', form.middle_notes.trim());
    payload.append('base_notes', form.base_notes.trim());
    payload.append('price', form.price);
    if (form.discount_price.trim() !== '') {
      payload.append('discount_price', form.discount_price);
    }
    payload.append('stock', form.stock);
    if (form.size_ml.trim() !== '') {
      payload.append('size_ml', form.size_ml);
    }
    payload.append('is_featured', String(form.is_featured));
    payload.append('is_new_arrival', String(form.is_new_arrival));
    if (imageFile) {
      payload.append('image', imageFile);
    }
    return payload;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.brand_id || !form.category_id || !form.price) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      setIsSaving(true);
      const payload = buildPayload();

      if (editingProductId) {
        await productAPI.update(editingProductId, payload);
        toast.success('Product updated');
      } else {
        await productAPI.create(payload);
        toast.success('Product added');
      }

      await loadProducts();
      resetForm();
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to save product';
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await productAPI.delete(id);
      setProductList(prev => prev.filter(p => p.id !== id));
      toast.success('Product deleted');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to delete product';
      toast.error(message);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-2xl font-bold">Manage Products</h1>
        <button onClick={startCreate} className="btn-gold text-xs flex items-center gap-1">
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-card rounded-xl p-5 border border-border mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            placeholder="Product Name"
            value={form.name}
            onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
            required
            className="bg-muted rounded-lg px-3 py-2 text-sm outline-none"
          />
          <select
            value={form.brand_id}
            onChange={(e) => setForm((prev) => ({ ...prev, brand_id: e.target.value }))}
            required
            className="bg-muted rounded-lg px-3 py-2 text-sm outline-none"
          >
            <option value="">Select Brand</option>
            {brandList.map((brand) => (
              <option key={brand.id} value={brand.id}>{brand.name}</option>
            ))}
          </select>

          <select
            value={form.category_id}
            onChange={(e) => setForm((prev) => ({ ...prev, category_id: e.target.value }))}
            required
            className="bg-muted rounded-lg px-3 py-2 text-sm outline-none"
          >
            <option value="">Select Category</option>
            {categoryList.map((category) => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </select>

          <select
            value={form.scent_family}
            onChange={(e) => setForm((prev) => ({ ...prev, scent_family: e.target.value as Product['scent_family'] }))}
            className="bg-muted rounded-lg px-3 py-2 text-sm outline-none"
          >
            <option value="floral">Floral</option>
            <option value="woody">Woody</option>
            <option value="oriental">Oriental</option>
            <option value="fresh">Fresh</option>
            <option value="gourmand">Gourmand</option>
          </select>

          <input
            type="number"
            min="0"
            step="0.01"
            placeholder="Price"
            value={form.price}
            onChange={(e) => setForm((prev) => ({ ...prev, price: e.target.value }))}
            required
            className="bg-muted rounded-lg px-3 py-2 text-sm outline-none"
          />

          <input
            type="number"
            min="0"
            step="0.01"
            placeholder="Discount Price"
            value={form.discount_price}
            onChange={(e) => setForm((prev) => ({ ...prev, discount_price: e.target.value }))}
            className="bg-muted rounded-lg px-3 py-2 text-sm outline-none"
          />

          <input
            type="number"
            min="0"
            placeholder="Stock"
            value={form.stock}
            onChange={(e) => setForm((prev) => ({ ...prev, stock: e.target.value }))}
            className="bg-muted rounded-lg px-3 py-2 text-sm outline-none"
          />

          <input
            type="number"
            min="1"
            placeholder="Size (ml)"
            value={form.size_ml}
            onChange={(e) => setForm((prev) => ({ ...prev, size_ml: e.target.value }))}
            className="bg-muted rounded-lg px-3 py-2 text-sm outline-none"
          />

          <input
            placeholder="Top Notes"
            value={form.top_notes}
            onChange={(e) => setForm((prev) => ({ ...prev, top_notes: e.target.value }))}
            className="bg-muted rounded-lg px-3 py-2 text-sm outline-none"
          />

          <input
            placeholder="Middle Notes"
            value={form.middle_notes}
            onChange={(e) => setForm((prev) => ({ ...prev, middle_notes: e.target.value }))}
            className="bg-muted rounded-lg px-3 py-2 text-sm outline-none"
          />

          <input
            placeholder="Base Notes"
            value={form.base_notes}
            onChange={(e) => setForm((prev) => ({ ...prev, base_notes: e.target.value }))}
            className="bg-muted rounded-lg px-3 py-2 text-sm outline-none"
          />

          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files?.[0] || null)}
            className="bg-muted rounded-lg px-3 py-2 text-sm outline-none"
          />

          <textarea
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
            rows={3}
            className="bg-muted rounded-lg px-3 py-2 text-sm outline-none md:col-span-2"
          />

          <label className="text-sm text-muted-foreground inline-flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.is_featured}
              onChange={(e) => setForm((prev) => ({ ...prev, is_featured: e.target.checked }))}
            />
            Featured product
          </label>

          <label className="text-sm text-muted-foreground inline-flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.is_new_arrival}
              onChange={(e) => setForm((prev) => ({ ...prev, is_new_arrival: e.target.checked }))}
            />
            New arrival
          </label>

          <div className="md:col-span-2 flex items-center gap-2">
            <button type="submit" disabled={isSaving} className="btn-gold text-xs py-2">
              {isSaving ? 'Saving...' : editingProductId ? 'Update Product' : 'Save Product'}
            </button>
            <button type="button" onClick={resetForm} className="text-xs px-3 py-2 rounded-lg border border-border">
              <X className="w-4 h-4 inline mr-1" /> Cancel
            </button>
          </div>
        </form>
      )}

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted">
                <th className="text-left p-3 text-xs uppercase text-muted-foreground font-medium">Product</th>
                <th className="text-left p-3 text-xs uppercase text-muted-foreground font-medium">Brand</th>
                <th className="text-left p-3 text-xs uppercase text-muted-foreground font-medium">Price</th>
                <th className="text-left p-3 text-xs uppercase text-muted-foreground font-medium">Stock</th>
                <th className="text-right p-3 text-xs uppercase text-muted-foreground font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {productList.map(p => (
                <tr key={p.id} className="border-b border-border last:border-0 hover:bg-muted/50">
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-muted rounded-lg overflow-hidden flex items-center justify-center text-xs">
                        {p.image_url ? (
                          <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                        ) : (
                          <span>🌸</span>
                        )}
                      </div>
                      <span className="font-medium">{p.name}</span>
                    </div>
                  </td>
                  <td className="p-3 text-muted-foreground">{p.brand_name}</td>
                  <td className="p-3">{formatPrice(p.discount_price || p.price)}</td>
                  <td className="p-3">{p.stock}</td>
                  <td className="p-3 text-right">
                    <button onClick={() => startEdit(p)} className="p-1.5 text-muted-foreground hover:text-foreground mr-1"><Pencil className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(p.id)} className="p-1.5 text-muted-foreground hover:text-destructive"><Trash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManageProducts;
