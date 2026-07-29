'use client';

import { useEffect, useRef, useState } from 'react';
import { api } from '@/lib/api';
import type { EmailTemplate } from '@/lib/types';
import { useTheme } from '@/contexts/ThemeContext';
import { useLang } from '@/contexts/LangContext';

interface Props {
  onUploaded: () => void;
  onNotify: (msg: string, type: 'success' | 'error' | 'info' | 'warning') => void;
}

export default function UploadCard({ onUploaded, onNotify }: Props) {
  const { theme } = useTheme();
  const { t } = useLang();
  const isDark = theme === 'dark';
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [forceRecrawl, setForceRecrawl] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isDragover, setIsDragover] = useState(false);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');

  useEffect(() => {
    api.listTemplates().then(setTemplates).catch(() => {});
  }, []);

  function handleFile(file: File) {
    const ext = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
    if (!['.csv', '.xlsx', '.xls'].includes(ext)) {
      onNotify('Only CSV and Excel files are supported.', 'error');
      return;
    }
    setSelectedFile(file);
  }

  function onDragOver(e: React.DragEvent) { e.preventDefault(); setIsDragover(true); }
  function onDragLeave() { setIsDragover(false); }
  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragover(false);
    if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
  }
  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files?.[0]) handleFile(e.target.files[0]);
  }

  async function upload() {
    if (!selectedFile) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', selectedFile);
      const result = await api.uploadBatch(fd, forceRecrawl, selectedTemplateId || undefined);
      const invalidNote = result.invalidRows ? ` ${result.invalidRows} rows skipped (not valid domains).` : '';
      onNotify(
        `Batch created! ${result.totalCompanies} companies (${result.jobsEnqueued} queued, ${result.skipped} cached).${invalidNote}`,
        result.invalidRows ? 'warning' : 'success',
      );
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      onUploaded();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      const localized = msg.includes('No valid domains')
        ? t.uploadNoDomains
        : msg === 'Monthly domain limit exceeded'
        ? t.monthlyLimitExceeded
        : msg;
      onNotify(localized, 'error');
    } finally {
      setUploading(false);
    }
  }

  return (
    <section>
      <div className="mb-8">
        <h2 className={`text-4xl md:text-5xl font-headline font-extrabold tracking-tight mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>
          {t.enrichmentEngine}
        </h2>
      </div>

      <div className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-white/10 to-transparent rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200" />
        <div className={`relative border rounded-xl p-12 text-center overflow-hidden ${isDark ? 'bg-surface-container-low border-outline-variant/15' : 'bg-white border-slate-200'}`}>
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />

          <div className="max-w-md mx-auto space-y-6">
            <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 border shadow-xl ${isDark ? 'bg-surface-container-high border-outline-variant/20' : 'bg-slate-100 border-slate-200'}`}>
              <span
                className={`material-symbols-outlined text-4xl ${isDark ? 'text-primary' : 'text-slate-700'}`}
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                upload_file
              </span>
            </div>

            <div>
              <h3 className={`text-2xl font-headline font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>{t.uploadDomains}</h3>
              <p className={`text-sm ${isDark ? 'text-on-surface-variant' : 'text-slate-500'}`}>
                {t.uploadSubtitle}
              </p>
            </div>

            {/* Drop zone */}
            <div
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`p-8 border-2 border-dashed rounded-lg transition-colors cursor-pointer group/upload ${
                isDragover
                  ? isDark ? 'border-primary/60 bg-surface-container-high' : 'border-slate-400 bg-slate-50'
                  : selectedFile
                  ? isDark ? 'border-secondary/40 bg-surface-container' : 'border-green-300 bg-green-50/50'
                  : isDark ? 'border-outline-variant/30 hover:border-primary/40' : 'border-slate-200 hover:border-slate-400'
              }`}
            >
              <div className="flex flex-col items-center gap-4">
                <span className={`material-symbols-outlined text-3xl transition-colors ${
                  isDragover
                    ? isDark ? 'text-white' : 'text-slate-700'
                    : isDark ? 'text-on-surface-variant group-hover/upload:text-white' : 'text-slate-400 group-hover/upload:text-slate-700'
                }`}>
                  cloud_upload
                </span>
                {selectedFile ? (
                  <span className={`text-sm font-medium ${isDark ? 'text-secondary' : 'text-green-600'}`}>{selectedFile.name}</span>
                ) : (
                  <span className={`text-sm font-medium ${isDark ? 'text-on-surface-variant' : 'text-slate-500'}`}>{t.selectFileOrDrag}</span>
                )}
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              className="hidden"
              onChange={onFileChange}
            />

            {/* Feature pills */}
            <div className={`flex justify-center gap-8 text-xs font-medium ${isDark ? 'text-on-surface-variant/60' : 'text-slate-400'}`}>
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-base">check_circle</span> {t.firmographics}
              </span>
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-base">check_circle</span> {t.techStack}
              </span>
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-base">check_circle</span> {t.contacts}
              </span>
            </div>

            {/* Template selector */}
            {templates.length > 0 && (
              <div className="text-left">
                <label className={`block text-xs font-bold uppercase tracking-wide mb-1.5 ${isDark ? 'text-on-surface-variant' : 'text-slate-500'}`}>
                  {t.templateSelectLabel}
                </label>
                <select
                  value={selectedTemplateId}
                  onChange={(e) => setSelectedTemplateId(e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-lg text-sm border transition-colors outline-none ${isDark ? 'bg-surface-container border-outline-variant/30 text-white focus:border-primary/60' : 'bg-white border-slate-200 text-slate-900 focus:border-slate-400'}`}
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

            {/* Actions */}
            <div className="flex items-center justify-center gap-4 flex-wrap pt-2">
              <label className={`flex items-center gap-2 text-xs cursor-pointer select-none ${isDark ? 'text-on-surface-variant' : 'text-slate-500'}`}>
                <input
                  type="checkbox"
                  checked={forceRecrawl}
                  onChange={(e) => setForceRecrawl(e.target.checked)}
                  className={`rounded focus:ring-0 focus:ring-offset-0 ${isDark ? 'border-outline-variant/30 bg-surface-container-high text-white' : 'border-slate-300 bg-white text-slate-900'}`}
                />
                {t.forceRecrawl}
              </label>

              <button
                onClick={upload}
                disabled={!selectedFile || uploading}
                className={`px-8 py-3 font-headline font-bold text-sm tracking-widest uppercase hover:opacity-90 active:scale-[0.98] transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed rounded ${isDark ? 'bg-primary text-on-primary' : 'bg-slate-900 text-white'}`}
              >
                {uploading ? (
                  <span className="flex items-center gap-2">
                    <span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} />
                    {t.uploading}
                  </span>
                ) : t.uploadProcess}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
