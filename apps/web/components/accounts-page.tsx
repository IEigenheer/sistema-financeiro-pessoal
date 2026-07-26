'use client';

import { useEffect, useMemo, useState } from 'react';
import { EChart } from './echart';
import { PageHeader } from './page-header';
import { StatCard } from './stat-card';
import { formatCurrency } from '../lib/format';

export function AccountsPage() {
  const [overview, setOverview] = useState<any>(null);

  useEffect(() => {
    fetch('/api/reports/overview', { cache: 'no-store' })
      .then((response) => response.json())
      .then(setOverview)
      .catch(() => undefined);
  }, []);

  const accounts = overview?.accounts ?? [];
  const currentMonth = overview?.currentMonth;

  // Compute summary values for December / End of Year
  const latestAccount = accounts.length > 0 ? accounts[accounts.length - 1] : null;
  const totalContribution = accounts.reduce((sum: number, item: any) => sum + (item.investmentContribution || 0), 0);

  const chartOption = useMemo(() => {
    let accumulated = 0;
    const accumulatedData = accounts.map((item: any) => {
      accumulated += item.investmentContribution || 0;
      return accumulated;
    });

    return {
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'hsl(25, 20%, 15%)',
        borderColor: 'transparent',
        textStyle: { color: 'hsl(36, 40%, 94%)', fontSize: 12 },
      },
      legend: {
        top: 0,
        textStyle: { fontSize: 11, color: 'hsl(25, 10%, 55%)' },
      },
      grid: { left: 24, right: 24, top: 48, bottom: 24, containLabel: true },
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
          name: 'Investimentos (acumulado)',
          type: 'line',
          smooth: true,
          data: accounts.map((item: any) => item.investmentBalance),
          lineStyle: { width: 3, color: 'hsl(168, 76%, 28%)' },
          itemStyle: { color: 'hsl(168, 76%, 28%)' },
          areaStyle: {
            color: {
              type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: 'hsla(168, 76%, 28%, 0.15)' },
                { offset: 1, color: 'hsla(168, 76%, 28%, 0.02)' },
              ],
            },
          },
        },
        {
          name: 'Aporte acumulado',
          type: 'line',
          smooth: true,
          data: accumulatedData,
          lineStyle: { width: 2, color: 'hsl(38, 92%, 50%)', type: 'dashed' },
          itemStyle: { color: 'hsl(38, 92%, 50%)' },
        },
      ],
      animationDuration: 800,
      animationEasing: 'cubicInOut' as const,
    };
  }, [accounts]);

  if (!overview) {
    return (
      <div className="content-stack">
        <div className="skeleton skeleton-card" style={{ height: 200 }} />
      </div>
    );
  }

  return (
    <div className="content-stack">
      <PageHeader
        title="Contas & Patrimônio"
        subtitle="Consolidado e evolução dos investimentos ao longo do ano"
      />

      <div className="stat-cards">
        <StatCard
          icon="📈"
          label="Investimento final (Dezembro)"
          value={latestAccount?.investmentBalance}
          formula="Saldo total acumulado em investimentos projetado para o final do ano (Dezembro)"
          color="emerald"
        />
        <StatCard
          icon="💳"
          label="Aporte acumulado no ano"
          value={totalContribution}
          formula="Soma de todos os aportes efetivos de Janeiro a Dezembro"
          color="amber"
        />
      </div>

      <div className="section-panel">
        <div className="section-panel-header">
          <div>
            <div className="section-panel-title">Evolução dos investimentos</div>
            <div className="section-panel-subtitle">Saldo acumulado vs. total aportado mês a mês</div>
          </div>
        </div>
        <div className="section-panel-body">
          <EChart option={chartOption} height={380} />
        </div>
      </div>

      <div className="section-panel">
        <div className="section-panel-header">
          <div>
            <div className="section-panel-title">Tabela anual</div>
            <div className="section-panel-subtitle">Detalhamento mensal dos fluxos e saldo de investimento</div>
          </div>
        </div>
        <div className="section-panel-body-flush">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Mês</th>
                  <th style={{ textAlign: 'right' }}>Entradas</th>
                  <th style={{ textAlign: 'right' }}>Fixas</th>
                  <th style={{ textAlign: 'right' }}>Saídas variáveis</th>
                  <th style={{ textAlign: 'right' }}>Parcelas</th>
                  <th style={{ textAlign: 'right' }}>Aporte base</th>
                  <th style={{ textAlign: 'right' }}>Aporte efetivo</th>
                  <th style={{ textAlign: 'right' }}>Saldo investimentos</th>
                </tr>
              </thead>
              <tbody>
                {accounts.map((row: any) => {
                  const isCurrentMonth = row.month === currentMonth;

                  return (
                    <tr key={row.month} className={isCurrentMonth ? 'table-row-highlight' : ''}>
                      <td style={{ fontWeight: isCurrentMonth ? 700 : 400 }}>
                        {isCurrentMonth ? '► ' : ''}{row.label}
                      </td>
                      <td style={{ textAlign: 'right' }}>{formatCurrency(row.entriesTotal)}</td>
                      <td style={{ textAlign: 'right' }}>{formatCurrency(row.fixedPlannedTotal)}</td>
                      <td style={{ textAlign: 'right' }}>{formatCurrency(row.variableTotal)}</td>
                      <td style={{ textAlign: 'right' }}>{formatCurrency(row.installmentTotal)}</td>
                      <td style={{ textAlign: 'right' }}>{formatCurrency(row.sheetInvestmentContribution)}</td>
                      <td style={{ textAlign: 'right' }}>{formatCurrency(row.investmentContribution)}</td>
                      <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--emerald-600)' }}>
                        {formatCurrency(row.investmentBalance)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}