'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const items = [
  { href: '/', label: 'Resumo', icon: '📊' },
  { href: '/months', label: 'Meses', icon: '📅' },
  { href: '/accounts', label: 'Contas', icon: '💳' },
  { href: '/dashboard', label: 'Dashboard', icon: '📈' },
  { href: '/simulator', label: 'Simulador', icon: '🎯' },
  { href: '/categories', label: 'Categorias', icon: '🏷️' },
  { href: '/fixed-expenses', label: 'Gastos Fixos', icon: '📌' },
  { href: '/installments', label: 'Parcelamentos', icon: '📋' },
  { href: '/settings', label: 'Base', icon: '⚙️' },
];

export function Sidebar({ open, onToggle }: { open: boolean; onToggle: () => void }) {
  const pathname = usePathname();

  return (
    <>
      <div
        className={`sidebar-mobile-overlay ${open ? 'sidebar-mobile-overlay-visible' : ''}`}
        onClick={onToggle}
      />
      <aside className={`sidebar ${open ? 'sidebar-open' : ''}`}>
        <div className="sidebar-brand">
          <span className="sidebar-brand-icon">💰</span>
          SFP
        </div>

        <nav className="sidebar-nav">
          {items.map((item) => {
            const active =
              item.href === '/'
                ? pathname === '/'
                : pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`sidebar-item ${active ? 'sidebar-item-active' : ''}`}
                onClick={() => {
                  if (open) onToggle();
                }}
              >
                <span className="sidebar-item-icon">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-footer-text">Sistema Financeiro Pessoal</div>
        </div>
      </aside>
    </>
  );
}
