import React, { useState, useEffect } from 'react';
import { formatPrice } from '@/data/mockData';
import { Trash2, Pencil, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import ConfirmModal from '@/components/ConfirmModal';

const ManageProducts = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('be_token');

  const [productList, setProductList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmId, setConfirmId] = useState<number | null>(null);

  useEffect(() => {
    fetch('http://localhost:5000/api/products', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setProductList(Array.isArray(data) ? data : []))
      .catch(() => toast.error("Failed to load products"))
      .finally(() => setLoading(false));
  }, [token]);

  const handleDelete = async (id: number) => {
    const res = await fetch(`http://localhost:5000/api/products/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });

    if (res.ok) {
      setProductList(prev => prev.filter(p => p.id !== id));
      toast.success('Product deleted');
    } else {
      toast.error('Failed to delete product');
    }
    setConfirmId(null);
  };

  if (loading) {
    return <p className="text-muted-foreground text-sm">Loading...</p>;
  }

  return (
    <div>
      {confirmId !== null && (
        <ConfirmModal
          title="Delete Product"
          message="Are you sure you want to delete this item? All associated data will be removed."
          confirmLabel="Yes, Delete"
          onConfirm={() => handleDelete(confirmId)}
          onCancel={() => setConfirmId(null)}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-2xl font-bold">Manage Products</h1>

        <button
          onClick={() => navigate('/admin/products/add')}
          className="btn-gold text-xs flex items-center gap-1"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </button>
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted">
                <th className="text-left p-3 text-xs uppercase text-muted-foreground font-medium">
                  Product
                </th>
                <th className="text-left p-3 text-xs uppercase text-muted-foreground font-medium">
                  Brand
                </th>
                <th className="text-left p-3 text-xs uppercase text-muted-foreground font-medium">
                  Price
                </th>
                <th className="text-left p-3 text-xs uppercase text-muted-foreground font-medium">
                  Stock
                </th>
                <th className="text-right p-3 text-xs uppercase text-muted-foreground font-medium">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {productList.map(p => (
                <tr
                  key={p.id}
                  className="border-b border-border last:border-0 hover:bg-muted/50"
                >
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                        {p.image_url ? (
                          <img
                            src={p.image_url.startsWith('http') ? p.image_url : `http://localhost:5000${p.image_url}`}
                            alt={p.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs">🌸</div>
                        )}
                      </div>
                      <span className="font-medium">{p.name}</span>
                    </div>
                  </td>

                  <td className="p-3 text-muted-foreground">
                    {p.brand_name}
                  </td>

                  <td className="p-3">
                    {formatPrice(p.discount_price || p.price)}
                  </td>

                  <td className="p-3">{p.stock}</td>

                  <td className="p-3 text-right">
                    <button
                      onClick={() => navigate(`/admin/products/edit/${p.id}`)}
                      className="p-1.5 text-muted-foreground hover:text-foreground mr-1"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => setConfirmId(p.id)}
                      className="p-1.5 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}

              {productList.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="text-center p-6 text-muted-foreground"
                  >
                    No products found
                  </td>
                </tr>
              )}
            </tbody>

          </table>
        </div>
      </div>
    </div>
  );
};

export default ManageProducts;
