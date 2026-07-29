'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, getUserRole } from '@/lib/api';
import type { AdminUser } from '@/lib/types';
import { useLang } from '@/contexts/LangContext';
import { useTheme } from '@/contexts/ThemeContext';
import Header from './Header';
import AuditLogPanel from './AuditLogPanel';

type Tab = 'users' | 'audit-log';

interface EditState {
  role: 'USER' | 'ADMIN';
  unlimited: boolean;
  limit: string;
}

export default function AdminPanel() {
  const { t } = useLang();
  const { theme } = useTheme();
  const router = useRouter();
  const isDark = theme === 'dark';

  const [tab, setTab] = useState<Tab>('users');
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editState, setEditState] = useState<EditState>({ role: 'USER', unlimited: true, limit: '' });
  const [saving, setSaving] = useState(false);
  const [banner, setBanner] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const token = localStorage.getItem('token');
    if (!token) { router.push('/'); return; }
    const role = getUserRole();
    setIsAdmin(role === 'ADMIN');
    if (role !== 'ADMIN') { setLoading(false); return; }

    api.listAdminUsers()
      .then(setUsers)
      .catch(() => setBanner({ msg: t.adminSaveFailed, type: 'error' }))
      .finally(() => setLoading(false));
  }, [router, t.adminSaveFailed]);

  function startEdit(user: AdminUser) {
    setEditingId(user.id);
    setEditState({
      role: user.role,
      unlimited: user.monthlyDomainLimit === null,
      limit: user.monthlyDomainLimit !== null ? String(user.monthlyDomainLimit) : '',
    });
  }

  function cancelEdit() {
    setEditingId(null);
  }

  async function saveEdit(userId: string) {
    setSaving(true);
    setBanner(null);
    try {
      const monthlyDomainLimit = editState.unlimited ? null : parseInt(editState.limit, 10);
      const updated = await api.updateAdminUser(userId, { role: editState.role, monthlyDomainLimit });
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId ? { ...u, role: updated.role as 'USER' | 'ADMIN', monthlyDomainLimit: updated.monthlyDomainLimit } : u
        )
      );
      setEditingId(null);
      setBanner({ msg: t.adminSaved, type: 'success' });
      setTimeout(() => setBanner(null), 3000);
    } catch (err: unknown) {
      const raw = err instanceof Error ? err.message : t.adminSaveFailed;
      const msg = raw === 'The system must always have at least one administrator.'
        ? t.adminLastAdminError
        : raw;
      setBanner({ msg, type: 'error' });
    } finally {
      setSaving(false);
    }
  }

  const cardCls = `rounded-xl overflow-hidden ${isDark ? 'bg-surface-container-low' : 'bg-white shadow-sm border border-slate-200'}`;
  const thCls = `px-4 py-3 text-left text-[10px] uppercase tracking-[0.15em] font-bold ${isDark ? 'text-on-surface-variant/70' : 'text-slate-400'}`;
  const tdCls = `px-4 py-3 text-sm ${isDark ? 'text-on-surface-variant' : 'text-slate-600'}`;
  const inputCls = `w-full border rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-primary ${
    isDark
      ? 'bg-surface-container border-outline-variant/40 text-white'
      : 'bg-white border-slate-300 text-slate-900'
  }`;
  const selectCls = `border rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-primary ${
    isDark
      ? 'bg-surface-container border-outline-variant/40 text-white'
      : 'bg-white border-slate-300 text-slate-900'
  }`;
  const btnPrimary = `px-3 py-1 rounded text-xs font-medium transition-colors ${
    isDark
      ? 'bg-primary text-on-primary hover:bg-primary/90'
      : 'bg-slate-900 text-white hover:bg-slate-700'
  }`;
  const btnSecondary = `px-3 py-1 rounded text-xs font-medium transition-colors ${
    isDark
      ? 'border border-outline-variant/40 text-on-surface-variant hover:border-outline-variant'
      : 'border border-slate-300 text-slate-600 hover:border-slate-400'
  }`;

  function remainingDisplay(user: AdminUser): string {
    if (user.role === 'ADMIN' || user.monthlyDomainLimit === null) return t.adminUnlimited;
    return String(Math.max(0, user.monthlyDomainLimit - user.domainsUsedThisMonth));
  }

  function limitDisplay(user: AdminUser): string {
    if (user.monthlyDomainLimit === null) return t.adminUnlimited;
    return String(user.monthlyDomainLimit);
  }

  if (loading) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-background' : 'bg-slate-50'}`}>
        <Header />
        <div className="pt-20 flex items-center justify-center h-screen">
          <span className={`text-sm ${isDark ? 'text-on-surface-variant' : 'text-slate-400'}`}>{t.adminLoading}</span>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-background' : 'bg-slate-50'}`}>
        <Header />
        <div className="pt-28 px-6 max-w-xl mx-auto">
          <p className={`text-sm ${isDark ? 'text-on-surface-variant' : 'text-slate-500'}`}>
            {t.adminAccessDenied}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-background' : 'bg-slate-50'}`}>
      <Header />

      <main className="pt-28 pb-16 px-6 max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className={`font-headline font-bold text-2xl tracking-tight mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {t.adminTitle}
          </h1>

          {/* Tabs */}
          <div className={`flex gap-1 p-1 rounded-lg w-fit ${isDark ? 'bg-surface-container' : 'bg-slate-100'}`}>
            {(['users', 'audit-log'] as Tab[]).map((t_) => (
              <button
                key={t_}
                onClick={() => setTab(t_)}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  tab === t_
                    ? isDark
                      ? 'bg-surface-container-high text-white shadow-sm'
                      : 'bg-white text-slate-900 shadow-sm'
                    : isDark
                    ? 'text-on-surface-variant hover:text-white'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {t_ === 'users' ? t.adminTabUsers : t.adminTabAuditLog}
              </button>
            ))}
          </div>
        </div>

        {tab === 'users' && (
          <>
            {banner && (
              <div className={`mb-6 px-4 py-3 rounded text-sm border ${
                banner.type === 'success'
                  ? isDark ? 'bg-surface-container border-outline-variant/20 text-white' : 'bg-green-50 border-green-200 text-green-800'
                  : isDark ? 'bg-error-container/30 border-error/20 text-error' : 'bg-red-50 border-red-200 text-red-800'
              }`}>
                {banner.msg}
              </div>
            )}

            <div className={cardCls}>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className={`border-b ${isDark ? 'border-outline-variant/20' : 'border-slate-100'}`}>
                      <th className={thCls}>{t.adminEmail}</th>
                      <th className={thCls}>{t.adminRole}</th>
                      <th className={thCls}>{t.adminMonthlyLimit}</th>
                      <th className={thCls}>{t.adminUsedThisMonth}</th>
                      <th className={thCls}>{t.adminRemaining}</th>
                      <th className={thCls}>{t.adminActions}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user, i) => {
                      const isEditing = editingId === user.id;
                      const rowBorder = i < users.length - 1
                        ? `border-b ${isDark ? 'border-outline-variant/10' : 'border-slate-50'}`
                        : '';

                      return (
                        <tr key={user.id} className={rowBorder}>
                          <td className={`${tdCls} font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>
                            {user.email}
                          </td>

                          {isEditing ? (
                            <>
                              <td className="px-4 py-2">
                                <select
                                  value={editState.role}
                                  onChange={(e) => setEditState((s) => ({ ...s, role: e.target.value as 'USER' | 'ADMIN' }))}
                                  className={selectCls}
                                >
                                  <option value="USER">USER</option>
                                  <option value="ADMIN">ADMIN</option>
                                </select>
                              </td>
                              <td className="px-4 py-2">
                                <div className="flex items-center gap-2">
                                  <input
                                    type="number"
                                    min={0}
                                    disabled={editState.unlimited}
                                    value={editState.limit}
                                    onChange={(e) => setEditState((s) => ({ ...s, limit: e.target.value }))}
                                    placeholder="0"
                                    className={`w-24 ${inputCls} disabled:opacity-40`}
                                  />
                                  <label className={`flex items-center gap-1 text-xs whitespace-nowrap cursor-pointer select-none ${isDark ? 'text-on-surface-variant' : 'text-slate-500'}`}>
                                    <input
                                      type="checkbox"
                                      checked={editState.unlimited}
                                      onChange={(e) => setEditState((s) => ({ ...s, unlimited: e.target.checked, limit: e.target.checked ? '' : s.limit }))}
                                      className="accent-primary"
                                    />
                                    {t.adminUnlimited}
                                  </label>
                                </div>
                              </td>
                              <td className={tdCls}>{user.domainsUsedThisMonth}</td>
                              <td className={tdCls}>—</td>
                              <td className="px-4 py-2">
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => saveEdit(user.id)}
                                    disabled={saving || (!editState.unlimited && (editState.limit === '' || Number(editState.limit) < 0))}
                                    className={`${btnPrimary} disabled:opacity-50`}
                                  >
                                    {saving ? '…' : t.adminSave}
                                  </button>
                                  <button onClick={cancelEdit} className={btnSecondary} disabled={saving}>
                                    {t.adminCancel}
                                  </button>
                                </div>
                              </td>
                            </>
                          ) : (
                            <>
                              <td className="px-4 py-3">
                                <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full ${
                                  user.role === 'ADMIN'
                                    ? isDark ? 'bg-primary/20 text-primary' : 'bg-indigo-100 text-indigo-700'
                                    : isDark ? 'bg-outline-variant/20 text-on-surface-variant' : 'bg-slate-100 text-slate-600'
                                }`}>
                                  {user.role}
                                </span>
                              </td>
                              <td className={tdCls}>{limitDisplay(user)}</td>
                              <td className={tdCls}>{user.domainsUsedThisMonth}</td>
                              <td className={tdCls}>{remainingDisplay(user)}</td>
                              <td className="px-4 py-3">
                                <button onClick={() => startEdit(user)} className={btnSecondary}>
                                  {t.adminEdit}
                                </button>
                              </td>
                            </>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {tab === 'audit-log' && <AuditLogPanel />}
      </main>
    </div>
  );
}
