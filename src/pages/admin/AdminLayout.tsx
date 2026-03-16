import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from '@/components/AdminSidebar';

const AdminLayout = () => {
  return (
    <div className="flex">
      <AdminSidebar />
      <main className="flex-1 p-6 md:p-8">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
