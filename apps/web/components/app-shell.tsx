'use client';

import { useState } from 'react';
import { Sidebar } from './sidebar';

export function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-layout">
      <Sidebar open={sidebarOpen} onToggle={() => setSidebarOpen((v) => !v)} />
      <div className="content-area">
        {children}
      </div>
      <button
        className="mobile-menu-btn"
        onClick={() => setSidebarOpen((v) => !v)}
        type="button"
        aria-label="Menu"
      >
        ☰
      </button>
    </div>
  );
}
