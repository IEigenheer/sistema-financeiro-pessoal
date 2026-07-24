import './globals.css';
import type { Metadata } from 'next';
import { AppNav } from '../components/app-nav';

export const metadata: Metadata = {
  title: 'Sistema Financeiro Pessoal',
  description: 'Controle financeiro pessoal baseado em planilha, agora em Next.js e NestJS.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>
        <main className="shell">
          <header className="topbar">
            <div>
              <p className="eyebrow">Sistema Financeiro Pessoal</p>
              <h1 className="topbar-title">Planilha operacional, patrimônio e simulações em uma interface web.</h1>
            </div>
            <AppNav />
          </header>
          {children}
        </main>
      </body>
    </html>
  );
}