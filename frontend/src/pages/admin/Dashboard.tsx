import React from 'react';
import { DollarSign, ShoppingCart, Package, Users } from 'lucide-react';
import { products, users, sampleOrders, formatPrice } from '@/data/mockData';

const stats = [
  { label: 'Total Revenue', value: formatPrice(sampleOrders.reduce((s, o) => s + o.total_amount, 0)), icon: DollarSign, color: 'text-green-600 bg-green-100' },
  { label: 'Total Orders', value: sampleOrders.length.toString(), icon: ShoppingCart, color: 'text-blue-600 bg-blue-100' },
  { label: 'Total Products', value: products.length.toString(), icon: Package, color: 'text-purple-600 bg-purple-100' },
  { label: 'Total Users', value: users.length.toString(), icon: Users, color: 'text-orange-600 bg-orange-100' },
];

const Dashboard = () => {
  return (
    <div>
      <h1 className="font-heading text-2xl font-bold mb-6">Dashboard</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(stat => (
          <div key={stat.label} className="bg-card rounded-xl p-5 border border-border">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-muted-foreground uppercase tracking-wider">{stat.label}</span>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${stat.color}`}>
                <stat.icon className="w-4 h-4" />
              </div>
            </div>
            <p className="font-heading text-2xl font-bold">{stat.value}</p>
          </div>
        ))}
      </div>

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
              {sampleOrders.map(order => (
                <tr key={order.id} className="border-b border-border last:border-0">
                  <td className="py-3 font-medium">#{order.id}</td>
                  <td className="py-3">{formatPrice(order.total_amount)}</td>
                  <td className="py-3"><span className="text-xs px-2 py-1 rounded-full bg-muted capitalize">{order.status}</span></td>
                  <td className="py-3 text-muted-foreground">{order.created_at}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
