'use client';

import { useEffect, useMemo, useState } from 'react';
import { EChart } from './echart';
import { PageHeader } from './page-header';
import { formatCurrency, formatDate } from '../lib/format';

function extractSeries(rows: any[], scenario: 'base' | 'comparison', variant: 'baseline' | 'purchase' | 'extras' | 'full', metric: 'wealth' | 'investment') {
  return rows.map((row) => row[scenario][variant][metric]);
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
      .then(setResult)
      .catch(() => undefined);
  }, [form, metric]);

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
        data: rows.map((row: any) => roundNumber(row.comparison[activeVariant][metric] - row.base[activeVariant][metric])),
        itemStyle: {
          color: (params: any) => params.value >= 0 ? 'hsl(168, 76%, 28%)' : 'hsl(356, 75%, 53%)',
        },
        barMaxWidth: 40,
      }],
      animationDuration: 600,
    };
  }, [activeVariant, metric, result]);

  // Compute result summary
  const lastRow = result?.rows?.length > 0 ? result.rows[result.rows.length - 1] : null;
  const finalDelta = lastRow ? roundNumber(lastRow.comparison[activeVariant][metric] - lastRow.base[activeVariant][metric]) : 0;
  const baseTotal = lastRow ? lastRow.base[activeVariant][metric] : 0;
  const compTotal = lastRow ? lastRow.comparison[activeVariant][metric] : 0;

  if (!form || !overview || !result) {
    return (
      <div className="content-stack">
        <div className="skeleton skeleton-card" style={{ height: 300 }} />
      </div>
    );
  }

  function updateField(field: string, value: any) {
    setForm({ ...form, [field]: value });
  }

  function updateExtraEntry(index: number, field: string, value: unknown) {
    const next = [...form.extraEntries];
    next[index] = { ...next[index], [field]: value };
    setForm({ ...form, extraEntries: next });
  }

  function removeExtraEntry(index: number) {
    setForm({
      ...form,
      extraEntries: form.extraEntries.filter((_: unknown, i: number) => i !== index),
    });
  }

  function addExtraEntry() {
    setForm({
      ...form,
      extraEntries: [
        ...form.extraEntries,
        { monthIndex: 1, label: 'Nova entrada', amount: 0, scenario: 'both' },
      ],
    });
  }

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
              <div className="form-row">
                <div className="form-field">
                  <label className="form-label">Rendimento mensal</label>
                  <span className="form-hint">Taxa projetada ao mês</span>
                  <input className="form-input" type="number" step="0.001" value={form.monthlyReturnRate} onChange={(e) => updateField('monthlyReturnRate', Number(e.target.value))} />
                </div>
                <div className="form-field">
                  <label className="form-label">Meses simulados</label>
                  <span className="form-hint">Horizonte da simulação</span>
                  <input className="form-input" type="number" value={form.monthsToSimulate} onChange={(e) => updateField('monthsToSimulate', Number(e.target.value))} />
                </div>
              </div>
              <div className="form-field">
                <label className="form-label">Mês de partida</label>
                <select className="form-select" value={form.startMonth} onChange={(e) => updateField('startMonth', Number(e.target.value))}>
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>{i + 1}</option>
                  ))}
                </select>
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
                <label className="form-label">Mês de início da compra</label>
                <span className="form-hint">Índice do mês na simulação</span>
                <input className="form-input" type="number" value={form.purchaseStartMonthIndex} onChange={(e) => updateField('purchaseStartMonthIndex', Number(e.target.value))} />
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
            {form.extraEntries.map((entry: any, index: number) => (
              <div className="extra-entry-card" key={`${entry.label}-${index}`}>
                <div className="form-field">
                  <label className="form-label">Mês</label>
                  <input className="form-input" type="number" value={entry.monthIndex} onChange={(e) => updateExtraEntry(index, 'monthIndex', Number(e.target.value))} />
                </div>
                <div className="form-field" style={{ flex: 2 }}>
                  <label className="form-label">Descrição</label>
                  <input className="form-input" value={entry.label} onChange={(e) => updateExtraEntry(index, 'label', e.target.value)} />
                </div>
                <div className="form-field">
                  <label className="form-label">Valor</label>
                  <input className="form-input" type="number" value={entry.amount} onChange={(e) => updateExtraEntry(index, 'amount', Number(e.target.value))} />
                </div>
                <div className="form-field">
                  <label className="form-label">Cenário</label>
                  <select className="form-select" value={entry.scenario} onChange={(e) => updateExtraEntry(index, 'scenario', e.target.value)}>
                    <option value="both">Ambos</option>
                    <option value="base">Só base</option>
                    <option value="comparison">Só comparativo</option>
                  </select>
                </div>
                <button className="btn btn-icon btn-danger" type="button" onClick={() => removeExtraEntry(index)} title="Remover">
                  🗑️
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Data table */}
      <div className="section-panel">
        <div className="section-panel-header">
          <div>
            <div className="section-panel-title">Tabela de projeção</div>
            <div className="section-panel-subtitle">Dados detalhados mês a mês</div>
          </div>
        </div>
        <div className="section-panel-body-flush">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Mês</th>
                  <th>Data</th>
                  <th style={{ textAlign: 'right' }}>Parcelas existentes</th>
                  <th style={{ textAlign: 'right' }}>Compra</th>
                  <th style={{ textAlign: 'right' }}>Extras base</th>
                  <th style={{ textAlign: 'right' }}>Extras comp.</th>
                  <th style={{ textAlign: 'right' }}>Base</th>
                  <th style={{ textAlign: 'right' }}>Comparativo</th>
                </tr>
              </thead>
              <tbody>
                {result.rows.map((row: any) => (
                  <tr key={row.monthIndex}>
                    <td style={{ fontWeight: 600 }}>{row.monthIndex}</td>
                    <td>{formatDate(row.date)}</td>
                    <td style={{ textAlign: 'right' }}>{formatCurrency(row.existingInstallments)}</td>
                    <td style={{ textAlign: 'right' }}>{formatCurrency(row.purchaseInstallment)}</td>
                    <td style={{ textAlign: 'right' }}>{formatCurrency(row.baseExtra)}</td>
                    <td style={{ textAlign: 'right' }}>{formatCurrency(row.comparisonExtra)}</td>
                    <td style={{ textAlign: 'right', color: 'hsl(168, 76%, 28%)', fontWeight: 600 }}>
                      {formatCurrency(row.base[activeVariant][metric])}
                    </td>
                    <td style={{ textAlign: 'right', color: 'hsl(38, 92%, 45%)', fontWeight: 600 }}>
                      {formatCurrency(row.comparison[activeVariant][metric])}
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