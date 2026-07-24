'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const items = [
  { href: '/', label: 'Resumo' },
  { href: '/months', label: 'Meses' },
  { href: '/accounts', label: 'Contas' },
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/simulator', label: 'Simulador' },
  { href: '/settings', label: 'Base' },
];

export function AppNav() {
  const pathname = usePathname();

  return (
    <nav className="app-nav">
      {items.map((item) => {
        const active =
          item.href === '/'
            ? pathname === '/'
            : pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`nav-pill ${active ? 'nav-pill-active' : ''}`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}