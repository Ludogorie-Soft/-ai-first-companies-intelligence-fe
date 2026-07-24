'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api, clearAuth, getUserEmail, setToken } from '@/lib/api';
import type { Batch } from '@/lib/types';
import { useLang } from '@/contexts/LangContext';
import { useTheme } from '@/contexts/ThemeContext';
import Header from './Header';
import UploadCard from './UploadCard';
import PersonaSearchCard from './PersonaSearchCard';
import TemplatesCard from './TemplatesCard';
import BatchTable from './BatchTable';
import CompaniesModal from './CompaniesModal';

interface Toast {
  id: number;
  msg: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

export default function Dashboard() {
  const { t } = useLang();
  const { theme } = useTheme();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isDark = theme === 'dark';

  const [batches, setBatches] = useState<Batch[]>([]);
  const [loadingBatches, setLoadingBatches] = useState(true);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastId = useRef(0);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [modalBatchId, setModalBatchId] = useState<string | null>(null);
  const [modalBatchName, setModalBatchName] = useState('');
  const [modalIsPersonaSearch, setModalIsPersonaSearch] = useState(false);
  const [banner, setBanner] = useState<{ msg: string; type: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'upload' | 'persona' | 'templates'>('upload');

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const verified = searchParams.get('verified');
    const registered = searchParams.get('registered');
    const err = searchParams.get('error');

    // Store the fresh JWT from the verification redirect before the auth guard,
    // so the link works from any browser/device where the user isn't already logged in.
    if (verified === 'true') {
      const freshToken = searchParams.get('token');
      if (freshToken) setToken(freshToken);
    }

    const token = localStorage.getItem('token');
    if (!token) { router.push('/'); return; }

    if (verified === 'true') {
      setBanner({ msg: t.verifiedBanner, type: 'success' });
      window.history.replaceState({}, '', '/dashboard');
      setTimeout(() => setBanner(null), 6000);
    } else if (registered === 'true') {
      setBanner({ msg: `${t.registeredBanner} ${getUserEmail()}${t.checkInbox}`, type: 'warning' });
      window.history.replaceState({}, '', '/dashboard');
    } else if (err) {
      setBanner({ msg: t.invalidLink, type: 'error' });
    }

    loadBatches();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function notify(msg: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') {
    const id = ++toastId.current;
    setToasts((prev) => [...prev, { id, msg, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 7000);
  }

  async function loadBatches() {
    try {
      const data = await api.listBatches();
      setBatches(data);
      setLoadingBatches(false);
      const hasProcessing = data.some((b) => b.status === 'PROCESSING');
      if (hasProcessing) startPolling(); else stopPolling();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes('401') || msg.toLowerCase().includes('unauthorized')) {
        clearAuth();
        router.push('/');
        return;
      }
      setLoadingBatches(false);
      notify(msg, 'error');
    }
  }

  function startPolling() {
    if (pollRef.current) return;
    pollRef.current = setInterval(loadBatches, 3000);
  }

  function stopPolling() {
    if (!pollRef.current) return;
    clearInterval(pollRef.current);
    pollRef.current = null;
  }

  useEffect(() => () => stopPolling(), []);

  function handleDelete(id: string) {
    setBatches((prev) => prev.filter((b) => b.id !== id));
  }

  function handleUploaded() {
    setLoadingBatches(true);
    loadBatches();
  }

  function openModal(id: string, name: string) {
    setModalBatchId(id);
    setModalBatchName(name);
    const batch = batches.find((b) => b.id === id);
    setModalIsPersonaSearch(batch?.sourceType === 'PERSONA_SEARCH');
  }

  function closeModal() {
    setModalBatchId(null);
  }

  const toastColors: Record<string, string> = isDark ? {
    success: 'bg-surface-container-high border border-outline-variant/20 text-white',
    error: 'bg-error-container/40 border border-error/20 text-error',
    warning: 'bg-surface-container-high border border-outline-variant/20 text-secondary',
    info: 'bg-surface-container-high border border-outline-variant/20 text-on-surface-variant',
  } : {
    success: 'bg-white border border-slate-200 text-slate-800 shadow-sm',
    error: 'bg-red-50 border border-red-200 text-red-700 shadow-sm',
    warning: 'bg-amber-50 border border-amber-200 text-amber-700 shadow-sm',
    info: 'bg-white border border-slate-200 text-slate-600 shadow-sm',
  };

  const bannerColors: Record<string, string> = isDark ? {
    success: 'bg-surface-container-high border border-outline-variant/20 text-white',
    error: 'bg-error-container/40 border border-error/20 text-error',
    warning: 'bg-surface-container-high border border-outline-variant/20 text-secondary',
  } : {
    success: 'bg-green-50 border border-green-200 text-green-700',
    error: 'bg-red-50 border border-red-200 text-red-700',
    warning: 'bg-amber-50 border border-amber-200 text-amber-700',
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-background' : 'bg-slate-50'}`}>
      <Header />

      {/* Toasts */}
      <div className="fixed top-24 right-6 z-[300] flex flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`px-4 py-3 rounded-xl text-sm font-medium min-w-[260px] ${toastColors[toast.type]}`}
          >
            {toast.msg}
          </div>
        ))}
      </div>

      {/* Banner */}
      {banner && (
        <div className="pt-24 px-6 md:px-12 max-w-7xl mx-auto">
          <div className={`px-4 py-3 rounded-xl text-sm font-medium ${bannerColors[banner.type] || bannerColors.info}`}>
            {banner.msg}
          </div>
        </div>
      )}

      {/* Content */}
      <div className={`${banner ? 'pt-6' : 'pt-32'} pb-20 px-6 md:px-12 max-w-7xl mx-auto space-y-16`}>

        {/* Tab switcher */}
        <div className={`inline-flex rounded-xl p-1 gap-1 ${isDark ? 'bg-surface-container-low border border-outline-variant/15' : 'bg-slate-100 border border-slate-200'}`}>
          <button
            onClick={() => setActiveTab('upload')}
            className={`px-5 py-2.5 rounded-lg text-sm font-bold tracking-wide transition-all duration-200 ${
              activeTab === 'upload'
                ? isDark ? 'bg-surface-container-highest text-white shadow-sm' : 'bg-white text-slate-900 shadow-sm'
                : isDark ? 'text-on-surface-variant hover:text-white' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <span className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px]">upload_file</span>
              {t.uploadTab}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('persona')}
            className={`px-5 py-2.5 rounded-lg text-sm font-bold tracking-wide transition-all duration-200 ${
              activeTab === 'persona'
                ? isDark ? 'bg-surface-container-highest text-white shadow-sm' : 'bg-white text-slate-900 shadow-sm'
                : isDark ? 'text-on-surface-variant hover:text-white' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <span className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px]">travel_explore</span>
              {t.personaTab}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            className={`px-5 py-2.5 rounded-lg text-sm font-bold tracking-wide transition-all duration-200 ${
              activeTab === 'templates'
                ? isDark ? 'bg-surface-container-highest text-white shadow-sm' : 'bg-white text-slate-900 shadow-sm'
                : isDark ? 'text-on-surface-variant hover:text-white' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <span className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px]">mail</span>
              {t.templatesTab}
            </span>
          </button>
        </div>

        {activeTab === 'upload' && <UploadCard onUploaded={handleUploaded} onNotify={notify} />}
        {activeTab === 'persona' && <PersonaSearchCard onSearched={handleUploaded} onNotify={notify} />}
        {activeTab === 'templates' && <TemplatesCard onNotify={notify} />}

        <BatchTable
          batches={batches}
          loading={loadingBatches}
          onDelete={handleDelete}
          onView={openModal}
          onNotify={notify}
          onReEnrich={loadBatches}
        />
      </div>

      {modalBatchId && (
        <CompaniesModal
          batchId={modalBatchId}
          batchName={modalBatchName}
          isPersonaSearch={modalIsPersonaSearch}
          onClose={closeModal}
        />
      )}
    </div>
  );
}
