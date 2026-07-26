'use client';

import { useEffect, useMemo, useState } from 'react';
import { EChart } from './echart';
import { PageHeader } from './page-header';
import { StatCard } from './stat-card';
import { formatCurrency } from '../lib/format';

// Generate distinct colors using HSL with evenly-spaced hues
function generateCategoryColors(count: number): string[] {
  const colors: string[] = [];
  const saturation = 65;
  const lightness = 50;
  for (let i = 0; i < count; i++) {
    const hue = (i * (360 / Math.max(count, 1)) + 10) % 360;
    colors.push(`hsl(${hue}, ${saturation}%, ${lightness}%)`);
  }
  return colors;
}

const MONTHS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

export function CategoryDashboardPage() {
  const [overview, setOverview] = useState<any>(null);
  const [chartType, setChartType] = useState<'stacked' | 'grouped'>('stacked');
  const [donutMonth, setDonutMonth] = useState(0); // 0-indexed
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetch('/api/reports/overview', { cache: 'no-store' })
      .then((response) => response.json())
      .then((data) => {
        setOverview(data);
        // Select all categories by default
        const ids = new Set<string>((data.dashboard ?? []).map((c: any) => c.categoryId));
        setSelectedCategories(ids);
        // Default donut to current month
        if (data.currentMonth) setDonutMonth(data.currentMonth - 1);
      })
      .catch(() => undefined);
  }, []);

  const dashboard = overview?.dashboard ?? [];
  const colors = useMemo(() => generateCategoryColors(dashboard.length), [dashboard.length]);

  // Compute KPIs
  const totalYear = dashboard.reduce((sum: number, cat: any) => sum + (cat.totalYear || 0), 0);
  const topCategory = dashboard.length > 0
    ? [...dashboard].sort((a: any, b: any) => b.totalYear - a.totalYear)[0]
    : null;
  const avgMonthly = totalYear / 12;

  function toggleCategory(id: string) {
    setSelectedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  const filteredDashboard = dashboard.filter((cat: any) => selectedCategories.has(cat.categoryId));

  const barChartOption = useMemo(() => ({
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      backgroundColor: 'hsl(25, 20%, 15%)',
      borderColor: 'transparent',
      textStyle: { color: 'hsl(36, 40%, 94%)', fontSize: 12 },
    },
    legend: {
      top: 0,
      textStyle: { fontSize: 10, color: 'hsl(25, 10%, 55%)' },
      type: 'scroll',
    },
    grid: { left: 24, right: 24, top: 72, bottom: 24, containLabel: true },
    xAxis: {
      type: 'category',
      data: MONTHS,
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
    series: filteredDashboard.map((category: any, idx: number) => {
      const colorIdx = dashboard.indexOf(category);
      return {
        name: category.categoryName,
        type: 'bar',
        stack: chartType === 'stacked' ? 'total' : undefined,
        emphasis: { focus: 'series' },
        data: category.monthlyTotals,
        itemStyle: { color: colors[colorIdx] },
        barMaxWidth: 40,
      };
    }),
    animationDuration: 600,
  }), [filteredDashboard, dashboard, colors, chartType]);

  const donutChartOption = useMemo(() => {
    const data = filteredDashboard
      .map((cat: any, idx: number) => {
        const colorIdx = dashboard.indexOf(cat);
        return {
          name: cat.categoryName,
          value: cat.monthlyTotals[donutMonth] || 0,
          itemStyle: { color: colors[colorIdx] },
        };
      })
      .filter((d: any) => d.value > 0);

    return {
      tooltip: {
        trigger: 'item',
        formatter: '{b}: R$ {c} ({d}%)',
        backgroundColor: 'hsl(25, 20%, 15%)',
        borderColor: 'transparent',
        textStyle: { color: 'hsl(36, 40%, 94%)', fontSize: 12 },
      },
      legend: {
        orient: 'vertical',
        right: 10,
        top: 'center',
        textStyle: { fontSize: 11, color: 'hsl(25, 10%, 55%)' },
        type: 'scroll',
      },
      series: [{
        type: 'pie',
        radius: ['45%', '72%'],
        center: ['35%', '50%'],
        avoidLabelOverlap: true,
        label: { show: false },
        emphasis: {
          label: { show: true, fontSize: 13, fontWeight: 'bold' },
        },
        data,
      }],
      animationDuration: 600,
    };
  }, [filteredDashboard, dashboard, colors, donutMonth]);

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
        title="Dashboard de gastos"
        subtitle="Análise por categoria ao longo do ano"
      />

      <div className="stat-cards">
        <StatCard
          icon="💸"
          label="Total anual"
          value={totalYear}
          formula="Soma de todas as despesas do ano por categoria"
          color="rose"
        />
        <StatCard
          icon="🏷️"
          label="Maior categoria"
          value={topCategory ? `${topCategory.categoryName}` : '—'}
          formula={topCategory ? `${formatCurrency(topCategory.totalYear)} no ano` : ''}
          color="amber"
        />
        <StatCard
          icon="📊"
          label="Média mensal"
          value={avgMonthly}
          formula="Total anual ÷ 12 meses"
          color="sky"
        />
      </div>

      {/* Category filters */}
      <div className="filter-checks">
        {dashboard.map((cat: any, idx: number) => (
          <button
            key={cat.categoryId}
            className={`filter-check ${selectedCategories.has(cat.categoryId) ? 'filter-check-active' : ''}`}
            onClick={() => toggleCategory(cat.categoryId)}
            type="button"
          >
            <span className="filter-check-box" style={{ background: selectedCategories.has(cat.categoryId) ? colors[idx] : undefined, borderColor: colors[idx] }}>
              {selectedCategories.has(cat.categoryId) ? '✓' : ''}
            </span>
            {cat.categoryName}
          </button>
        ))}
      </div>

      <div className="two-col">
        <div className="section-panel">
          <div className="section-panel-header">
            <div>
              <div className="section-panel-title">Gastos por mês</div>
              <div className="section-panel-subtitle">Visão mensal por categoria</div>
            </div>
            <div className="toggle-group">
              <button className={`toggle-item ${chartType === 'stacked' ? 'toggle-item-active' : ''}`} onClick={() => setChartType('stacked')} type="button">Empilhado</button>
              <button className={`toggle-item ${chartType === 'grouped' ? 'toggle-item-active' : ''}`} onClick={() => setChartType('grouped')} type="button">Agrupado</button>
            </div>
          </div>
          <div className="section-panel-body">
            <EChart option={barChartOption} height={380} />
          </div>
        </div>

        <div className="section-panel">
          <div className="section-panel-header">
            <div>
              <div className="section-panel-title">Distribuição</div>
              <div className="section-panel-subtitle">Proporção por categoria</div>
            </div>
            <select
              className="month-nav-select"
              value={donutMonth}
              onChange={(e) => setDonutMonth(Number(e.target.value))}
            >
              {MONTHS.map((m, i) => (
                <option key={i} value={i}>{m}</option>
              ))}
            </select>
          </div>
          <div className="section-panel-body">
            <EChart option={donutChartOption} height={380} />
          </div>
        </div>
      </div>

      <div className="section-panel">
        <div className="section-panel-header">
          <div>
            <div className="section-panel-title">Detalhamento por categoria</div>
          </div>
        </div>
        <div className="section-panel-body-flush">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Categoria</th>
                  <th style={{ textAlign: 'right' }}>Total anual</th>
                  <th style={{ textAlign: 'right' }}>Média/mês</th>
                  {MONTHS.map((month) => <th key={month} style={{ textAlign: 'right' }}>{month}</th>)}
                </tr>
              </thead>
              <tbody>
                {dashboard.map((category: any) => (
                  <tr key={category.categoryId} style={{ opacity: selectedCategories.has(category.categoryId) ? 1 : 0.4 }}>
                    <td style={{ fontWeight: 600 }}>{category.categoryName}</td>
                    <td style={{ textAlign: 'right', fontWeight: 700 }}>{formatCurrency(category.totalYear)}</td>
                    <td style={{ textAlign: 'right', color: 'hsl(25, 10%, 55%)' }}>{formatCurrency(category.totalYear / 12)}</td>
                    {category.monthlyTotals.map((value: number, index: number) => (
                      <td key={`${category.categoryId}-${index}`} style={{ textAlign: 'right' }}>
                        {value > 0 ? formatCurrency(value) : <span style={{ color: 'hsl(25, 10%, 75%)' }}>—</span>}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}