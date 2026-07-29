'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { clearAuth, getUserEmail, getUserRole } from '@/lib/api';
import { useLang } from '@/contexts/LangContext';
import { useTheme } from '@/contexts/ThemeContext';

export default function Header() {
  const { toggleLang, t } = useLang();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const isDark = theme === 'dark';
  const [email, setEmail] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    setEmail(getUserEmail());
    setIsAdmin(getUserRole() === 'ADMIN');
  }, []);

  function logout() {
    clearAuth();
    router.push('/');
  }

  return (
    <header className={`fixed top-0 right-0 left-0 z-50 backdrop-blur-xl flex justify-between items-center px-6 md:px-12 h-20 ${isDark ? 'bg-background/80' : 'bg-slate-50/80 border-b border-slate-200'}`}>
      <span className={`text-lg font-headline font-bold tracking-tighter ${isDark ? 'text-white' : 'text-slate-900'}`}>
        Companies Intelligence
      </span>

      <div className="flex items-center gap-4">
        {email && (
          <span className={`text-xs hidden sm:block truncate max-w-[180px] ${isDark ? 'text-on-surface-variant' : 'text-slate-500'}`}>
            {email}
          </span>
        )}

        <button
          onClick={toggleTheme}
          className={`p-2 rounded-full transition-all duration-300 active:scale-95 ${isDark ? 'text-on-surface-variant hover:bg-surface-container-high hover:text-white' : 'text-slate-500 hover:bg-slate-200 hover:text-slate-900'}`}
          title="Toggle theme"
        >
          <span className="material-symbols-outlined text-[20px]">
            {isDark ? 'light_mode' : 'dark_mode'}
          </span>
        </button>

        <button
          onClick={toggleLang}
          className={`text-xs font-medium px-2 py-1 border rounded uppercase tracking-widest transition-colors ${isDark ? 'border-outline-variant/30 text-on-surface-variant hover:text-white' : 'border-slate-300 text-slate-500 hover:text-slate-900 hover:border-slate-400'}`}
        >
          {t.langToggle}
        </button>

        <div className={`h-6 w-px ${isDark ? 'bg-outline-variant/20' : 'bg-slate-200'}`} />

        {isAdmin && (
          <button
            onClick={() => router.push('/admin')}
            className={`p-2 rounded-full transition-all duration-300 active:scale-95 ${isDark ? 'text-on-surface-variant hover:bg-surface-container-high hover:text-white' : 'text-slate-500 hover:bg-slate-200 hover:text-slate-900'}`}
            title={t.adminNav}
          >
            <span className="material-symbols-outlined text-[20px]">admin_panel_settings</span>
          </button>
        )}

        <button
          onClick={() => router.push('/settings')}
          className={`p-2 rounded-full transition-all duration-300 active:scale-95 ${isDark ? 'text-on-surface-variant hover:bg-surface-container-high hover:text-white' : 'text-slate-500 hover:bg-slate-200 hover:text-slate-900'}`}
          title={t.settings}
        >
          <span className="material-symbols-outlined text-[20px]">settings</span>
        </button>

        <button
          onClick={logout}
          className={`font-medium text-sm transition-colors duration-100 ${isDark ? 'text-white hover:text-secondary' : 'text-slate-700 hover:text-slate-900'}`}
        >
          {t.logout}
        </button>
      </div>
    </header>
  );
}
