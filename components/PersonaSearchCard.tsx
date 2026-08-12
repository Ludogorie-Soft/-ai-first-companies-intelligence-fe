'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import type { EmailTemplate } from '@/lib/types';
import { useTheme } from '@/contexts/ThemeContext';
import { useLang } from '@/contexts/LangContext';

interface Props {
  onSearched: () => void;
  onNotify: (msg: string, type: 'success' | 'error' | 'info' | 'warning') => void;
}

const MAX_RESULTS_OPTIONS = [10, 20, 30, 50];

export default function PersonaSearchCard({ onSearched, onNotify }: Props) {
  const { theme } = useTheme();
  const { t } = useLang();
  const isDark = theme === 'dark';

  const [persona, setPersona] = useState('');
  const [location, setLocation] = useState('');
  const [keywords, setKeywords] = useState('');
  const [maxResults, setMaxResults] = useState(20);
  const [emailLanguage, setEmailLanguage] = useState<'bg' | 'en' | 'website'>('bg');
  const [searching, setSearching] = useState(false);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');

  useEffect(() => {
    api.listTemplates().then(setTemplates).catch(() => {});
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!persona.trim() || !location.trim()) return;

    setSearching(true);
    try {
      await api.createPersonaSearch({
        persona: persona.trim(),
        location: location.trim(),
        keywords: keywords.trim() || undefined,
        maxResults,
        templateId: selectedTemplateId || undefined,
        emailLanguage,
      });
      onNotify(t.searchSuccess, 'success');
      setPersona('');
      setLocation('');
      setKeywords('');
      setMaxResults(20);
      setEmailLanguage('bg');
      onSearched();
    } catch (err: unknown) {
      onNotify(err instanceof Error ? err.message : String(err), 'error');
    } finally {
      setSearching(false);
    }
  }

  const inputBase = `w-full px-4 py-3 rounded-lg text-sm border transition-colors outline-none ${
    isDark
      ? 'bg-surface-container border-outline-variant/30 text-white placeholder:text-on-surface-variant/50 focus:border-primary/60'
      : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-slate-400'
  }`;

  const labelBase = `block text-xs font-bold uppercase tracking-wide mb-1.5 ${
    isDark ? 'text-on-surface-variant' : 'text-slate-500'
  }`;

  return (
    <section>
      <div className="mb-8">
        <h2
          className={`text-4xl md:text-5xl font-headline font-extrabold tracking-tight mb-4 ${
            isDark ? 'text-white' : 'text-slate-900'
          }`}
        >
          {t.personaSearch}
        </h2>
      </div>

      <div className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-white/10 to-transparent rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200" />
        <div
          className={`relative border rounded-xl p-12 overflow-hidden ${
            isDark
              ? 'bg-surface-container-low border-outline-variant/15'
              : 'bg-white border-slate-200'
          }`}
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />

          <div className="max-w-2xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
              <div
                className={`w-16 h-16 rounded-2xl flex items-center justify-center border shadow-xl flex-shrink-0 ${
                  isDark
                    ? 'bg-surface-container-high border-outline-variant/20'
                    : 'bg-slate-100 border-slate-200'
                }`}
              >
                <span
                  className={`material-symbols-outlined text-3xl ${isDark ? 'text-primary' : 'text-slate-700'}`}
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  travel_explore
                </span>
              </div>
              <div>
                <h3
                  className={`text-2xl font-headline font-bold mb-1 ${
                    isDark ? 'text-white' : 'text-slate-900'
                  }`}
                >
                  {t.personaSearch}
                </h3>
                <p className={`text-sm ${isDark ? 'text-on-surface-variant' : 'text-slate-500'}`}>
                  {t.personaSearchSubtitle}
                </p>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Row 1: persona + location */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className={labelBase}>{t.personaLabel}</label>
                  <input
                    type="text"
                    value={persona}
                    onChange={(e) => setPersona(e.target.value)}
                    placeholder={t.personaPlaceholder}
                    className={inputBase}
                    required
                  />
                </div>
                <div>
                  <label className={labelBase}>{t.locationLabel}</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder={t.locationPlaceholder}
                    className={inputBase}
                    required
                  />
                </div>
              </div>

              {/* Row 2: keywords */}
              <div>
                <label className={labelBase}>{t.keywordsLabel}</label>
                <input
                  type="text"
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  placeholder={t.keywordsPlaceholder}
                  className={inputBase}
                />
              </div>

              {/* Row 3: template selector */}
              {templates.length > 0 && (
                <div>
                  <label className={labelBase}>{t.templateSelectLabel}</label>
                  <select
                    value={selectedTemplateId}
                    onChange={(e) => setSelectedTemplateId(e.target.value)}
                    className={inputBase}
                  >
                    <option value="">{t.templateDefault}</option>
                    {templates.map((tmpl) => (
                      <option key={tmpl.id} value={tmpl.id}>
                        {tmpl.name}{tmpl.isDefault ? ` (${t.templateDefaultBadge})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Row 4: email language */}
              <div>
                <label className={labelBase}>{t.emailLanguageLabel}</label>
                <select
                  value={emailLanguage}
                  onChange={(e) => setEmailLanguage(e.target.value as 'bg' | 'en' | 'website')}
                  className={inputBase}
                >
                  <option value="bg">{t.emailLanguageBg}</option>
                  <option value="en">{t.emailLanguageEn}</option>
                  <option value="website">{t.emailLanguageWebsite}</option>
                </select>
              </div>

              {/* Row 5: maxResults + submit */}
              <div className="flex flex-wrap items-end gap-5 pt-2">
                <div className="flex-shrink-0">
                  <label className={labelBase}>{t.maxResultsLabel}</label>
                  <div className="flex gap-2">
                    {MAX_RESULTS_OPTIONS.map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setMaxResults(n)}
                        className={`px-3 py-2 text-xs font-bold rounded transition-colors ${
                          maxResults === n
                            ? isDark
                              ? 'bg-primary text-on-primary'
                              : 'bg-slate-900 text-white'
                            : isDark
                            ? 'bg-surface-container-high text-on-surface-variant hover:text-white'
                            : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                        }`}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!persona.trim() || !location.trim() || searching}
                  className={`ml-auto px-8 py-3 font-headline font-bold text-sm tracking-widest uppercase hover:opacity-90 active:scale-[0.98] transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed rounded ${
                    isDark ? 'bg-primary text-on-primary' : 'bg-slate-900 text-white'
                  }`}
                >
                  {searching ? (
                    <span className="flex items-center gap-2">
                      <span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} />
                      {t.searching}
                    </span>
                  ) : (
                    t.searchStart
                  )}
                </button>
              </div>
            </form>

            {/* Feature pills */}
            <div
              className={`flex flex-wrap justify-center gap-8 text-xs font-medium mt-8 pt-6 border-t ${
                isDark
                  ? 'text-on-surface-variant/60 border-outline-variant/15'
                  : 'text-slate-400 border-slate-100'
              }`}
            >
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-base">search</span>
                {t.firmographics}
              </span>
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-base">mail</span>
                {t.contacts}
              </span>
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-base">download</span>
                CSV / XLSX
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
