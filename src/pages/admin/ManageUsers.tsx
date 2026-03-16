import React, { useState } from 'react';
import { users as mockUsers } from '@/data/mockData';
import { User } from '@/types';
import toast from 'react-hot-toast';

const ManageUsers = () => {
  const [userList, setUserList] = useState<User[]>(mockUsers);

  const toggleRole = (id: number) => {
    setUserList(prev => prev.map(u => u.id === id ? { ...u, role: u.role === 'admin' ? 'user' : 'admin' } : u));
    toast.success('User role updated');
  };

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold mb-6">Manage Users</h1>
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted">
                <th className="text-left p-3 text-xs uppercase text-muted-foreground font-medium">Name</th>
                <th className="text-left p-3 text-xs uppercase text-muted-foreground font-medium">Email</th>
                <th className="text-left p-3 text-xs uppercase text-muted-foreground font-medium">Role</th>
                <th className="text-left p-3 text-xs uppercase text-muted-foreground font-medium">Joined</th>
                <th className="text-right p-3 text-xs uppercase text-muted-foreground font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {userList.map(u => (
                <tr key={u.id} className="border-b border-border last:border-0">
                  <td className="p-3 font-medium">{u.name}</td>
                  <td className="p-3 text-muted-foreground">{u.email}</td>
                  <td className="p-3"><span className="text-xs px-2 py-1 rounded-full bg-muted capitalize">{u.role}</span></td>
                  <td className="p-3 text-muted-foreground">{u.created_at}</td>
                  <td className="p-3 text-right">
                    <button onClick={() => toggleRole(u.id)} className="text-xs text-primary hover:underline">
                      Make {u.role === 'admin' ? 'User' : 'Admin'}
                    </button>
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

export default ManageUsers;
