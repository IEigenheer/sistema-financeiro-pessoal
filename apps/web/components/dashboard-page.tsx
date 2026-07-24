'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { EChart } from './echart';
import { formatCurrency, formatMonth } from '../lib/format';

export function DashboardPage() {
  const [overview, setOverview] = useState<any>(null);

  useEffect(() => {
    fetch('/api/reports/overview', { cache: 'no-store' })
      .then((response) => response.json())
      .then(setOverview)
      .catch(() => undefined);
  }, []);

  const accounts = overview?.accounts ?? [];
  const current = overview?.currentMonthDetail;
  const currentAccount = accounts.find((item: any) => item.month === overview?.currentMonth);

  const chartOption = useMemo(() => ({
    tooltip: { trigger: 'axis' },
    grid: { left: 24, right: 24, top: 36, bottom: 24, containLabel: true },
    xAxis: {
      type: 'category',
      data: accounts.map((item: any) => item.label),
      axisLine: { lineStyle: { color: '#c9b8a2' } },
    },
    yAxis: {
      type: 'value',
      axisLabel: { formatter: (value: number) => `R$ ${Math.round(value).toLocaleString('pt-BR')}` },
    },
    series: [
      {
        name: 'Investimentos',
        type: 'line',
        smooth: true,
        data: accounts.map((item: any) => item.investmentBalance),
        lineStyle: { width: 4, color: '#0f766e' },
        itemStyle: { color: '#0f766e' },
        areaStyle: { color: 'rgba(15, 118, 110, 0.16)' },
      },
    ],
  }), [accounts]);

  if (!overview || !current) {
    return <div className="panel">Carregando resumo...</div>;
  }

  return (
    <div className="stack-xl">
      <section className="hero">
        <div>
          <p className="eyebrow">Resumo</p>
          <h2 className="hero-title">Os valores do mês agora seguem a aba mensal da planilha, enquanto o consolidado respeita os ajustes da aba Contas.</h2>
          <p className="muted">
            O aporte exibido no mês mostra o valor operacional da competência. O aporte efetivo usado no consolidado patrimonial aparece separado quando houver ajuste manual.
          </p>
        </div>
        <div className="hero-actions">
          <Link href="/months" className="button">Abrir meses</Link>
          <Link href="/simulator" className="button button-secondary">Refinar cenários</Link>
        </div>
      </section>

      <section className="card-grid">
        <article className="panel">
          <span className="card-label">Entradas do mês</span>
          <strong>{formatCurrency(current.entriesTotal)}</strong>
        </article>
        <article className="panel">
          <span className="card-label">Saldo disponível do mês</span>
          <strong>{formatCurrency(current.availableBalance)}</strong>
        </article>
        <article className="panel">
          <span className="card-label">Aporte do mês na aba mensal</span>
          <strong>{formatCurrency(current.investmentContribution)}</strong>
        </article>
        <article className="panel">
          <span className="card-label">Aporte efetivo em Contas</span>
          <strong>{formatCurrency(current.effectiveInvestmentContribution)}</strong>
        </article>
      </section>

      <section className="two-columns">
        <article className="panel">
          <div className="section-head">
            <div>
              <p className="eyebrow">Competência atual</p>
              <h2>{formatMonth(overview.currentMonth, overview.year)}</h2>
            </div>
            <Link href="/months">Alterar mês</Link>
          </div>
          <dl className="summary-list">
            <div><dt>Despesas fixas previstas</dt><dd>{formatCurrency(current.fixedPlannedTotal)}</dd></div>
            <div><dt>Despesas fixas pagas</dt><dd>{formatCurrency(current.fixedPaidTotal)}</dd></div>
            <div><dt>Despesas variáveis</dt><dd>{formatCurrency(current.variableTotal)}</dd></div>
            <div><dt>Parcelas ativas</dt><dd>{formatCurrency(current.installmentTotal)}</dd></div>
            <div><dt>Investimentos acumulados</dt><dd>{formatCurrency(currentAccount?.investmentBalance)}</dd></div>
            <div><dt>Patrimônio total</dt><dd>{formatCurrency(currentAccount?.netWorth)}</dd></div>
          </dl>
        </article>

        <article className="panel">
          <div className="section-head">
            <div>
              <p className="eyebrow">Curva patrimonial</p>
              <h2>Foco em investimentos</h2>
            </div>
            <Link href="/accounts">Ver aba Contas</Link>
          </div>
          <EChart option={chartOption} height={320} />
        </article>
      </section>
    </div>
  );
}