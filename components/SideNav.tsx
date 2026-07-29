'use client';

import { useEffect, useState } from 'react';
import { getUserRole } from '@/lib/api';
import { useLang } from '@/contexts/LangContext';

export default function SideNav() {
  const { t } = useLang();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    setIsAdmin(getUserRole() === 'ADMIN');
  }, []);

  return (
    <aside className="h-screen w-64 fixed left-0 border-r border-outline-variant/15 bg-surface-container-lowest flex flex-col py-8 px-4 z-40 hidden md:flex">
      <div className="mb-10 px-2">
        <h1 className="text-white font-headline text-lg font-bold tracking-tight">Enterprise AI</h1>
        <p className="text-on-surface-variant text-[10px] uppercase tracking-widest font-medium">Data Engine v2.4</p>
      </div>

      <nav className="flex-1 space-y-2">
        <a
          href="/dashboard"
          className="bg-surface-container-high text-white rounded-md flex items-center gap-3 px-3 py-2.5 transition-all duration-200"
        >
          <span className="material-symbols-outlined text-[20px]">grid_view</span>
          <span className="font-body font-medium text-sm">Home</span>
        </a>
        <a
          href="#"
          className="text-on-surface-variant hover:bg-surface-container-low hover:text-white flex items-center gap-3 px-3 py-2.5 rounded-md transition-all duration-200"
        >
          <span className="material-symbols-outlined text-[20px]">layers</span>
          <span className="font-body font-medium text-sm">Batch Process</span>
        </a>
        <a
          href="#"
          className="text-on-surface-variant hover:bg-surface-container-low hover:text-white flex items-center gap-3 px-3 py-2.5 rounded-md transition-all duration-200"
        >
          <span className="material-symbols-outlined text-[20px]">monitoring</span>
          <span className="font-body font-medium text-sm">Analytics</span>
        </a>
        <a
          href="#"
          className="text-on-surface-variant hover:bg-surface-container-low hover:text-white flex items-center gap-3 px-3 py-2.5 rounded-md transition-all duration-200"
        >
          <span className="material-symbols-outlined text-[20px]">database</span>
          <span className="font-body font-medium text-sm">Database</span>
        </a>
        <a
          href="#"
          className="text-on-surface-variant hover:bg-surface-container-low hover:text-white flex items-center gap-3 px-3 py-2.5 rounded-md transition-all duration-200"
        >
          <span className="material-symbols-outlined text-[20px]">person</span>
          <span className="font-body font-medium text-sm">Account</span>
        </a>

        {isAdmin && (
          <a
            href="/admin"
            className="text-on-surface-variant hover:bg-surface-container-low hover:text-white flex items-center gap-3 px-3 py-2.5 rounded-md transition-all duration-200"
          >
            <span className="material-symbols-outlined text-[20px]">admin_panel_settings</span>
            <span className="font-body font-medium text-sm">{t.adminNav}</span>
          </a>
        )}
      </nav>

      <div className="mt-auto space-y-6">
        <button className="w-full bg-white text-on-primary py-2.5 rounded-md font-headline font-bold text-sm tracking-tight hover:opacity-90 transition-all">
          Upgrade Plan
        </button>
        <div className="space-y-1">
          <a href="#" className="text-on-surface-variant hover:bg-surface-container-low hover:text-white flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-200">
            <span className="material-symbols-outlined text-sm">description</span>
            <span className="font-body font-medium text-xs">Docs</span>
          </a>
          <a href="#" className="text-on-surface-variant hover:bg-surface-container-low hover:text-white flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-200">
            <span className="material-symbols-outlined text-sm">contact_support</span>
            <span className="font-body font-medium text-xs">Support</span>
          </a>
        </div>
      </div>
    </aside>
  );
}
