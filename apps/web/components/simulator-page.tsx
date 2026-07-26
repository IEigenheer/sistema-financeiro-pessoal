'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { EChart } from './echart';
import { PageHeader } from './page-header';
import { formatCurrency, formatDate } from '../lib/format';

const MONTH_OPTIONS = [
  { value: 1, label: 'Janeiro' },
  { value: 2, label: 'Fevereiro' },
  { value: 3, label: 'Março' },
  { value: 4, label: 'Abril' },
  { value: 5, label: 'Maio' },
  { value: 6, label: 'Junho' },
  { value: 7, label: 'Julho' },
  { value: 8, label: 'Agosto' },
  { value: 9, label: 'Setembro' },
  { value: 10, label: 'Outubro' },
  { value: 11, label: 'Novembro' },
  { value: 12, label: 'Dezembro' },
];

const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

function extractSeries(rows: any[], scenario: 'base' | 'comparison', variant: 'baseline' | 'purchase' | 'extras' | 'full', metric: 'wealth' | 'investment') {
  if (!Array.isArray(rows)) return [];
  return rows.map((row) => row?.[scenario]?.[variant]?.[metric] ?? 0);
}

function roundNumber(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function SimulatorPage() {
  const [overview, setOverview] = useState<any>(null);
  const [form, setForm] = useState<any>(null);
  const [result, setResult] = useState<any>(null);
  const [includePurchase, setIncludePurchase] = useState(false);
  const [includeExtraEntries, setIncludeExtraEntries] = useState(false);
  const [metric, setMetric] = useState<'wealth' | 'investment'>('investment');

  // Table options: grouping & expanding
  const [tableView, setTableView] = useState<'annual' | 'monthly'>('annual');
  const [expandedYears, setExpandedYears] = useState<Set<number>>(new Set());

  useEffect(() => {
    fetch('/api/reports/overview', { cache: 'no-store' })
      .then((response) => response.json())
      .then((data) => {
        setOverview(data);
        setForm({
          startMonth: data.currentMonth,
          salaryMonthly: Number(data.settings.salaryNetTotal),
          fixedMonthlyExpense: Number(data.currentMonthDetail.fixedPlannedTotal),
          variableMonthlyExpense: Number(data.currentMonthDetail.variableTotal),
          baseMonthlyInvestment: Number(data.currentMonthDetail.investmentContribution),
          comparisonMonthlyInvestment: Number(data.currentMonthDetail.investmentContribution) + 2000,
          monthlyReturnRate: Number(data.settings.projectedMonthlyReturnRate),
          monthsToSimulate: 12,
          purchaseValue: 0,
          purchaseMode: 'cash',
          purchaseInstallmentCount: 1,
          purchaseStartMonthIndex: 1,
          investmentOnly: true,
          extraEntries: [],
        });
      })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!form) return;
    fetch('/api/reports/simulator', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, investmentOnly: metric === 'investment' }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data && Array.isArray(data.rows)) {
          setResult(data);
        }
      })
      .catch(() => undefined);
  }, [form, metric]);

  // Compute Target Month & Year from startMonth + monthsToSimulate
  const targetDateInfo = useMemo(() => {
    if (!overview || !form) return { month: 12, year: 2027 };
    const startYr = overview.year;
    const startMo = form.startMonth || 1;
    const targetDate = new Date(startYr, startMo - 1 + form.monthsToSimulate, 1);
    return {
      month: targetDate.getMonth() + 1,
      year: targetDate.getFullYear(),
    };
  }, [overview, form?.startMonth, form?.monthsToSimulate]);

  // Options for simulation months (for purchase start and extra entries)
  const simulationMonthOptions = useMemo(() => {
    if (!overview || !form) return [];
    const startYr = overview.year;
    const startMo = form.startMonth || 1;
    return Array.from({ length: form.monthsToSimulate }, (_, i) => {
      const idx = i + 1;
      const date = new Date(startYr, startMo - 1 + idx, 1);
      const mStr = String(date.getMonth() + 1).padStart(2, '0');
      const yStr = date.getFullYear();
      const monthName = MONTH_NAMES[date.getMonth()];
      return {
        index: idx,
        label: monthName,
        monthYear: `${mStr}/${yStr}`,
      };
    });
  }, [overview, form?.startMonth, form?.monthsToSimulate]);

  const activeVariant: 'baseline' | 'purchase' | 'extras' | 'full' = includePurchase
    ? includeExtraEntries ? 'full' : 'purchase'
    : includeExtraEntries ? 'extras' : 'baseline';

  const chartOption = useMemo(() => {
    const rows = result?.rows ?? [];
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
        data: rows.map((row: any) => `Mês ${row.monthIndex}`),
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
          name: 'Cenário base',
          type: 'line',
          smooth: true,
          data: extractSeries(rows, 'base', activeVariant, metric),
          lineStyle: { width: 3, color: 'hsl(168, 76%, 28%)' },
          itemStyle: { color: 'hsl(168, 76%, 28%)' },
          areaStyle: {
            color: {
              type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: 'hsla(168, 76%, 28%, 0.1)' },
                { offset: 1, color: 'hsla(168, 76%, 28%, 0.01)' },
              ],
            },
          },
        },
        {
          name: 'Cenário comparativo',
          type: 'line',
          smooth: true,
          data: extractSeries(rows, 'comparison', activeVariant, metric),
          lineStyle: { width: 3, color: 'hsl(38, 92%, 50%)' },
          itemStyle: { color: 'hsl(38, 92%, 50%)' },
          areaStyle: {
            color: {
              type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: 'hsla(38, 92%, 50%, 0.1)' },
                { offset: 1, color: 'hsla(38, 92%, 50%, 0.01)' },
              ],
            },
          },
        },
      ],
      animationDuration: 600,
    };
  }, [activeVariant, metric, result]);

  const deltaChartOption = useMemo(() => {
    const rows = result?.rows ?? [];
    return {
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'hsl(25, 20%, 15%)',
        borderColor: 'transparent',
        textStyle: { color: 'hsl(36, 40%, 94%)', fontSize: 12 },
      },
      grid: { left: 24, right: 24, top: 24, bottom: 24, containLabel: true },
      xAxis: {
        type: 'category',
        data: rows.map((row: any) => `Mês ${row.monthIndex}`),
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
      series: [{
        name: 'Diferença (comparativo − base)',
        type: 'bar',
        data: rows.map((row: any) => roundNumber((row?.comparison?.[activeVariant]?.[metric] ?? 0) - (row?.base?.[activeVariant]?.[metric] ?? 0))),
        itemStyle: {
          color: (params: any) => params.value >= 0 ? 'hsl(168, 76%, 28%)' : 'hsl(356, 75%, 53%)',
        },
        barMaxWidth: 40,
      }],
      animationDuration: 600,
    };
  }, [activeVariant, metric, result]);

  // Group projection rows by Year for long projections
  const yearlyGroupedRows = useMemo(() => {
    const rows = result?.rows ?? [];
    if (rows.length === 0) return [];

    const groupsMap = new Map<number, any[]>();
    rows.forEach((row: any) => {
      const year = new Date(row.date).getFullYear();
      if (!groupsMap.has(year)) {
        groupsMap.set(year, []);
      }
      groupsMap.get(year)!.push(row);
    });

    const yearGroups: any[] = [];
    groupsMap.forEach((monthRows, year) => {
      const existingInstallmentsTotal = monthRows.reduce((sum, r) => sum + (r.existingInstallments || 0), 0);
      const purchaseInstallmentTotal = monthRows.reduce((sum, r) => sum + (r.purchaseInstallment || 0), 0);
      const baseExtraTotal = monthRows.reduce((sum, r) => sum + (r.baseExtra || 0), 0);
      const comparisonExtraTotal = monthRows.reduce((sum, r) => sum + (r.comparisonExtra || 0), 0);
      
      const lastMonthRow = monthRows[monthRows.length - 1];
      const finalBase = lastMonthRow?.base?.[activeVariant]?.[metric] ?? 0;
      const finalComparison = lastMonthRow?.comparison?.[activeVariant]?.[metric] ?? 0;

      yearGroups.push({
        year,
        monthsCount: monthRows.length,
        monthRows,
        existingInstallmentsTotal,
        purchaseInstallmentTotal,
        baseExtraTotal,
        comparisonExtraTotal,
        finalBase,
        finalComparison,
      });
    });

    return yearGroups;
  }, [result, activeVariant, metric]);

  const lastRow = result?.rows?.length > 0 ? result.rows[result.rows.length - 1] : null;
  const finalDelta = lastRow ? roundNumber((lastRow?.comparison?.[activeVariant]?.[metric] ?? 0) - (lastRow?.base?.[activeVariant]?.[metric] ?? 0)) : 0;
  const baseTotal = lastRow ? (lastRow?.base?.[activeVariant]?.[metric] ?? 0) : 0;
  const compTotal = lastRow ? (lastRow?.comparison?.[activeVariant]?.[metric] ?? 0) : 0;

  if (!form || !overview) {
    return (
      <div className="content-stack">
        <div className="skeleton skeleton-card" style={{ height: 300 }} />
      </div>
    );
  }

  function updateField(field: string, value: any) {
    setForm((prev: any) => ({ ...prev, [field]: value }));
  }

  // Update target month/year -> re-calculates monthsToSimulate
  function handleTargetDateChange(newTargetMonth: number, newTargetYear: number) {
    if (!overview || !form) return;
    const startYr = overview.year;
    const startMo = form.startMonth || 1;
    const diff = (newTargetYear - startYr) * 12 + (newTargetMonth - startMo);
    const monthsCount = Math.max(1, Math.min(600, diff));
    updateField('monthsToSimulate', monthsCount);
  }

  function updateExtraEntry(id: string, field: string, value: any) {
    setForm((prev: any) => ({
      ...prev,
      extraEntries: prev.extraEntries.map((item: any) =>
        item.id === id ? { ...item, [field]: value } : item
      ),
    }));
  }

  function removeExtraEntry(id: string) {
    setForm((prev: any) => ({
      ...prev,
      extraEntries: prev.extraEntries.filter((item: any) => item.id !== id),
    }));
  }

  function addExtraEntry() {
    const newId = `extra_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    setForm((prev: any) => ({
      ...prev,
      extraEntries: [
        ...prev.extraEntries,
        { id: newId, monthIndex: 1, label: 'Nova entrada', amount: 0, scenario: 'both' },
      ],
    }));
  }

  function toggleYearExpand(year: number) {
    setExpandedYears((prev) => {
      const next = new Set(prev);
      if (next.has(year)) {
        next.delete(year);
      } else {
        next.add(year);
      }
      return next;
    });
  }

  const yearOptions = Array.from({ length: 45 }, (_, i) => overview.year + i);

  return (
    <div className="content-stack">
      <PageHeader
        title="Simulador de cenários"
        subtitle="Compare cenários de investimento com compra simulada e entradas extras"
      />

      {/* Side-by-side layout: Config left, Result right */}
      <div className="sim-layout">
        {/* Left: Configuration */}
        <div className="sim-config">
          {/* Fieldset: Renda e Gastos */}
          <div className="fieldset">
            <div className="fieldset-legend">
              <span className="fieldset-legend-icon">💰</span>
              Renda e gastos mensais
            </div>
            <div className="form-stack">
              <div className="form-field">
                <label className="form-label">Salário líquido mensal</label>
                <span className="form-hint">Valor líquido recebido todo mês</span>
                <input className="form-input" type="number" value={form.salaryMonthly} onChange={(e) => updateField('salaryMonthly', Number(e.target.value))} />
              </div>
              <div className="form-row">
                <div className="form-field">
                  <label className="form-label">Gastos fixos</label>
                  <span className="form-hint">Aluguel, contas, etc.</span>
                  <input className="form-input" type="number" value={form.fixedMonthlyExpense} onChange={(e) => updateField('fixedMonthlyExpense', Number(e.target.value))} />
                </div>
                <div className="form-field">
                  <label className="form-label">Gastos variáveis</label>
                  <span className="form-hint">Mercado, lazer, etc.</span>
                  <input className="form-input" type="number" value={form.variableMonthlyExpense} onChange={(e) => updateField('variableMonthlyExpense', Number(e.target.value))} />
                </div>
              </div>
            </div>
          </div>

          {/* Fieldset: Investimento */}
          <div className="fieldset">
            <div className="fieldset-legend">
              <span className="fieldset-legend-icon">📈</span>
              Investimento
            </div>
            <div className="form-stack">
              <div className="form-row">
                <div className="form-field">
                  <label className="form-label">Aporte base</label>
                  <span className="form-hint">Cenário principal</span>
                  <input className="form-input" type="number" value={form.baseMonthlyInvestment} onChange={(e) => updateField('baseMonthlyInvestment', Number(e.target.value))} />
                </div>
                <div className="form-field">
                  <label className="form-label">Aporte comparativo</label>
                  <span className="form-hint">Cenário alternativo</span>
                  <input className="form-input" type="number" value={form.comparisonMonthlyInvestment} onChange={(e) => updateField('comparisonMonthlyInvestment', Number(e.target.value))} />
                </div>
              </div>

              {/* Mês de partida */}
              <div className="form-field">
                <label className="form-label">Mês de partida</label>
                <span className="form-hint">Início da simulação</span>
                <select className="form-select" value={form.startMonth} onChange={(e) => updateField('startMonth', Number(e.target.value))}>
                  {MONTH_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label} / {overview?.year ?? 2026}
                    </option>
                  ))}
                </select>
              </div>

              {/* Mês / Ano Alvo */}
              <div className="form-field">
                <label className="form-label">Mês / Ano alvo da projeção</label>
                <span className="form-hint">Selecione o mês e ano final desejado</span>
                <div className="form-row" style={{ gridTemplateColumns: '1fr 1fr' }}>
                  <select
                    className="form-select"
                    value={targetDateInfo.month}
                    onChange={(e) => handleTargetDateChange(Number(e.target.value), targetDateInfo.year)}
                  >
                    {MONTH_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                  <select
                    className="form-select"
                    value={targetDateInfo.year}
                    onChange={(e) => handleTargetDateChange(targetDateInfo.month, Number(e.target.value))}
                  >
                    {yearOptions.map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-field">
                  <label className="form-label">Rendimento mensal</label>
                  <span className="form-hint">Taxa projetada ao mês</span>
                  <input className="form-input" type="number" step="0.001" value={form.monthlyReturnRate} onChange={(e) => updateField('monthlyReturnRate', Number(e.target.value))} />
                </div>
                <div className="form-field">
                  <label className="form-label">Meses simulados 🔒</label>
                  <span className="form-hint">Calculado automaticamente</span>
                  <input
                    className="form-input"
                    type="text"
                    readOnly
                    value={`${form.monthsToSimulate} meses`}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Fieldset: Compra */}
          <div className="fieldset">
            <div className="fieldset-legend">
              <span className="fieldset-legend-icon">🛒</span>
              Compra simulada
            </div>
            <div className="form-stack">
              <div className="form-field">
                <label className="form-label">Valor da compra</label>
                <span className="form-hint">Impacto pontual no orçamento</span>
                <input className="form-input" type="number" value={form.purchaseValue} onChange={(e) => updateField('purchaseValue', Number(e.target.value))} />
              </div>
              <div className="form-row">
                <div className="form-field">
                  <label className="form-label">Forma de pagamento</label>
                  <select className="form-select" value={form.purchaseMode} onChange={(e) => updateField('purchaseMode', e.target.value)}>
                    <option value="cash">À vista</option>
                    <option value="installment">Parcelado</option>
                  </select>
                </div>
                <div className="form-field">
                  <label className="form-label">Nº parcelas</label>
                  <input className="form-input" type="number" value={form.purchaseInstallmentCount} onChange={(e) => updateField('purchaseInstallmentCount', Number(e.target.value))} />
                </div>
              </div>
              <div className="form-field">
                <label className="form-label">Mês / Ano da compra</label>
                <span className="form-hint">Selecione o mês do impacto</span>
                <select
                  className="form-select"
                  value={form.purchaseStartMonthIndex}
                  onChange={(e) => updateField('purchaseStartMonthIndex', Number(e.target.value))}
                >
                  {simulationMonthOptions.map((opt) => (
                    <option key={opt.index} value={opt.index}>
                      {opt.monthYear} ({opt.label})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Results */}
        <div className="sim-result">
          {/* Result summary cards */}
          <div className="result-cards">
            <div className="result-card">
              <div className="result-card-value" style={{ color: 'hsl(168, 76%, 28%)' }}>{formatCurrency(baseTotal)}</div>
              <div className="result-card-label">Final cenário base</div>
            </div>
            <div className="result-card">
              <div className="result-card-value" style={{ color: 'hsl(38, 92%, 45%)' }}>{formatCurrency(compTotal)}</div>
              <div className="result-card-label">Final cenário comparativo</div>
            </div>
            <div className="result-card">
              <div className="result-card-value" style={{ color: finalDelta >= 0 ? 'hsl(168, 76%, 28%)' : 'hsl(356, 75%, 53%)' }}>
                {finalDelta >= 0 ? '+' : ''}{formatCurrency(finalDelta)}
              </div>
              <div className="result-card-label">Diferença final</div>
            </div>
          </div>

          {/* Filters */}
          <div className="section-panel">
            <div className="section-panel-header">
              <div>
                <div className="section-panel-title">Projeção comparativa</div>
                <div className="section-panel-subtitle">Evolução dos cenários ao longo do tempo</div>
              </div>
            </div>
            <div style={{ padding: '16px 24px 0', display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
              <div className="filter-checks">
                <button
                  className={`filter-check ${includePurchase ? 'filter-check-active' : ''}`}
                  onClick={() => setIncludePurchase((v) => !v)}
                  type="button"
                >
                  <span className="filter-check-box">{includePurchase ? '✓' : ''}</span>
                  Considerar compra
                </button>
                <button
                  className={`filter-check ${includeExtraEntries ? 'filter-check-active' : ''}`}
                  onClick={() => setIncludeExtraEntries((v) => !v)}
                  type="button"
                >
                  <span className="filter-check-box">{includeExtraEntries ? '✓' : ''}</span>
                  Considerar entradas extras
                </button>
              </div>
              <div className="toggle-group">
                <button className={`toggle-item ${metric === 'investment' ? 'toggle-item-active' : ''}`} onClick={() => setMetric('investment')} type="button">Investimento</button>
                <button className={`toggle-item ${metric === 'wealth' ? 'toggle-item-active' : ''}`} onClick={() => setMetric('wealth')} type="button">Patrimônio</button>
              </div>
            </div>
            <div className="section-panel-body">
              <EChart option={chartOption} height={340} />
            </div>
          </div>

          {/* Delta chart */}
          <div className="section-panel">
            <div className="section-panel-header">
              <div>
                <div className="section-panel-title">Gap entre cenários</div>
                <div className="section-panel-subtitle">Quanto o comparativo abre sobre o base</div>
              </div>
            </div>
            <div className="section-panel-body">
              <EChart option={deltaChartOption} height={240} />
            </div>
          </div>
        </div>
      </div>

      {/* Extra entries */}
      <div className="section-panel">
        <div className="section-panel-header">
          <div>
            <div className="section-panel-title">Entradas extras</div>
            <div className="section-panel-subtitle">Receitas pontuais futuras que afetam a simulação</div>
          </div>
          <button className="btn btn-secondary" type="button" onClick={addExtraEntry}>
            + Adicionar entrada
          </button>
        </div>
        <div className="section-panel-body">
          {form.extraEntries.length === 0 && (
            <div className="empty-state">
              <div className="empty-state-icon">📭</div>
              <div className="empty-state-text">Nenhuma entrada extra adicionada</div>
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {form.extraEntries.map((entry: any) => {
              const entryId = entry.id;
              return (
                <div className="extra-entry-card" key={entryId}>
                  <div className="form-field" style={{ minWidth: '160px' }}>
                    <label className="form-label">Mês / Ano</label>
                    <select
                      className="form-select"
                      value={entry.monthIndex}
                      onChange={(e) => updateExtraEntry(entryId, 'monthIndex', Number(e.target.value))}
                    >
                      {simulationMonthOptions.map((opt) => (
                        <option key={opt.index} value={opt.index}>
                          {opt.monthYear} ({opt.label})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-field" style={{ flex: 2 }}>
                    <label className="form-label">Descrição</label>
                    <input
                      className="form-input"
                      value={entry.label}
                      onChange={(e) => updateExtraEntry(entryId, 'label', e.target.value)}
                    />
                  </div>
                  <div className="form-field">
                    <label className="form-label">Valor</label>
                    <input
                      className="form-input"
                      type="number"
                      value={entry.amount}
                      onChange={(e) => updateExtraEntry(entryId, 'amount', Number(e.target.value))}
                    />
                  </div>
                  <div className="form-field">
                    <label className="form-label">Cenário</label>
                    <select
                      className="form-select"
                      value={entry.scenario}
                      onChange={(e) => updateExtraEntry(entryId, 'scenario', e.target.value)}
                    >
                      <option value="both">Ambos</option>
                      <option value="base">Só base</option>
                      <option value="comparison">Só comparativo</option>
                    </select>
                  </div>
                  <button
                    className="btn btn-icon btn-danger"
                    type="button"
                    onClick={() => removeExtraEntry(entryId)}
                    title="Remover"
                  >
                    🗑️
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Projection Table */}
      <div className="section-panel">
        <div className="section-panel-header">
          <div>
            <div className="section-panel-title">Tabela de projeção</div>
            <div className="section-panel-subtitle">
              {tableView === 'annual' ? 'Visão consolidada por Ano (clique para expandir os meses)' : 'Visão detalhada mês a mês'}
            </div>
          </div>
          <div className="toggle-group">
            <button
              className={`toggle-item ${tableView === 'annual' ? 'toggle-item-active' : ''}`}
              onClick={() => setTableView('annual')}
              type="button"
            >
              Visão por Anos
            </button>
            <button
              className={`toggle-item ${tableView === 'monthly' ? 'toggle-item-active' : ''}`}
              onClick={() => setTableView('monthly')}
              type="button"
            >
              Visão Mensal
            </button>
          </div>
        </div>

        <div className="section-panel-body-flush">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>{tableView === 'annual' ? 'Ano' : 'Mês'}</th>
                  <th>Data / Período</th>
                  <th style={{ textAlign: 'right' }}>Parcelas existentes</th>
                  <th style={{ textAlign: 'right' }}>Compra</th>
                  <th style={{ textAlign: 'right' }}>Extras base</th>
                  <th style={{ textAlign: 'right' }}>Extras comp.</th>
                  <th style={{ textAlign: 'right' }}>Base (Final)</th>
                  <th style={{ textAlign: 'right' }}>Comparativo (Final)</th>
                </tr>
              </thead>
              <tbody>
                {/* ANNUAL GROUPED VIEW */}
                {tableView === 'annual' && yearlyGroupedRows.map((yearGroup) => {
                  const isExpanded = expandedYears.has(yearGroup.year);

                  return (
                    <React.Fragment key={yearGroup.year}>
                      {/* Year summary row */}
                      <tr
                        className="table-row-expandable"
                        onClick={() => toggleYearExpand(yearGroup.year)}
                      >
                        <td style={{ fontWeight: 700 }}>
                          {isExpanded ? '▼ ' : '▶ '}Ano {yearGroup.year}
                        </td>
                        <td style={{ color: 'var(--text-muted)' }}>
                          {yearGroup.monthsCount} {yearGroup.monthsCount === 1 ? 'mês' : 'meses'}
                        </td>
                        <td style={{ textAlign: 'right' }}>{formatCurrency(yearGroup.existingInstallmentsTotal)}</td>
                        <td style={{ textAlign: 'right' }}>{formatCurrency(yearGroup.purchaseInstallmentTotal)}</td>
                        <td style={{ textAlign: 'right' }}>{formatCurrency(yearGroup.baseExtraTotal)}</td>
                        <td style={{ textAlign: 'right' }}>{formatCurrency(yearGroup.comparisonExtraTotal)}</td>
                        <td style={{ textAlign: 'right', color: 'hsl(168, 76%, 28%)', fontWeight: 700 }}>
                          {formatCurrency(yearGroup.finalBase)}
                        </td>
                        <td style={{ textAlign: 'right', color: 'hsl(38, 92%, 45%)', fontWeight: 700 }}>
                          {formatCurrency(yearGroup.finalComparison)}
                        </td>
                      </tr>

                      {/* Expanded individual month rows for this year */}
                      {isExpanded && yearGroup.monthRows.map((row: any) => (
                        <tr key={row.monthIndex} className="table-row-child">
                          <td style={{ paddingLeft: '32px', color: 'var(--text-secondary)' }}>
                            Mês {row.monthIndex}
                          </td>
                          <td>{formatDate(row.date)}</td>
                          <td style={{ textAlign: 'right' }}>{formatCurrency(row.existingInstallments)}</td>
                          <td style={{ textAlign: 'right' }}>{formatCurrency(row.purchaseInstallment)}</td>
                          <td style={{ textAlign: 'right' }}>{formatCurrency(row.baseExtra)}</td>
                          <td style={{ textAlign: 'right' }}>{formatCurrency(row.comparisonExtra)}</td>
                          <td style={{ textAlign: 'right', color: 'hsl(168, 76%, 28%)' }}>
                            {formatCurrency(row?.base?.[activeVariant]?.[metric] ?? 0)}
                          </td>
                          <td style={{ textAlign: 'right', color: 'hsl(38, 92%, 45%)' }}>
                            {formatCurrency(row?.comparison?.[activeVariant]?.[metric] ?? 0)}
                          </td>
                        </tr>
                      ))}
                    </React.Fragment>
                  );
                })}

                {/* MONTHLY FLAT VIEW */}
                {tableView === 'monthly' && (result?.rows ?? []).map((row: any) => (
                  <tr key={row.monthIndex}>
                    <td style={{ fontWeight: 600 }}>{row.monthIndex}</td>
                    <td>{formatDate(row.date)}</td>
                    <td style={{ textAlign: 'right' }}>{formatCurrency(row.existingInstallments)}</td>
                    <td style={{ textAlign: 'right' }}>{formatCurrency(row.purchaseInstallment)}</td>
                    <td style={{ textAlign: 'right' }}>{formatCurrency(row.baseExtra)}</td>
                    <td style={{ textAlign: 'right' }}>{formatCurrency(row.comparisonExtra)}</td>
                    <td style={{ textAlign: 'right', color: 'hsl(168, 76%, 28%)', fontWeight: 600 }}>
                      {formatCurrency(row?.base?.[activeVariant]?.[metric] ?? 0)}
                    </td>
                    <td style={{ textAlign: 'right', color: 'hsl(38, 92%, 45%)', fontWeight: 600 }}>
                      {formatCurrency(row?.comparison?.[activeVariant]?.[metric] ?? 0)}
                    </td>
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