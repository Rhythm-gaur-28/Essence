import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { formatPrice } from '@/data/mockData';
import { formatDate } from '@/utils/formatDate';
import { Pencil, Trash2, Star } from 'lucide-react';
import toast from 'react-hot-toast';
import ConfirmModal from '@/components/ConfirmModal';

const API = 'http://localhost:5000';

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  shipped: 'bg-purple-100 text-purple-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

const emptyAddr = { receiver_name: '', phone: '', street: '', city: '', state: '', pincode: '' };
const addrInputCls = 'w-full bg-muted rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30';
const addrLabelCls = 'text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1 block';

// Defined OUTSIDE Profile so React doesn't recreate the component type on every render.
// This prevents uncontrolled input remounting (focus loss on each keystroke).
interface AddressFormProps {
  values: typeof emptyAddr;
  onChange: (field: string, value: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
  loading: boolean;
  submitLabel: string;
}

const AddressForm = ({ values, onChange, onSubmit, onCancel, loading, submitLabel }: AddressFormProps) => (
  <div className="border border-border rounded-xl p-4 space-y-3 mt-3 bg-muted/20">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {(Object.keys(emptyAddr) as (keyof typeof emptyAddr)[]).map(field => (
        <div key={field} className={field === 'street' ? 'md:col-span-2' : ''}>
          <label className={addrLabelCls}>
            {field === 'receiver_name' ? 'Receiver Name' : field.replace('_', ' ')}
          </label>
          <input
            value={values[field]}
            onChange={e => {
              let v = e.target.value;
              if (field === 'receiver_name') v = v.replace(/[^A-Za-z\s]/g, '');
              if (field === 'phone') v = v.replace(/[^0-9]/g, '').slice(0, 10);
              if (field === 'pincode') v = v.replace(/[^0-9]/g, '').slice(0, 6);
              onChange(field, v);
            }}
            className={addrInputCls}
          />
        </div>
      ))}
    </div>
    <div className="flex gap-2 pt-1">
      <button onClick={onSubmit} disabled={loading} className="btn-gold text-xs disabled:opacity-60">
        {loading ? 'Saving...' : submitLabel}
      </button>
      <button onClick={onCancel} className="btn-outline-gold text-xs">Cancel</button>
    </div>
  </div>
);

const Profile = () => {
  const { user } = useAuth();
  const token = localStorage.getItem('be_token');
  const [tab, setTab] = useState<'orders' | 'addresses' | 'settings'>('orders');
  const [orders, setOrders] = useState<any[]>([]);
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');

  // Profile state
  const [profileMsg, setProfileMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Addresses state
  const [addresses, setAddresses] = useState<any[]>([]);
  const [addrLoading, setAddrLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAddr, setNewAddr] = useState({ ...emptyAddr });
  const [addingAddr, setAddingAddr] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editAddr, setEditAddr] = useState({ ...emptyAddr });
  const [savingEdit, setSavingEdit] = useState(false);
  const [confirmDeleteAddrId, setConfirmDeleteAddrId] = useState<number | null>(null);

  useEffect(() => {
    if (!token) return;
    fetch(`${API}/api/orders/my-orders`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => setOrders(data))
      .catch(() => setOrders([]));
  }, []);

  useEffect(() => {
    if (tab !== 'addresses' || !token) return;
    setAddrLoading(true);
    fetch(`${API}/api/addresses`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => setAddresses(Array.isArray(data) ? data : []))
      .catch(() => setAddresses([]))
      .finally(() => setAddrLoading(false));
  }, [tab]);

  const handleProfileUpdate = async () => {
    setProfileMsg(null);
    if (!name.trim() || !email.trim())
      return setProfileMsg({ text: 'Name and email cannot be empty.', ok: false });
    if (!token) return setProfileMsg({ text: 'You are not logged in.', ok: false });
    setProfileLoading(true);
    try {
      const res = await fetch(`${API}/api/auth/update-profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name, email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setProfileMsg({ text: data.msg || 'Failed to update profile.', ok: false });
      } else {
        setProfileMsg({ text: 'Profile updated successfully!', ok: true });
        const stored = localStorage.getItem('be_user');
        if (stored) {
          const parsed = JSON.parse(stored);
          localStorage.setItem('be_user', JSON.stringify({ ...parsed, name, email }));
        }
      }
    } catch {
      setProfileMsg({ text: 'Something went wrong. Please try again.', ok: false });
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    setPasswordMsg(null);
    if (!currentPassword || !newPassword || !confirmPassword)
      return setPasswordMsg({ text: 'Please fill in all password fields.', ok: false });
    if (newPassword.length < 6)
      return setPasswordMsg({ text: 'New password must be at least 6 characters.', ok: false });
    if (newPassword !== confirmPassword)
      return setPasswordMsg({ text: 'New passwords do not match.', ok: false });
    if (!token) return setPasswordMsg({ text: 'You are not logged in.', ok: false });
    setPasswordLoading(true);
    try {
      const res = await fetch(`${API}/api/auth/update-password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPasswordMsg({ text: data.msg || 'Failed to update password.', ok: false });
      } else {
        setPasswordMsg({ text: 'Password updated successfully!', ok: true });
        setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
      }
    } catch {
      setPasswordMsg({ text: 'Something went wrong. Please try again.', ok: false });
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleAddAddress = async () => {
    const { receiver_name, phone, street, city, state, pincode } = newAddr;
    if (!receiver_name || !phone || !street || !city || !state || !pincode)
      return toast.error('Please fill in all fields');
    if (phone.length !== 10) return toast.error('Enter a valid 10-digit phone number');
    if (pincode.length !== 6) return toast.error('Enter a valid 6-digit pincode');
    setAddingAddr(true);
    try {
      const res = await fetch(`${API}/api/addresses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(newAddr),
      });
      const data = await res.json();
      if (!res.ok) return toast.error(data.msg || 'Failed to add address');
      setAddresses(prev => {
        const updated = [...prev, data];
        // If first address, mark it default in local state
        if (prev.length === 0) return updated.map((a, i) => i === 0 ? { ...a, is_default: 1 } : a);
        return updated;
      });
      setNewAddr({ ...emptyAddr });
      setShowAddForm(false);
      toast.success('Address added');
    } catch {
      toast.error('Something went wrong');
    } finally {
      setAddingAddr(false);
    }
  };

  const handleDeleteAddress = async (id: number) => {
    try {
      const res = await fetch(`${API}/api/addresses/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return toast.error('Failed to delete');
      setAddresses(prev => {
        const removed = prev.find(a => a.id === id);
        let updated = prev.filter(a => a.id !== id);
        if (removed?.is_default && updated.length > 0) {
          updated = updated.map((a, i) => i === 0 ? { ...a, is_default: 1 } : a);
        }
        return updated;
      });
      toast.success('Address deleted');
    } catch {
      toast.error('Something went wrong');
    } finally {
      setConfirmDeleteAddrId(null);
    }
  };

  const handleSetDefault = async (id: number) => {
    try {
      const res = await fetch(`${API}/api/addresses/${id}/default`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return toast.error('Failed to update default');
      setAddresses(prev => prev.map(a => ({ ...a, is_default: a.id === id ? 1 : 0 })));
      toast.success('Default address updated');
    } catch {
      toast.error('Something went wrong');
    }
  };

  const startEdit = (addr: any) => {
    setEditingId(addr.id);
    setEditAddr({ receiver_name: addr.receiver_name, phone: addr.phone, street: addr.street, city: addr.city, state: addr.state, pincode: addr.pincode });
  };

  const handleSaveEdit = async () => {
    const { receiver_name, phone, street, city, state, pincode } = editAddr;
    if (!receiver_name || !phone || !street || !city || !state || !pincode)
      return toast.error('Please fill in all fields');
    if (phone.length !== 10) return toast.error('Enter a valid 10-digit phone number');
    if (pincode.length !== 6) return toast.error('Enter a valid 6-digit pincode');
    setSavingEdit(true);
    try {
      const res = await fetch(`${API}/api/addresses/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(editAddr),
      });
      if (!res.ok) return toast.error('Failed to update address');
      setAddresses(prev => prev.map(a => a.id === editingId ? { ...a, ...editAddr } : a));
      setEditingId(null);
      toast.success('Address updated');
    } catch {
      toast.error('Something went wrong');
    } finally {
      setSavingEdit(false);
    }
  };

  return (
    <div className="container mx-auto px-4 md:px-8 py-8 max-w-4xl">
      {confirmDeleteAddrId !== null && (
        <ConfirmModal
          onConfirm={() => handleDeleteAddress(confirmDeleteAddrId)}
          onCancel={() => setConfirmDeleteAddrId(null)}
        />
      )}

      <h1 className="font-heading text-2xl md:text-3xl font-bold mb-8">My Account</h1>

      {/* Tabs */}
      <div className="flex gap-4 mb-8 border-b border-border">
        {([
          ['orders', 'My Orders'],
          ['addresses', 'Saved Addresses'],
          ['settings', 'Account Settings'],
        ] as const).map(([t, label]) => (
          <button key={t} onClick={() => setTab(t)}
            className={`pb-3 text-sm font-medium transition-colors ${
              tab === t ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground'
            }`}>
            {label}
          </button>
        ))}
      </div>

      {/* ─── Orders Tab ─── */}
      {tab === 'orders' && (
        <div className="space-y-4">
          {orders.length > 0 ? orders.map(order => (
            <div key={order.id} className="bg-card rounded-xl p-5 border border-border">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <span className="font-heading text-sm font-semibold">Order #{order.id}</span>
                  <span className="text-xs text-muted-foreground ml-3">{formatDate(order.created_at, true)}</span>
                </div>
                <span className={`text-xs px-3 py-1 rounded-full capitalize font-medium ${statusColors[order.status]}`}>
                  {order.status}
                </span>
              </div>

              <div className="space-y-1 mb-3">
                {order.items.map((item: any, idx: number) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{item.product_name} ×{item.quantity}</span>
                    <span>{formatPrice(item.price_at_purchase * item.quantity)}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-border pt-2 space-y-1">
                {order.coupon_code && order.discount_amount > 0 && (
                  <div className="flex justify-between text-xs text-green-600">
                    <span>Coupon ({order.coupon_code})</span>
                    <span>− {formatPrice(order.discount_amount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-xs text-muted-foreground">{order.payment_method.toUpperCase()}</span>
                  <span className="font-semibold">{formatPrice(order.total_amount)}</span>
                </div>
              </div>
            </div>
          )) : (
            <p className="text-center text-muted-foreground py-10">No orders yet</p>
          )}
        </div>
      )}

      {/* ─── Addresses Tab ─── */}
      {tab === 'addresses' && (
        <div className="space-y-4">
          {addrLoading ? (
            <p className="text-sm text-muted-foreground">Loading addresses...</p>
          ) : (
            <>
              {addresses.length === 0 && !showAddForm && (
                <p className="text-sm text-muted-foreground py-4">No saved addresses yet.</p>
              )}

              {addresses.map(addr => (
                <div key={addr.id} className="bg-card rounded-xl border border-border p-4">
                  {editingId === addr.id ? (
                    <AddressForm
                      values={editAddr}
                      onChange={(k, v) => setEditAddr(prev => ({ ...prev, [k]: v }))}
                      onSubmit={handleSaveEdit}
                      onCancel={() => setEditingId(null)}
                      loading={savingEdit}
                      submitLabel="Save Changes"
                    />
                  ) : (
                    <div className="flex items-start justify-between gap-3">
                      <div className="text-sm space-y-0.5 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold">{addr.receiver_name}</p>
                          {addr.is_default === 1 && (
                            <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">Default</span>
                          )}
                        </div>
                        <p className="text-muted-foreground">{addr.phone}</p>
                        <p className="text-muted-foreground">
                          {addr.street}, {addr.city}, {addr.state} – {addr.pincode}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {addr.is_default !== 1 && (
                          <button
                            onClick={() => handleSetDefault(addr.id)}
                            title="Set as default"
                            className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-primary"
                          >
                            <Star className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => startEdit(addr)}
                          className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setConfirmDeleteAddrId(addr.id)}
                          className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {showAddForm && (
                <AddressForm
                  values={newAddr}
                  onChange={(k, v) => setNewAddr(prev => ({ ...prev, [k]: v }))}
                  onSubmit={handleAddAddress}
                  onCancel={() => { setShowAddForm(false); setNewAddr({ ...emptyAddr }); }}
                  loading={addingAddr}
                  submitLabel="Add Address"
                />
              )}

              {!showAddForm && (
                <button onClick={() => setShowAddForm(true)} className="btn-outline-gold text-sm">
                  + Add New Address
                </button>
              )}
            </>
          )}
        </div>
      )}

      {/* ─── Settings Tab ─── */}
      {tab === 'settings' && (
        <div className="bg-card rounded-xl p-6 border border-border max-w-lg">
          <h2 className="font-heading text-lg font-semibold mb-4">Update Profile</h2>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1 block">Name</label>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full bg-muted rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div>
              <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1 block">Email</label>
              <input
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-muted rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>

            {profileMsg && (
              <p className={`text-sm ${profileMsg.ok ? 'text-green-600' : 'text-destructive'}`}>{profileMsg.text}</p>
            )}

            <button onClick={handleProfileUpdate} disabled={profileLoading} className="btn-gold text-sm disabled:opacity-60">
              {profileLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>

          <h2 className="font-heading text-lg font-semibold mt-8 mb-4">Change Password</h2>

          <div className="space-y-4">
            <input type="password" placeholder="Current Password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)}
              className="w-full bg-muted rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30" />
            <input type="password" placeholder="New Password" value={newPassword} onChange={e => setNewPassword(e.target.value)}
              className="w-full bg-muted rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30" />
            <input type="password" placeholder="Confirm New Password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
              className="w-full bg-muted rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30" />

            {passwordMsg && (
              <p className={`text-sm ${passwordMsg.ok ? 'text-green-600' : 'text-destructive'}`}>{passwordMsg.text}</p>
            )}

            <button onClick={handlePasswordChange} disabled={passwordLoading} className="btn-gold text-sm disabled:opacity-60">
              {passwordLoading ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
