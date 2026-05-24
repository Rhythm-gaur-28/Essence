import React, { useEffect, useState } from 'react';
import { DollarSign, ShoppingCart, Package, Users, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';

const API = 'http://localhost:5000';

const formatPrice = (value: number) =>
  `₹${Number(value || 0).toLocaleString()}`;

const formatDate = (val: string) => {
  if (!val) return '—';
  return new Date(val).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric'
  });
};

const iconMap = {
  revenue: DollarSign,
  orders: ShoppingCart,
  products: Package,
  users: Users
};

const colorMap = {
  revenue: 'text-green-600 bg-green-100',
  orders: 'text-blue-600 bg-blue-100',
  products: 'text-purple-600 bg-purple-100',
  users: 'text-orange-600 bg-orange-100',
};

const Dashboard = () => {
  const token = localStorage.getItem('be_token');

  const [stats, setStats] = useState({ revenue: 0, orders: 0, products: 0, users: 0 });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingId, setMarkingId] = useState<number | null>(null);

  useEffect(() => {
    const headers = { Authorization: `Bearer ${token}` };

    Promise.all([
      fetch(`${API}/api/dashboard/stats`, { headers }).then(r => r.json()),
      fetch(`${API}/api/dashboard/recent-orders`, { headers }).then(r => r.json()),
      fetch(`${API}/api/dashboard/best-seller-candidates`, { headers }).then(r => r.json()),
    ])
      .then(([s, o, c]) => {
        setStats({
          revenue: s?.revenue || 0,
          orders: s?.orders || 0,
          products: s?.products || 0,
          users: s?.users || 0,
        });
        setRecentOrders(Array.isArray(o) ? o : []);
        setCandidates(Array.isArray(c) ? c : []);
      })
      .catch(() => console.error('Dashboard load failed'))
      .finally(() => setLoading(false));
  }, [token]);

  const handleMarkBestSeller = async (productId: number) => {
    setMarkingId(productId);
    try {
      const res = await fetch(`${API}/api/products/${productId}/best-seller`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setCandidates(prev => prev.filter(c => c.id !== productId));
        toast.success('Marked as Best Seller!');
      } else {
        toast.error('Failed to update');
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setMarkingId(null);
    }
  };

  const statCards = [
    { label: 'Total Revenue', key: 'revenue', value: formatPrice(stats.revenue) },
    { label: 'Total Orders', key: 'orders', value: String(stats.orders) },
    { label: 'Total Products', key: 'products', value: String(stats.products) },
    { label: 'Total Users', key: 'users', value: String(stats.users) },
  ] as const;

  if (loading) {
    return <p className="text-muted-foreground text-sm">Loading...</p>;
  }

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold mb-6">Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map(stat => {
          const Icon = iconMap[stat.key];
          return (
            <div key={stat.label} className="bg-card rounded-xl p-5 border border-border">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-muted-foreground uppercase tracking-wider">
                  {stat.label}
                </span>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${colorMap[stat.key]}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <p className="font-heading text-2xl font-bold">{stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* Best Seller Notifications */}
      {candidates.length > 0 && (
        <div className="bg-card rounded-xl border border-amber-200 p-5 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <h2 className="font-heading text-base font-semibold text-amber-800">Best Seller Suggestions</h2>
              <p className="text-xs text-amber-600">These products have crossed 10 orders. Mark them as Best Seller?</p>
            </div>
          </div>

          <div className="space-y-2">
            {candidates.map(c => {
              const imgSrc = c.image_url
                ? (c.image_url.startsWith('http') ? c.image_url : `${API}${c.image_url}`)
                : null;
              return (
                <div key={c.id} className="flex items-center gap-3 bg-amber-50 rounded-lg px-4 py-2.5 border border-amber-100">
                  {imgSrc && (
                    <img src={imgSrc} alt={c.name} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{c.name}</p>
                    <p className="text-xs text-muted-foreground">{c.brand_name} · {c.order_count} orders</p>
                  </div>
                  <button
                    onClick={() => handleMarkBestSeller(c.id)}
                    disabled={markingId === c.id}
                    className="text-xs bg-amber-600 hover:bg-amber-700 text-white px-3 py-1.5 rounded-lg font-medium transition-colors disabled:opacity-60 shrink-0"
                  >
                    {markingId === c.id ? 'Saving...' : 'Mark as Best Seller'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent Orders */}
      <div className="bg-card rounded-xl border border-border p-5">
        <h2 className="font-heading text-lg font-semibold mb-4">Recent Orders</h2>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 text-xs uppercase text-muted-foreground font-medium">Order ID</th>
                <th className="text-left py-2 text-xs uppercase text-muted-foreground font-medium">Total</th>
                <th className="text-left py-2 text-xs uppercase text-muted-foreground font-medium">Status</th>
                <th className="text-left py-2 text-xs uppercase text-muted-foreground font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map(order => (
                <tr key={order.id} className="border-b border-border last:border-0">
                  <td className="py-3 font-medium">#{order.id}</td>
                  <td className="py-3">{formatPrice(order.total_amount)}</td>
                  <td className="py-3">
                    <span className="text-xs px-2 py-1 rounded-full bg-muted capitalize">
                      {order.status}
                    </span>
                  </td>
                  <td className="py-3 text-muted-foreground">{formatDate(order.created_at)}</td>
                </tr>
              ))}
              {recentOrders.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center py-6 text-muted-foreground">No recent orders</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
