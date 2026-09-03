'use client';

import { useState, useEffect } from 'react';
import { roleLabel } from '@/lib/utils';
import type { AppUser } from '@/lib/types';

export default function UsersPage() {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState({ email: '', name: '', role: 'school_user' });
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [addSuccess, setAddSuccess] = useState<string | null>(null);

  async function loadUsers() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setUsers(data.users);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadUsers(); }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setAddLoading(true);
    setAddError(null);
    setAddSuccess(null);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(addForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setAddSuccess(`${addForm.name} נוסף/ה בהצלחה`);
      setAddForm({ email: '', name: '', role: 'school_user' });
      setShowAdd(false);
      await loadUsers();
    } catch (err: any) {
      setAddError(err.message);
    } finally {
      setAddLoading(false);
    }
  }

  async function toggleActive(user: AppUser) {
    const newStatus = !user.is_active;
    if (!confirm(`${newStatus ? 'להפעיל' : 'להשבית'} את ${user.name}?`)) return;
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: user.id, is_active: newStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      await loadUsers();
    } catch (err: any) {
      alert(err.message);
    }
  }

  async function changeRole(user: AppUser, newRole: string) {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: user.id, role: newRole }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      await loadUsers();
    } catch (err: any) {
      alert(err.message);
    }
  }

  if (loading) return <div className="max-w-3xl mx-auto px-4 py-16 text-center text-muted">טוען...</div>;
  if (error) return <div className="max-w-3xl mx-auto px-4 py-16 text-center text-overdue">{error}</div>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display font-bold text-2xl">ניהול משתמשים</h1>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="bg-ink text-white text-sm font-medium px-5 py-2.5 hover:opacity-90 transition-opacity"
        >
          {showAdd ? 'ביטול' : '+ הוספת משתמש/ת'}
        </button>
      </div>

      {addSuccess && (
        <div className="bg-paidBg text-paid text-sm p-3 mb-4">{addSuccess}</div>
      )}

      {showAdd && (
        <form onSubmit={handleAdd} className="border border-line bg-white p-5 mb-6 flex flex-col gap-3">
          <p className="text-sm text-muted">
            המשתמש/ת צריכ/ה קודם לנסות להיכנס לאתר עם Google פעם אחת (יגיעו למסך "אין הרשאה"). רק אחר כך אפשר להוסיף אותם כאן.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted">כתובת מייל *</label>
              <input
                type="email"
                required
                className="border border-line px-3 py-2 text-sm"
                value={addForm.email}
                onChange={(e) => setAddForm((f) => ({ ...f, email: e.target.value }))}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted">שם מלא *</label>
              <input
                type="text"
                required
                className="border border-line px-3 py-2 text-sm"
                value={addForm.name}
                onChange={(e) => setAddForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted">תפקיד *</label>
              <select
                className="border border-line px-3 py-2 text-sm"
                value={addForm.role}
                onChange={(e) => setAddForm((f) => ({ ...f, role: e.target.value }))}
              >
                <option value="school_user">משתמשת בית ספר</option>
                <option value="secretary">מזכיר/ה</option>
                <option value="admin">מנהל/ת</option>
              </select>
            </div>
          </div>
          {addError && <p className="text-overdue text-sm">{addError}</p>}
          <button
            type="submit"
            disabled={addLoading}
            className="self-start bg-ink text-white text-sm font-medium px-5 py-2 hover:opacity-90 disabled:opacity-50"
          >
            {addLoading ? 'מוסיף...' : 'הוספה'}
          </button>
        </form>
      )}

      <div className="flex flex-col gap-2">
        {users.map((user) => (
          <div key={user.id} className={`border border-line bg-white p-4 flex items-center gap-4 flex-wrap ${!user.is_active ? 'opacity-50' : ''}`}>
            <div className="flex-1 min-w-[160px]">
              <div className="font-medium text-sm">{user.name}</div>
              <div className="text-xs text-muted">{user.email}</div>
            </div>
            <select
              className="border border-line px-2 py-1 text-sm"
              value={user.role}
              onChange={(e) => changeRole(user, e.target.value)}
            >
              <option value="school_user">משתמשת בית ספר</option>
              <option value="secretary">מזכיר/ה</option>
              <option value="admin">מנהל/ת</option>
            </select>
            <button
              onClick={() => toggleActive(user)}
              className={`text-xs px-3 py-1 border ${
                user.is_active
                  ? 'border-overdue text-overdue hover:bg-overdueBg'
                  : 'border-paid text-paid hover:bg-paidBg'
              }`}
            >
              {user.is_active ? 'השבתה' : 'הפעלה'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
