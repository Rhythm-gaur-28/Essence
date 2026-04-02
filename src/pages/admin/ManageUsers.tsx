import React, { useState, useEffect } from 'react';
import { Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import ConfirmModal from '@/components/ConfirmModal';

const formatDate = (val: string) => {
  if (!val) return '—';
  return new Date(val).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
};

type PendingAction =
  | { type: 'delete'; id: number; name: string }
  | { type: 'role'; id: number; currentRole: string; name: string };

const ManageUsers = () => {
  const token = localStorage.getItem('be_token');
  const { user: currentUser } = useAuth();
  const [userList, setUserList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);

  useEffect(() => {
    fetch('http://localhost:5000/api/users', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => setUserList(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, []);

  const toggleRole = async (id: number, currentRole: string) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    const res = await fetch(`http://localhost:5000/api/users/${id}/role`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ role: newRole }),
    });
    if (res.ok) {
      setUserList(prev => prev.map(u => u.id === id ? { ...u, role: newRole } : u));
      toast.success('User role updated');
    } else {
      toast.error('Failed to update role');
    }
    setPendingAction(null);
  };

  const handleDelete = async (id: number) => {
    const res = await fetch(`http://localhost:5000/api/users/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();
    if (res.ok) {
      setUserList(prev => prev.filter(u => u.id !== id));
      toast.success('User deleted');
    } else {
      toast.error(data.msg || 'Failed to delete user');
    }
    setPendingAction(null);
  };

  const getModalProps = () => {
    if (!pendingAction) return null;
    if (pendingAction.type === 'delete') {
      return {
        title: 'Delete User',
        message: 'This will also remove all data associated with this user. Continue?',
        confirmLabel: 'Yes, Delete',
        confirmVariant: 'destructive' as const,
        onConfirm: () => handleDelete(pendingAction.id),
      };
    }
    const isGranting = pendingAction.currentRole !== 'admin';
    return {
      title: isGranting ? 'Grant Admin Privileges' : 'Remove Admin Privileges',
      message: isGranting
        ? 'Are you sure you want to grant admin privileges to this user?'
        : 'Are you sure you want to remove admin privileges from this user?',
      confirmLabel: isGranting ? 'Yes, Grant' : 'Yes, Remove',
      confirmVariant: isGranting ? 'primary' as const : 'destructive' as const,
      onConfirm: () => toggleRole(pendingAction.id, pendingAction.currentRole),
    };
  };

  const modalProps = getModalProps();

  if (loading) return <p className="text-muted-foreground text-sm">Loading...</p>;

  return (
    <div>
      {pendingAction !== null && modalProps && (
        <ConfirmModal
          {...modalProps}
          onCancel={() => setPendingAction(null)}
        />
      )}

      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-2xl font-bold">Manage Users</h1>
        <span className="text-sm text-muted-foreground">{userList.length} users total</span>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted">
                <th className="text-left p-3 text-xs uppercase text-muted-foreground font-medium">Name</th>
                <th className="text-left p-3 text-xs uppercase text-muted-foreground font-medium">Email</th>
                <th className="text-left p-3 text-xs uppercase text-muted-foreground font-medium">Role</th>
                <th className="text-left p-3 text-xs uppercase text-muted-foreground font-medium">Joined</th>
                <th className="text-right p-3 text-xs uppercase text-muted-foreground font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {userList.map(u => {
                const isSelf = u.id === currentUser?.id;
                return (
                  <tr key={u.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                    <td className="p-3 font-medium">
                      {u.name}
                      {isSelf && (
                        <span className="ml-2 text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">You</span>
                      )}
                    </td>
                    <td className="p-3 text-muted-foreground">{u.email}</td>
                    <td className="p-3">
                      <span className={`text-xs px-2 py-1 rounded-full capitalize font-medium ${
                        u.role === 'admin'
                          ? 'bg-primary/10 text-primary'
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="p-3 text-muted-foreground">{formatDate(u.created_at)}</td>
                    <td className="p-3 text-right flex items-center justify-end gap-2">
                      {!isSelf && (
                        <>
                          <button
                            onClick={() => setPendingAction({ type: 'role', id: u.id, currentRole: u.role, name: u.name })}
                            className="text-xs text-primary hover:underline"
                          >
                            Make {u.role === 'admin' ? 'User' : 'Admin'}
                          </button>
                          <button
                            onClick={() => setPendingAction({ type: 'delete', id: u.id, name: u.name })}
                            className="p-1.5 text-muted-foreground hover:text-destructive transition-colors"
                            title="Delete user"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManageUsers;
