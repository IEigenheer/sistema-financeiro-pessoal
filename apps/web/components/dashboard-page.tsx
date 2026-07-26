'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { EChart } from './echart';
import { PageHeader } from './page-header';
import { StatCard } from './stat-card';
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
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'hsl(25, 20%, 15%)',
      borderColor: 'transparent',
      textStyle: { color: 'hsl(36, 40%, 94%)', fontSize: 12 },
    },
    grid: { left: 24, right: 24, top: 36, bottom: 24, containLabel: true },
    xAxis: {
      type: 'category',
      data: accounts.map((item: any) => item.label),
      axisLine: { lineStyle: { color: 'hsl(25, 12%, 80%)' } },
      axisLabel: { color: 'hsl(25, 10%, 55%)', fontSize: 11 },
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter: (value: number) => `R$ ${Math.round(value).toLocaleString('pt-BR')}`,
        color: 'hsl(25, 10%, 55%)',
        fontSize: 11,
      },
      splitLine: { lineStyle: { color: 'hsl(25, 20%, 40%, 0.08)' } },
    },
    series: [
      {
        name: 'Investimentos',
        type: 'line',
        smooth: true,
        data: accounts.map((item: any) => item.investmentBalance),
        lineStyle: { width: 3, color: 'hsl(168, 76%, 28%)' },
        itemStyle: { color: 'hsl(168, 76%, 28%)' },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'hsla(168, 76%, 28%, 0.2)' },
              { offset: 1, color: 'hsla(168, 76%, 28%, 0.02)' },
            ],
          },
        },
        markPoint: currentAccount ? {
          data: [{
            name: 'Atual',
            coord: [currentAccount.label, currentAccount.investmentBalance],
            symbol: 'circle',
            symbolSize: 10,
            itemStyle: { color: 'hsl(38, 92%, 50%)' },
          }],
        } : undefined,
      },
    ],
    animationDuration: 800,
    animationEasing: 'cubicInOut' as const,
  }), [accounts, currentAccount]);

  if (!overview || !current) {
    return (
      <div className="content-stack">
        <div className="stat-cards">
          {[1, 2, 3, 4].map((i) => <div key={i} className="skeleton skeleton-card" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="content-stack">
      <PageHeader
        title="Resumo financeiro"
        subtitle="Visão consolidada do mês atual com reflexo patrimonial"
        actions={
          <>
            <Link href="/months" className="btn btn-primary">📅 Abrir meses</Link>
            <Link href="/simulator" className="btn btn-secondary">🎯 Simular cenários</Link>
          </>
        }
      />

      <div className="stat-cards">
        <StatCard
          icon="💵"
          label="Entradas do mês"
          value={current.entriesTotal}
          formula="Soma de salário + entradas extras do mês"
          color="emerald"
        />
        <StatCard
          icon="💰"
          label="Saldo disponível"
          value={current.availableBalance}
          formula="Entradas − despesas fixas − saídas variáveis − parcelas − aporte"
          color="sky"
        />
        <StatCard
          icon="📈"
          label="Aporte do mês"
          value={current.effectiveInvestmentContribution}
          formula="Valor destinado a investimento na competência mensal"
          color="amber"
        />
      </div>

      <div className="two-col">
        <div className="section-panel">
          <div className="section-panel-header">
            <div>
              <div className="section-panel-title">{formatMonth(overview.currentMonth, overview.year)}</div>
              <div className="section-panel-subtitle">Competência atual</div>
            </div>
            <Link href="/months" className="btn btn-ghost btn-sm">Alterar mês →</Link>
          </div>
          <div className="section-panel-body">
            <dl className="summary-list">
              <div className="summary-list-item">
                <dt className="summary-list-label">Despesas fixas previstas</dt>
                <dd className="summary-list-value">{formatCurrency(current.fixedPlannedTotal)}</dd>
              </div>
              <div className="summary-list-item">
                <dt className="summary-list-label">Despesas fixas pagas</dt>
                <dd className="summary-list-value">{formatCurrency(current.fixedPaidTotal)}</dd>
              </div>
              <div className="summary-list-item">
                <dt className="summary-list-label">Despesas variáveis</dt>
                <dd className="summary-list-value">{formatCurrency(current.variableTotal)}</dd>
              </div>
              <div className="summary-list-item">
                <dt className="summary-list-label">Parcelas ativas</dt>
                <dd className="summary-list-value">{formatCurrency(current.installmentTotal)}</dd>
              </div>
              <div className="summary-list-item">
                <dt className="summary-list-label">Investimentos acumulados</dt>
                <dd className="summary-list-value" style={{ color: 'var(--emerald-600)', fontSize: '1.05rem', fontWeight: 700 }}>
                  {formatCurrency(currentAccount?.investmentBalance)}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="section-panel">
          <div className="section-panel-header">
            <div>
              <div className="section-panel-title">Curva patrimonial</div>
              <div className="section-panel-subtitle">Evolução dos investimentos</div>
            </div>
            <Link href="/accounts" className="btn btn-ghost btn-sm">Ver contas →</Link>
          </div>
          <div className="section-panel-body">
            <EChart option={chartOption} height={320} />
          </div>
        </div>
      </div>
    </div>
  );
}