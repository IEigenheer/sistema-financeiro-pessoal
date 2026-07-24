'use client';

import { useEffect, useMemo, useState } from 'react';
import { EChart } from './echart';
import { formatCurrency } from '../lib/format';

export function AccountsPage() {
  const [overview, setOverview] = useState<any>(null);
  const [metric, setMetric] = useState<'investment' | 'wealth'>('investment');

  useEffect(() => {
    fetch('/api/reports/overview', { cache: 'no-store' })
      .then((response) => response.json())
      .then(setOverview)
      .catch(() => undefined);
  }, []);

  const accounts = overview?.accounts ?? [];

  const chartOption = useMemo(() => ({
    tooltip: { trigger: 'axis' },
    legend: { top: 0 },
    grid: { left: 24, right: 24, top: 56, bottom: 24, containLabel: true },
    xAxis: {
      type: 'category',
      data: accounts.map((item: any) => item.label),
    },
    yAxis: {
      type: 'value',
      axisLabel: { formatter: (value: number) => `R$ ${Math.round(value).toLocaleString('pt-BR')}` },
    },
    series: [
      {
        name: metric === 'investment' ? 'Investimentos' : 'Patrimônio',
        type: 'line',
        smooth: true,
        data: accounts.map((item: any) => metric === 'investment' ? item.investmentBalance : item.netWorth),
        lineStyle: { width: 4, color: '#0f766e' },
        itemStyle: { color: '#0f766e' },
        areaStyle: { color: 'rgba(15, 118, 110, 0.15)' },
      },
    ],
  }), [accounts, metric]);

  if (!overview) {
    return <div className="panel">Carregando aba Contas...</div>;
  }

  return (
    <div className="stack-xl">
      <section className="panel">
        <div className="section-head">
          <div>
            <p className="eyebrow">Contas</p>
            <h2>Consolidado do patrimônio ao longo do ano</h2>
          </div>
          <div className="toggle-row">
            <button className={`chip ${metric === 'investment' ? 'chip-paid' : 'chip-pending'}`} onClick={() => setMetric('investment')} type="button">Somente investimento</button>
            <button className={`chip ${metric === 'wealth' ? 'chip-paid' : 'chip-pending'}`} onClick={() => setMetric('wealth')} type="button">Patrimônio total</button>
          </div>
        </div>
        <EChart option={chartOption} height={360} />
      </section>

      <section className="panel">
        <div className="section-head">
          <div>
            <p className="eyebrow">Tabela anual</p>
            <h2>Separação entre aporte mensal e aporte efetivo</h2>
          </div>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Mês</th>
                <th>Entradas</th>
                <th>Fixas</th>
                <th>Variáveis</th>
                <th>Parcelas</th>
                <th>Aporte mensal</th>
                <th>Aporte efetivo</th>
                <th>Investimentos</th>
                <th>Patrimônio</th>
              </tr>
            </thead>
            <tbody>
              {accounts.map((row: any) => (
                <tr key={row.month}>
                  <td>{row.label}</td>
                  <td>{formatCurrency(row.entriesTotal)}</td>
                  <td>{formatCurrency(row.fixedPlannedTotal)}</td>
                  <td>{formatCurrency(row.variableTotal)}</td>
                  <td>{formatCurrency(row.installmentTotal)}</td>
                  <td>{formatCurrency(row.sheetInvestmentContribution)}</td>
                  <td>{formatCurrency(row.investmentContribution)}</td>
                  <td>{formatCurrency(row.investmentBalance)}</td>
                  <td>{formatCurrency(row.netWorth)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}