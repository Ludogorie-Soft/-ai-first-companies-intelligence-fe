'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import type { TenantProfile } from '@/lib/types';
import { useLang } from '@/contexts/LangContext';
import { useTheme } from '@/contexts/ThemeContext';
import Header from './Header';

interface Props {
  /** When true, render only the form (no Header / page shell) for use inside Dashboard tabs. */
  embedded?: boolean;
}

export default function CompanyDataForm({ embedded = false }: Props) {
  const { t } = useLang();
  const { theme } = useTheme();
  const router = useRouter();
  const isDark = theme === 'dark';

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [banner, setBanner] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const [aboutUs, setAboutUs] = useState('');
  const [productsServices, setProductsServices] = useState('');
  const [portfolio, setPortfolio] = useState('');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const token = localStorage.getItem('token');
    if (!token) {
      if (!embedded) router.push('/');
      return;
    }

    api.getTenantProfile()
      .then((p: TenantProfile) => {
        setAboutUs(p.aboutUs ?? '');
        setProductsServices(p.productsServices ?? '');
        setPortfolio(p.portfolio ?? '');
      })
      .catch(() => {
        if (!embedded) router.push('/');
      })
      .finally(() => setLoading(false));
  }, [router, embedded]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setBanner(null);
    try {
      await api.updateTenantProfile({
        aboutUs: aboutUs || null,
        productsServices: productsServices || null,
        portfolio: portfolio || null,
      });
      setBanner({ msg: t.companyDataSaved, type: 'success' });
      setTimeout(() => setBanner(null), 4000);
    } catch (err: unknown) {
      setBanner({ msg: err instanceof Error ? err.message : t.companyDataFailed, type: 'error' });
    } finally {
      setSaving(false);
    }
  }

  const textareaCls = `w-full rounded-lg border px-4 py-3 text-sm transition-colors outline-none resize-y min-h-[120px] ${
    isDark
      ? 'bg-surface-container border-outline-variant/30 text-white placeholder:text-on-surface-variant/50 focus:border-primary/60'
      : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-slate-400'
  }`;

  const labelCls = `block text-[10px] uppercase tracking-[0.2em] font-bold mb-2 ${
    isDark ? 'text-on-surface-variant' : 'text-slate-500'
  }`;

  const titleCls = embedded
    ? `text-4xl md:text-5xl font-headline font-extrabold tracking-tight mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`
    : `font-headline font-bold text-2xl tracking-tight mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`;

  const formBody = (
    <>
      <div className="mb-8">
        <h2 className={titleCls}>{t.companyDataTitle}</h2>
        <p className={`text-sm ${isDark ? 'text-on-surface-variant' : 'text-slate-500'}`}>
          {t.companyDataSubtitle}
        </p>
      </div>

      {banner && (
        <div className={`mb-6 px-4 py-3 rounded text-sm border ${
          banner.type === 'success'
            ? isDark ? 'bg-surface-container border-outline-variant/20 text-white' : 'bg-green-50 border-green-200 text-green-800'
            : isDark ? 'bg-error-container/30 border-error/20 text-error' : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          {banner.msg}
        </div>
      )}

      <form onSubmit={handleSave} className={embedded ? 'max-w-2xl' : undefined}>
        <div className={`p-8 rounded-xl space-y-8 ${isDark ? 'bg-surface-container-low' : 'bg-white shadow-sm border border-slate-200'}`}>
          <div>
            <label className={labelCls}>{t.companyAboutLabel}</label>
            <textarea
              value={aboutUs}
              onChange={(e) => setAboutUs(e.target.value)}
              placeholder={t.companyAboutPlaceholder}
              className={textareaCls}
              rows={5}
            />
          </div>

          <div>
            <label className={labelCls}>{t.companyServicesLabel}</label>
            <textarea
              value={productsServices}
              onChange={(e) => setProductsServices(e.target.value)}
              placeholder={t.companyServicesPlaceholder}
              className={textareaCls}
              rows={5}
            />
          </div>

          <div>
            <label className={labelCls}>{t.companyPortfolioLabel}</label>
            <textarea
              value={portfolio}
              onChange={(e) => setPortfolio(e.target.value)}
              placeholder={t.companyPortfolioPlaceholder}
              className={textareaCls}
              rows={5}
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className={`h-12 px-8 font-headline font-extrabold text-sm tracking-widest uppercase hover:opacity-90 active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed rounded ${
              isDark ? 'bg-primary text-on-primary' : 'bg-slate-900 text-white'
            }`}
          >
            {saving ? t.companyDataSaving : t.companyDataSave}
          </button>
        </div>
      </form>
    </>
  );

  if (loading) {
    if (embedded) {
      return (
        <span className={`text-sm ${isDark ? 'text-on-surface-variant' : 'text-slate-400'}`}>{t.loading}</span>
      );
    }
    return (
      <div className={`min-h-screen ${isDark ? 'bg-background' : 'bg-slate-50'}`}>
        <Header />
        <div className="pt-20 flex items-center justify-center h-screen">
          <span className={`text-sm ${isDark ? 'text-on-surface-variant' : 'text-slate-400'}`}>{t.loading}</span>
        </div>
      </div>
    );
  }

  if (embedded) {
    return <section>{formBody}</section>;
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-background' : 'bg-slate-50'}`}>
      <Header />
      <main className="pt-28 pb-16 px-6 max-w-2xl mx-auto">
        {formBody}
      </main>
    </div>
  );
}
