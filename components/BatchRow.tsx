'use client';

import { useEffect, useRef, useState } from 'react';
import type { Batch } from '@/lib/types';
import { api } from '@/lib/api';
import { useLang } from '@/contexts/LangContext';
import { useTheme } from '@/contexts/ThemeContext';

interface Props {
  batch: Batch;
  onDelete: (id: string) => void;
  onView: (id: string, name: string) => void;
  onNotify: (msg: string, type: 'success' | 'error' | 'info' | 'warning') => void;
  onReEnrich?: () => void;
}

interface Anim {
  current: number;
  target: number;
  timer: ReturnType<typeof setInterval> | null;
  finalized: boolean;
}

export default function BatchRow({ batch, onDelete, onView, onNotify, onReEnrich }: Props) {
  const { t } = useLang();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  // Clamped defensively — the API derives this and can no longer exceed 100, but an
  // out-of-range value would render the bar wider than its track.
  const rawPct = Number(batch.completionPercentage);
  const realPct = Number.isFinite(rawPct) ? Math.min(100, Math.max(0, Math.round(rawPct))) : 0;
  const isDone = batch.status === 'COMPLETED' || batch.status === 'FAILED';

  const [displayPct, setDisplayPct] = useState(() => (isDone ? realPct : 0));
  const [showFinal, setShowFinal] = useState(() => isDone);

  const anim = useRef<Anim>({
    current: isDone ? realPct : 0,
    target: realPct,
    timer: null,
    finalized: isDone,
  });

  function startTicker() {
    if (anim.current.timer || anim.current.finalized) return;
    anim.current.timer = setInterval(() => {
      const a = anim.current;
      if (a.current < a.target) {
        a.current = Math.min(a.current + (a.target - a.current > 15 ? 2 : 1), a.target);
        setDisplayPct(a.current);
      }
      if (a.finalized && a.current >= a.target) {
        clearInterval(a.timer!);
        a.timer = null;
        setShowFinal(true);
      }
    }, 80);
  }

  function stopTicker() {
    if (anim.current.timer) { clearInterval(anim.current.timer); anim.current.timer = null; }
  }

  useEffect(() => {
    const a = anim.current;
    a.target = realPct;
    if (batch.status === 'PROCESSING') { startTicker(); return; }
    if (isDone && !a.finalized) {
      a.finalized = true;
      if (a.timer) { /* will finalize when it reaches target */ }
      else if (a.current >= realPct) { setDisplayPct(realPct); setShowFinal(true); }
      else { startTicker(); }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [batch.status, realPct]);

  useEffect(() => () => stopTicker(), []);

  const [reEnriching, setReEnriching] = useState(false);

  async function handleReEnrich() {
    setReEnriching(true);
    try {
      const result = await api.reEnrichBatch(batch.id);
      onNotify(t.reEnrichDone(result.reEnqueuedCompanies), 'success');
      onReEnrich?.();
    } catch (err: unknown) {
      onNotify(err instanceof Error ? err.message : String(err), 'error');
    } finally {
      setReEnriching(false);
    }
  }

  async function handleDelete() {
    const name = batch.fileName || 'this batch';
    if (!confirm(`${t.confirmDelete} "${name}"?\n\n${t.confirmDeleteMsg}`)) return;
    try {
      await api.deleteBatch(batch.id);
      stopTicker();
      onDelete(batch.id);
      onNotify(t.batchDeleted, 'success');
    } catch (err: unknown) {
      onNotify(t.deleteFailed + (err instanceof Error ? err.message : String(err)), 'error');
    }
  }

  async function handleDownload(format: 'csv' | 'xlsx') {
    try {
      const res = await api.downloadBatch(batch.id, format);
      const blob = await (res as unknown as Response).blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `batch-${batch.id.slice(0, 8)}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err: unknown) {
      onNotify(t.downloadFailed + (err instanceof Error ? err.message : String(err)), 'error');
    }
  }

  const effectiveStatus =
    showFinal
      ? batch.status
      : (batch.status === 'COMPLETED' || batch.status === 'FAILED') && anim.current.timer
      ? 'PROCESSING'
      : batch.status;

  const isCompleted = showFinal && batch.status === 'COMPLETED';
  const isProcessing = effectiveStatus === 'PROCESSING';

  function StatusBadge() {
    if (effectiveStatus === 'PROCESSING') {
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${isDark ? 'bg-secondary-container text-on-secondary-container' : 'bg-blue-100 text-blue-700'}`}>
          <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${isDark ? 'bg-secondary' : 'bg-blue-500'}`} />
          {t.processing}
        </span>
      );
    }
    if (effectiveStatus === 'COMPLETED') {
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${isDark ? 'bg-surface-container-highest text-primary' : 'bg-green-100 text-green-700'}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${isDark ? 'bg-primary' : 'bg-green-500'}`} />
          {t.done}
        </span>
      );
    }
    if (effectiveStatus === 'FAILED') {
      const errorNote = batch.searchQuery?._errorNote;
      return (
        <div className="space-y-1">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${isDark ? 'bg-error-container/30 text-error' : 'bg-red-100 text-red-700'}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isDark ? 'bg-error' : 'bg-red-500'}`} />
            {t.failed}
          </span>
          {errorNote && (
            <p className={`text-[10px] leading-snug max-w-[180px] ${isDark ? 'text-on-surface-variant/70' : 'text-slate-400'}`}>
              {errorNote}
            </p>
          )}
        </div>
      );
    }
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${isDark ? 'bg-surface-container-high text-on-surface-variant' : 'bg-slate-100 text-slate-500'}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${isDark ? 'bg-outline' : 'bg-slate-400'}`} />
        {t.pending}
      </span>
    );
  }

  const date = new Date(batch.createdAt).toLocaleDateString('en-GB', {
    month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });

  const hoverRow = isDark ? 'hover:bg-surface-container-high/50' : 'hover:bg-slate-50';
  const idColor = isDark ? 'text-primary' : 'text-slate-900';
  const subColor = isDark ? 'text-on-surface-variant' : 'text-slate-400';
  const dateColor = isDark ? 'text-on-surface-variant' : 'text-slate-500';
  const countColor = isDark ? 'text-white' : 'text-slate-800';
  const actionHover = isDark
    ? 'hover:bg-surface-container-highest text-on-surface-variant hover:text-white'
    : 'hover:bg-slate-100 text-slate-400 hover:text-slate-700';
  const deleteHover = isDark
    ? 'hover:bg-error-container/30 text-on-surface-variant hover:text-error'
    : 'hover:bg-red-50 text-slate-400 hover:text-red-600';

  const progressBg = isDark ? 'bg-surface-container-highest' : 'bg-slate-200';
  const progressFill = isCompleted
    ? isDark ? 'bg-white' : 'bg-slate-800'
    : isProcessing
    ? isDark ? 'bg-white shadow-[0_0_8px_rgba(255,255,255,0.4)]' : 'bg-blue-500'
    : isDark ? 'bg-outline' : 'bg-slate-400';
  const progressLabel = isProcessing
    ? isDark ? 'text-secondary' : 'text-blue-600'
    : isDark ? 'text-on-surface-variant' : 'text-slate-500';

  return (
    <tr className={`transition-colors ${hoverRow}`}>
      <td className="px-6 py-6">
        <div className="flex items-center gap-1.5">
          {batch.sourceType === 'PERSONA_SEARCH' ? (
            <span className={`material-symbols-outlined text-[14px] flex-shrink-0 ${isDark ? 'text-primary' : 'text-slate-500'}`}>
              travel_explore
            </span>
          ) : (
            <span className={`material-symbols-outlined text-[14px] flex-shrink-0 ${isDark ? 'text-on-surface-variant' : 'text-slate-400'}`}>
              upload_file
            </span>
          )}
          <div className={`font-mono text-sm font-medium ${idColor}`}>
            #{batch.id.slice(0, 8).toUpperCase()}
          </div>
        </div>
        {batch.fileName && (
          <div className={`text-[11px] mt-0.5 truncate max-w-[160px] ${subColor}`}>{batch.fileName}</div>
        )}
      </td>

      <td className={`px-6 py-6 text-sm whitespace-nowrap ${dateColor}`}>{date}</td>

      <td className={`px-6 py-6 text-sm font-medium ${countColor}`}>
        {batch.totalCompanies.toLocaleString()}
      </td>

      <td className="px-6 py-6">
        <div className="space-y-2">
          <div className={`flex justify-between text-[10px] font-bold uppercase tracking-tighter ${progressLabel}`}>
            <span>{isProcessing ? t.processing : isCompleted ? t.success : effectiveStatus}</span>
            <span>{displayPct}%</span>
          </div>
          <div className={`h-1 w-full rounded-full overflow-hidden ${progressBg}`}>
            <div
              className={`h-full rounded-full transition-all duration-[90ms] linear ${progressFill}`}
              style={{ width: `${displayPct}%` }}
            />
          </div>
        </div>
      </td>

      <td className="px-6 py-6"><StatusBadge /></td>

      <td className="px-6 py-6 text-right">
        <div className="flex justify-end gap-2">
          <button
            onClick={() => onView(batch.id, batch.fileName || `Batch ${batch.id.slice(0, 8)}`)}
            className={`p-2 rounded transition-all ${actionHover}`}
            title="View companies"
          >
            <span className="material-symbols-outlined text-[18px]">visibility</span>
          </button>

          {isCompleted && (
            <>
              <button
                onClick={handleReEnrich}
                disabled={reEnriching}
                className={`p-2 rounded transition-all ${actionHover} disabled:opacity-50`}
                title={t.reEnrich}
              >
                <span className={`material-symbols-outlined text-[18px] ${reEnriching ? 'animate-spin' : ''}`}>
                  refresh
                </span>
              </button>
              <button
                onClick={() => handleDownload('csv')}
                className={`p-2 rounded transition-all text-[10px] font-bold ${actionHover}`}
                title="Download CSV"
              >
                CSV
              </button>
              <button
                onClick={() => handleDownload('xlsx')}
                className={`p-2 rounded transition-all text-[10px] font-bold ${actionHover}`}
                title="Download XLSX"
              >
                XLSX
              </button>
            </>
          )}

          <button
            onClick={handleDelete}
            className={`p-2 rounded transition-all ${deleteHover}`}
            title="Delete batch"
          >
            <span className="material-symbols-outlined text-[18px]">delete</span>
          </button>
        </div>
      </td>
    </tr>
  );
}
