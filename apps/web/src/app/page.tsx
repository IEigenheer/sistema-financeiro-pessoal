import Link from 'next/link';

export default function HomePage() {
  return (
    <section>
      <h1>Núcleo de Controle Financeiro Pessoal</h1>
      <p>Selecione uma área da US1 para iniciar.</p>
      <ul>
        <li>
          <Link href="/configuracoes">Configurações financeiras</Link>
        </li>
        <li>
          <Link href="/categorias">Categorias</Link>
        </li>
        <li>
          <Link href="/mes/2026-07-01">Overview mensal</Link>
        </li>
      </ul>
    </section>
  );
}
