import './globals.css';
import type { Metadata } from 'next';
import { AppShell } from '../components/app-shell';

export const metadata: Metadata = {
  title: 'Sistema Financeiro Pessoal',
  description: 'Controle financeiro pessoal baseado em planilha, agora em Next.js e NestJS.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}