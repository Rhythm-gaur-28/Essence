import React, { useState } from 'react';
import { products as allProducts, formatPrice } from '@/data/mockData';
import { Trash2, Pencil } from 'lucide-react';
import toast from 'react-hot-toast';

const ManageProducts = () => {
  const [productList, setProductList] = useState(allProducts);

  const handleDelete = (id: number) => {
    setProductList(prev => prev.filter(p => p.id !== id));
    toast.success('Product deleted');
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-2xl font-bold">Manage Products</h1>
      </div>

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
                      <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center text-xs">🌸</div>
                      <span className="font-medium">{p.name}</span>
                    </div>
                  </td>
                  <td className="p-3 text-muted-foreground">{p.brand_name}</td>
                  <td className="p-3">{formatPrice(p.discount_price || p.price)}</td>
                  <td className="p-3">{p.stock}</td>
                  <td className="p-3 text-right">
                    <button className="p-1.5 text-muted-foreground hover:text-foreground mr-1"><Pencil className="w-4 h-4" /></button>
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
