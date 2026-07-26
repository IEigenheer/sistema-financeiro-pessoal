'use client';

import { useEffect, useMemo, useState } from 'react';
import { EChart } from './echart';
import { PageHeader } from './page-header';
import { StatCard } from './stat-card';
import { formatCurrency } from '../lib/format';

export function AccountsPage() {
  const [overview, setOverview] = useState<any>(null);
  const [metric, setMetric] = useState<'investment' | 'wealth' | 'both'>('both');

  useEffect(() => {
    fetch('/api/reports/overview', { cache: 'no-store' })
      .then((response) => response.json())
      .then(setOverview)
      .catch(() => undefined);
  }, []);

  const accounts = overview?.accounts ?? [];
  const currentMonth = overview?.currentMonth;

  // Compute summary values
  const latestAccount = accounts.length > 0 ? accounts[accounts.length - 1] : null;
  const totalContribution = accounts.reduce((sum: number, item: any) => sum + (item.investmentContribution || 0), 0);

  const chartOption = useMemo(() => {
    const series: any[] = [];

    if (metric === 'investment' || metric === 'both') {
      series.push({
        name: 'Investimentos',
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
      });
    }

    if (metric === 'wealth' || metric === 'both') {
      series.push({
        name: 'Patrimônio',
        type: 'line',
        smooth: true,
        data: accounts.map((item: any) => item.netWorth),
        lineStyle: { width: 3, color: 'hsl(199, 89%, 48%)' },
        itemStyle: { color: 'hsl(199, 89%, 48%)' },
        areaStyle: {
          color: {
            type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'hsla(199, 89%, 48%, 0.12)' },
              { offset: 1, color: 'hsla(199, 89%, 48%, 0.02)' },
            ],
          },
        },
      });
    }

    // Accumulated contribution as dashed line
    let accumulated = 0;
    const accumulatedData = accounts.map((item: any) => {
      accumulated += item.investmentContribution || 0;
      return accumulated;
    });

    series.push({
      name: 'Aporte acumulado',
      type: 'line',
      smooth: true,
      data: accumulatedData,
      lineStyle: { width: 2, color: 'hsl(25, 10%, 65%)', type: 'dashed' },
      itemStyle: { color: 'hsl(25, 10%, 65%)' },
    });

    // Mark current month
    const currentIdx = accounts.findIndex((item: any) => item.month === currentMonth);

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
      grid: { left: 24, right: 24, top: 56, bottom: 24, containLabel: true },
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
      series,
      animationDuration: 800,
      animationEasing: 'cubicInOut' as const,
    };
  }, [accounts, metric, currentMonth]);

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
        title="Contas"
        subtitle="Consolidado patrimonial ao longo do ano"
      />

      <div className="stat-cards">
        <StatCard
          icon="📈"
          label="Investimento atual"
          value={latestAccount?.investmentBalance}
          formula="Saldo acumulado de investimentos no último mês"
          color="emerald"
        />
        <StatCard
          icon="💎"
          label="Patrimônio líquido"
          value={latestAccount?.netWorth}
          formula="Conta corrente + investimentos"
          color="sky"
        />
        <StatCard
          icon="💳"
          label="Aporte acumulado"
          value={totalContribution}
          formula="Soma de todos os aportes efetivos do ano"
          color="amber"
        />
      </div>

      <div className="section-panel">
        <div className="section-panel-header">
          <div>
            <div className="section-panel-title">Evolução patrimonial</div>
            <div className="section-panel-subtitle">Investimentos, patrimônio e aporte acumulado</div>
          </div>
          <div className="toggle-group">
            <button className={`toggle-item ${metric === 'investment' ? 'toggle-item-active' : ''}`} onClick={() => setMetric('investment')} type="button">Investimento</button>
            <button className={`toggle-item ${metric === 'wealth' ? 'toggle-item-active' : ''}`} onClick={() => setMetric('wealth')} type="button">Patrimônio</button>
            <button className={`toggle-item ${metric === 'both' ? 'toggle-item-active' : ''}`} onClick={() => setMetric('both')} type="button">Ambos</button>
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
            <div className="section-panel-subtitle">Aporte mensal vs. aporte efetivo com variação</div>
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
                  <th style={{ textAlign: 'right' }}>Variáveis</th>
                  <th style={{ textAlign: 'right' }}>Parcelas</th>
                  <th style={{ textAlign: 'right' }}>Aporte mensal</th>
                  <th style={{ textAlign: 'right' }}>Aporte efetivo</th>
                  <th style={{ textAlign: 'right' }}>Investimentos</th>
                  <th style={{ textAlign: 'right' }}>Patrimônio</th>
                </tr>
              </thead>
              <tbody>
                {accounts.map((row: any, idx: number) => {
                  const prevInv = idx > 0 ? accounts[idx - 1].investmentBalance : 0;
                  const delta = row.investmentBalance - prevInv;
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
                      <td style={{ textAlign: 'right' }}>{formatCurrency(row.investmentBalance)}</td>
                      <td style={{ textAlign: 'right', fontWeight: 700 }}>{formatCurrency(row.netWorth)}</td>
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