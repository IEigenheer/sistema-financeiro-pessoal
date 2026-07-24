'use client';

import { useEffect, useMemo, useState } from 'react';
import { EChart } from './echart';
import { formatCurrency } from '../lib/format';

export function CategoryDashboardPage() {
  const [overview, setOverview] = useState<any>(null);

  useEffect(() => {
    fetch('/api/reports/overview', { cache: 'no-store' })
      .then((response) => response.json())
      .then(setOverview)
      .catch(() => undefined);
  }, []);

  const dashboard = overview?.dashboard ?? [];
  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

  const chartOption = useMemo(() => ({
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    legend: { top: 0 },
    grid: { left: 24, right: 24, top: 72, bottom: 24, containLabel: true },
    xAxis: { type: 'category', data: months },
    yAxis: {
      type: 'value',
      axisLabel: { formatter: (value: number) => `R$ ${Math.round(value).toLocaleString('pt-BR')}` },
    },
    series: dashboard.map((category: any) => ({
      name: category.categoryName,
      type: 'bar',
      stack: 'total',
      emphasis: { focus: 'series' },
      data: category.monthlyTotals,
    })),
  }), [dashboard]);

  if (!overview) {
    return <div className="panel">Carregando dashboard...</div>;
  }

  return (
    <div className="stack-xl">
      <section className="panel">
        <div className="section-head">
          <div>
            <p className="eyebrow">Dashboard</p>
            <h2>Gastos por categoria com Apache ECharts</h2>
          </div>
        </div>
        <EChart option={chartOption} height={420} />
      </section>

      <section className="panel">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Categoria</th>
                <th>Total anual</th>
                {months.map((month) => <th key={month}>{month}</th>)}
              </tr>
            </thead>
            <tbody>
              {dashboard.map((category: any) => (
                <tr key={category.categoryId}>
                  <td>{category.categoryName}</td>
                  <td>{formatCurrency(category.totalYear)}</td>
                  {category.monthlyTotals.map((value: number, index: number) => (
                    <td key={`${category.categoryId}-${index}`}>{formatCurrency(value)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}