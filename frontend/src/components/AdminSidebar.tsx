import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingCart, Users, Tag, Ticket, Image } from 'lucide-react';

const links = [
  { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/products', icon: Package, label: 'Products' },
  { to: '/admin/orders', icon: ShoppingCart, label: 'Orders' },
  { to: '/admin/users', icon: Users, label: 'Users' },
  { to: '/admin/brands', icon: Tag, label: 'Brands' },
  { to: '/admin/coupons', icon: Ticket, label: 'Coupons' },
  { to: '/admin/banners', icon: Image, label: 'Banners' },
];

const AdminSidebar = () => {
  const location = useLocation();

  return (
    <aside className="w-56 bg-card border-r border-border min-h-[calc(100vh-5rem)] p-4 hidden md:block">
      <h2 className="font-heading text-sm font-bold mb-4 uppercase tracking-wider text-muted-foreground">Admin Panel</h2>
      <nav className="space-y-1">
        {links.map(link => {
          const active = location.pathname === link.to;
          return (
            <Link key={link.to} to={link.to}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${active ? 'bg-primary text-primary-foreground font-medium' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}>
              <link.icon className="w-4 h-4" />
              {link.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};

export default AdminSidebar;
