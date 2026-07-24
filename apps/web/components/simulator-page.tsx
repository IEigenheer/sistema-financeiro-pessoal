'use client';

import { useEffect, useMemo, useState } from 'react';
import { EChart } from './echart';
import { formatCurrency, formatDate } from '../lib/format';

function extractSeries(rows: any[], scenario: 'base' | 'comparison', variant: 'baseline' | 'purchase' | 'extras' | 'full', metric: 'wealth' | 'investment') {
  return rows.map((row) => row[scenario][variant][metric]);
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
    if (!form) {
      return;
    }

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
      tooltip: { trigger: 'axis' },
      legend: { top: 0 },
      grid: { left: 24, right: 24, top: 56, bottom: 24, containLabel: true },
      xAxis: {
        type: 'category',
        data: rows.map((row: any) => `${row.monthIndex}`),
      },
      yAxis: {
        type: 'value',
        axisLabel: { formatter: (value: number) => `R$ ${Math.round(value).toLocaleString('pt-BR')}` },
      },
      series: [
        {
          name: 'Cenário base',
          type: 'line',
          smooth: true,
          data: extractSeries(rows, 'base', activeVariant, metric),
          lineStyle: { width: 4, color: '#0f766e' },
          itemStyle: { color: '#0f766e' },
        },
        {
          name: 'Cenário comparativo',
          type: 'line',
          smooth: true,
          data: extractSeries(rows, 'comparison', activeVariant, metric),
          lineStyle: { width: 4, color: '#f59e0b' },
          itemStyle: { color: '#f59e0b' },
        },
      ],
    };
  }, [activeVariant, metric, result]);

  const deltaChartOption = useMemo(() => {
    const rows = result?.rows ?? [];
    return {
      tooltip: { trigger: 'axis' },
      grid: { left: 24, right: 24, top: 24, bottom: 24, containLabel: true },
      xAxis: { type: 'category', data: rows.map((row: any) => `${row.monthIndex}`) },
      yAxis: {
        type: 'value',
        axisLabel: { formatter: (value: number) => `R$ ${Math.round(value).toLocaleString('pt-BR')}` },
      },
      series: [
        {
          name: 'Diferença comparativo - base',
          type: 'bar',
          data: rows.map((row: any) => roundNumber(row.comparison[activeVariant][metric] - row.base[activeVariant][metric])),
          itemStyle: { color: '#b45309' },
        },
      ],
    };
  }, [activeVariant, metric, result]);

  if (!form || !overview || !result) {
    return <div className="panel">Carregando simulador...</div>;
  }

  return (
    <div className="stack-xl">
      <section className="hero">
        <div>
          <p className="eyebrow">Simulador</p>
          <h2 className="hero-title">Cenário base versus cenário comparativo, com compra e entradas extras controladas por filtros dinâmicos.</h2>
          <p className="muted">
            O cenário base representa o aporte mensal principal. O comparativo representa a alternativa que você quer testar.
          </p>
        </div>
        <div className="hero-actions">
          <div className="toggle-row">
            <button className={`chip ${metric === 'investment' ? 'chip-paid' : 'chip-pending'}`} onClick={() => setMetric('investment')} type="button">Somente investimento</button>
            <button className={`chip ${metric === 'wealth' ? 'chip-paid' : 'chip-pending'}`} onClick={() => setMetric('wealth')} type="button">Patrimônio total</button>
          </div>
        </div>
      </section>

      <section className="panel">
        <div className="form-grid">
          <label>Mês de partida<select value={form.startMonth} onChange={(event) => setForm({ ...form, startMonth: Number(event.target.value) })}>{Array.from({ length: 12 }, (_, index) => <option key={index + 1} value={index + 1}>{index + 1}</option>)}</select></label>
          <label>Salário mensal<input type="number" value={form.salaryMonthly} onChange={(event) => setForm({ ...form, salaryMonthly: Number(event.target.value) })} /></label>
          <label>Gastos fixos<input type="number" value={form.fixedMonthlyExpense} onChange={(event) => setForm({ ...form, fixedMonthlyExpense: Number(event.target.value) })} /></label>
          <label>Gastos variáveis<input type="number" value={form.variableMonthlyExpense} onChange={(event) => setForm({ ...form, variableMonthlyExpense: Number(event.target.value) })} /></label>
          <label>Aporte cenário base<input type="number" value={form.baseMonthlyInvestment} onChange={(event) => setForm({ ...form, baseMonthlyInvestment: Number(event.target.value) })} /></label>
          <label>Aporte cenário comparativo<input type="number" value={form.comparisonMonthlyInvestment} onChange={(event) => setForm({ ...form, comparisonMonthlyInvestment: Number(event.target.value) })} /></label>
          <label>Rendimento mensal<input type="number" step="0.001" value={form.monthlyReturnRate} onChange={(event) => setForm({ ...form, monthlyReturnRate: Number(event.target.value) })} /></label>
          <label>Meses simulados<input type="number" value={form.monthsToSimulate} onChange={(event) => setForm({ ...form, monthsToSimulate: Number(event.target.value) })} /></label>
          <label>Valor da compra<input type="number" value={form.purchaseValue} onChange={(event) => setForm({ ...form, purchaseValue: Number(event.target.value) })} /></label>
          <label>Forma de pagamento<select value={form.purchaseMode} onChange={(event) => setForm({ ...form, purchaseMode: event.target.value })}><option value="cash">À vista</option><option value="installment">Parcelado</option></select></label>
          <label>Nº parcelas<input type="number" value={form.purchaseInstallmentCount} onChange={(event) => setForm({ ...form, purchaseInstallmentCount: Number(event.target.value) })} /></label>
          <label>Mês de início da compra<input type="number" value={form.purchaseStartMonthIndex} onChange={(event) => setForm({ ...form, purchaseStartMonthIndex: Number(event.target.value) })} /></label>
        </div>
      </section>

      <section className="panel">
        <div className="section-head">
          <div>
            <p className="eyebrow">Filtros do gráfico</p>
            <h2>Marque o que o cenário deve considerar</h2>
          </div>
          <div className="toggle-row">
            <button className={`chip ${includePurchase ? 'chip-paid' : 'chip-pending'}`} onClick={() => setIncludePurchase((value) => !value)} type="button">Considerar compra</button>
            <button className={`chip ${includeExtraEntries ? 'chip-paid' : 'chip-pending'}`} onClick={() => setIncludeExtraEntries((value) => !value)} type="button">Considerar entradas extras</button>
          </div>
        </div>
        <EChart option={chartOption} height={380} />
      </section>

      <section className="panel">
        <div className="section-head">
          <div>
            <p className="eyebrow">Gap entre cenários</p>
            <h2>Quanto o comparativo abre sobre o base</h2>
          </div>
        </div>
        <EChart option={deltaChartOption} height={280} />
      </section>

      <section className="panel">
        <div className="section-head">
          <div>
            <p className="eyebrow">Entradas extras</p>
            <h2>Receitas pontuais futuras</h2>
          </div>
          <button
            className="button button-secondary"
            type="button"
            onClick={() => setForm({
              ...form,
              extraEntries: [
                ...form.extraEntries,
                { monthIndex: 1, label: 'Nova entrada', amount: 0, scenario: 'both' },
              ],
            })}
          >
            Adicionar entrada
          </button>
        </div>
        <div className="stack-md">
          {form.extraEntries.map((entry: any, index: number) => (
            <div className="form-grid compact compact-4" key={`${entry.label}-${index}`}>
              <label>Mês<input type="number" value={entry.monthIndex} onChange={(event) => updateExtraEntry(index, 'monthIndex', Number(event.target.value))} /></label>
              <label>Descrição<input value={entry.label} onChange={(event) => updateExtraEntry(index, 'label', event.target.value)} /></label>
              <label>Valor<input type="number" value={entry.amount} onChange={(event) => updateExtraEntry(index, 'amount', Number(event.target.value))} /></label>
              <label>Cenário<select value={entry.scenario} onChange={(event) => updateExtraEntry(index, 'scenario', event.target.value)}><option value="both">Base e comparativo</option><option value="base">Só base</option><option value="comparison">Só comparativo</option></select></label>
              <button className="button button-secondary" type="button" onClick={() => removeExtraEntry(index)}>Remover</button>
            </div>
          ))}
        </div>
      </section>

      <section className="panel">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Mês</th>
                <th>Data</th>
                <th>Parcelas já existentes</th>
                <th>Compra</th>
                <th>Entradas extras base</th>
                <th>Entradas extras comp.</th>
                <th>Base</th>
                <th>Comparativo</th>
              </tr>
            </thead>
            <tbody>
              {result.rows.map((row: any) => (
                <tr key={row.monthIndex}>
                  <td>{row.monthIndex}</td>
                  <td>{formatDate(row.date)}</td>
                  <td>{formatCurrency(row.existingInstallments)}</td>
                  <td>{formatCurrency(row.purchaseInstallment)}</td>
                  <td>{formatCurrency(row.baseExtra)}</td>
                  <td>{formatCurrency(row.comparisonExtra)}</td>
                  <td>{formatCurrency(row.base[activeVariant][metric])}</td>
                  <td>{formatCurrency(row.comparison[activeVariant][metric])}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );

  function updateExtraEntry(index: number, field: string, value: unknown) {
    const next = [...form.extraEntries];
    next[index] = { ...next[index], [field]: value };
    setForm({ ...form, extraEntries: next });
  }

  function removeExtraEntry(index: number) {
    setForm({
      ...form,
      extraEntries: form.extraEntries.filter((_: unknown, currentIndex: number) => currentIndex !== index),
    });
  }
}

function roundNumber(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}