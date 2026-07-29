'use client';

import { useCallback, useEffect, useState } from 'react';
import { api } from '@/lib/api';
import type { AuditLogEntry } from '@/lib/types';
import { useLang } from '@/contexts/LangContext';
import { useTheme } from '@/contexts/ThemeContext';

const ACTION_KEYS = [
  'ROLE_CHANGED',
  'MONTHLY_LIMIT_CHANGED',
  'MONTHLY_LIMIT_REMOVED',
  'MONTHLY_LIMIT_ADDED',
] as const;

interface Filters {
  adminEmail: string;
  targetEmail: string;
  action: string;
  dateFrom: string;
  dateTo: string;
  order: 'asc' | 'desc';
}

const DEFAULT_FILTERS: Filters = {
  adminEmail: '',
  targetEmail: '',
  action: '',
  dateFrom: '',
  dateTo: '',
  order: 'desc',
};

export default function AuditLogPanel() {
  const { t } = useLang();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [entries, setEntries] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [applied, setApplied] = useState<Filters>(DEFAULT_FILTERS);

  const fetchLogs = useCallback(async (f: Filters, p: number) => {
    setLoading(true);
    try {
      const result = await api.getAuditLog({
        page: p,
        limit: 20,
        adminEmail: f.adminEmail || undefined,
        targetEmail: f.targetEmail || undefined,
        action: f.action || undefined,
        dateFrom: f.dateFrom || undefined,
        dateTo: f.dateTo || undefined,
        order: f.order,
      });
      setEntries(result.data);
      setTotalPages(result.pagination.pages);
      setTotal(result.pagination.total);
    } catch {
      setEntries([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs(applied, page);
  }, [fetchLogs, applied, page]);

  function applyFilters() {
    setPage(1);
    setApplied({ ...filters });
  }

  function clearFilters() {
    setFilters(DEFAULT_FILTERS);
    setPage(1);
    setApplied(DEFAULT_FILTERS);
  }

  function actionLabel(action: string): string {
    switch (action) {
      case 'ROLE_CHANGED': return t.auditActionRoleChanged;
      case 'MONTHLY_LIMIT_CHANGED': return t.auditActionLimitChanged;
      case 'MONTHLY_LIMIT_REMOVED': return t.auditActionLimitRemoved;
      case 'MONTHLY_LIMIT_ADDED': return t.auditActionLimitAdded;
      default: return action;
    }
  }

  function formatDate(iso: string): string {
    return new Date(iso).toLocaleString(undefined, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  const inputCls = `w-full border rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary ${
    isDark
      ? 'bg-surface-container border-outline-variant/40 text-white placeholder:text-on-surface-variant/50'
      : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400'
  }`;
  const selectCls = `w-full border rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary ${
    isDark
      ? 'bg-surface-container border-outline-variant/40 text-white'
      : 'bg-white border-slate-300 text-slate-900'
  }`;
  const labelCls = `block text-xs font-medium mb-1 ${isDark ? 'text-on-surface-variant/70' : 'text-slate-500'}`;
  const btnPrimary = `px-3 py-1.5 rounded text-xs font-medium transition-colors ${
    isDark
      ? 'bg-primary text-on-primary hover:bg-primary/90'
      : 'bg-slate-900 text-white hover:bg-slate-700'
  }`;
  const btnSecondary = `px-3 py-1.5 rounded text-xs font-medium transition-colors ${
    isDark
      ? 'border border-outline-variant/40 text-on-surface-variant hover:border-outline-variant'
      : 'border border-slate-300 text-slate-600 hover:border-slate-400'
  }`;
  const thCls = `px-4 py-3 text-left text-[10px] uppercase tracking-[0.15em] font-bold ${isDark ? 'text-on-surface-variant/70' : 'text-slate-400'}`;
  const tdCls = `px-4 py-3 text-sm ${isDark ? 'text-on-surface-variant' : 'text-slate-600'}`;
  const cardCls = `rounded-xl overflow-hidden ${isDark ? 'bg-surface-container-low' : 'bg-white shadow-sm border border-slate-200'}`;

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className={`rounded-xl p-4 ${isDark ? 'bg-surface-container-low' : 'bg-white shadow-sm border border-slate-200'}`}>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <div>
            <label className={labelCls}>{t.auditLogFilterAdmin}</label>
            <input
              type="text"
              value={filters.adminEmail}
              onChange={(e) => setFilters((f) => ({ ...f, adminEmail: e.target.value }))}
              onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
              placeholder="admin@example.com"
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>{t.auditLogFilterTarget}</label>
            <input
              type="text"
              value={filters.targetEmail}
              onChange={(e) => setFilters((f) => ({ ...f, targetEmail: e.target.value }))}
              onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
              placeholder="user@example.com"
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>{t.auditLogFilterAction}</label>
            <select
              value={filters.action}
              onChange={(e) => setFilters((f) => ({ ...f, action: e.target.value }))}
              className={selectCls}
            >
              <option value="">{t.auditLogFilterAll}</option>
              {ACTION_KEYS.map((a) => (
                <option key={a} value={a}>{actionLabel(a)}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls}>{t.auditLogFilterDateFrom}</label>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => setFilters((f) => ({ ...f, dateFrom: e.target.value }))}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>{t.auditLogFilterDateTo}</label>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => setFilters((f) => ({ ...f, dateTo: e.target.value }))}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Sort</label>
            <select
              value={filters.order}
              onChange={(e) => setFilters((f) => ({ ...f, order: e.target.value as 'asc' | 'desc' }))}
              className={selectCls}
            >
              <option value="desc">{t.auditLogNewest}</option>
              <option value="asc">{t.auditLogOldest}</option>
            </select>
          </div>
        </div>
        <div className="flex gap-2 mt-3">
          <button onClick={applyFilters} className={btnPrimary}>{t.auditLogSearch}</button>
          <button onClick={clearFilters} className={btnSecondary}>{t.auditLogClear}</button>
        </div>
      </div>

      {/* Table */}
      <div className={cardCls}>
        {loading ? (
          <div className="px-6 py-10 text-center">
            <span className={`text-sm ${isDark ? 'text-on-surface-variant' : 'text-slate-400'}`}>
              {t.auditLogLoading}
            </span>
          </div>
        ) : entries.length === 0 ? (
          <div className="px-6 py-10 text-center">
            <span className={`text-sm ${isDark ? 'text-on-surface-variant' : 'text-slate-400'}`}>
              {t.auditLogEmpty}
            </span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className={`border-b ${isDark ? 'border-outline-variant/20' : 'border-slate-100'}`}>
                  <th className={thCls}>{t.auditLogDate}</th>
                  <th className={thCls}>{t.auditLogAdmin}</th>
                  <th className={thCls}>{t.auditLogTarget}</th>
                  <th className={thCls}>{t.auditLogAction}</th>
                  <th className={thCls}>{t.auditLogOldValue}</th>
                  <th className={thCls}>{t.auditLogNewValue}</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry, i) => {
                  const rowBorder = i < entries.length - 1
                    ? `border-b ${isDark ? 'border-outline-variant/10' : 'border-slate-50'}`
                    : '';
                  return (
                    <tr key={entry.id} className={rowBorder}>
                      <td className={`${tdCls} whitespace-nowrap`}>
                        {formatDate(entry.createdAt)}
                      </td>
                      <td className={`${tdCls} ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {entry.adminUser.email}
                      </td>
                      <td className={tdCls}>{entry.targetUser.email}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full ${
                          entry.action === 'ROLE_CHANGED'
                            ? isDark ? 'bg-primary/20 text-primary' : 'bg-indigo-100 text-indigo-700'
                            : entry.action === 'MONTHLY_LIMIT_REMOVED'
                            ? isDark ? 'bg-error-container/30 text-error' : 'bg-red-100 text-red-700'
                            : entry.action === 'MONTHLY_LIMIT_ADDED'
                            ? isDark ? 'bg-surface-container text-on-surface-variant' : 'bg-green-100 text-green-700'
                            : isDark ? 'bg-outline-variant/20 text-on-surface-variant' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {actionLabel(entry.action)}
                        </span>
                      </td>
                      <td className={tdCls}>{entry.oldValue ?? '—'}</td>
                      <td className={tdCls}>{entry.newValue ?? '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-between">
          <span className={`text-xs ${isDark ? 'text-on-surface-variant/70' : 'text-slate-400'}`}>
            {t.auditLogPage} {page} {t.auditLogOf} {totalPages} ({total})
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className={`${btnSecondary} disabled:opacity-40`}
            >
              {t.auditLogPrev}
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className={`${btnSecondary} disabled:opacity-40`}
            >
              {t.auditLogNext}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
