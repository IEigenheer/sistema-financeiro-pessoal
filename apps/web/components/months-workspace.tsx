'use client';

import { FormEvent, useEffect, useState } from 'react';
import { formatCurrency, formatDate, formatMonth } from '../lib/format';

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

export function MonthsWorkspace({ initialYear, initialMonth }: { initialYear?: number; initialMonth?: number }) {
  const [year, setYear] = useState<number | null>(initialYear ?? null);
  const [month, setMonth] = useState<number | null>(initialMonth ?? null);
  const [detail, setDetail] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [incomeForm, setIncomeForm] = useState({ description: '', day: '', amount: '', kind: 'OTHER' });
  const [expenseForm, setExpenseForm] = useState({ expenseDate: '', description: '', categoryId: '', amount: '' });
  const [adjustmentForm, setAdjustmentForm] = useState({ investmentContributionOverride: '', investmentReturnAdjustment: '' });

  async function loadBootstrap() {
    const [overviewRes, categoriesRes] = await Promise.all([
      fetch('/api/reports/overview', { cache: 'no-store' }),
      fetch('/api/categories', { cache: 'no-store' }),
    ]);
    const overview = await overviewRes.json();
    const categoriesData = await categoriesRes.json();
    setCategories(categoriesData);
    setYear((current) => current ?? overview.year);
    setMonth((current) => current ?? overview.currentMonth);
    if (categoriesData[0]) {
      setExpenseForm((current) => ({
        ...current,
        categoryId: current.categoryId || categoriesData[0].id,
        expenseDate: current.expenseDate || `${overview.year}-${String(overview.currentMonth).padStart(2, '0')}-01`,
      }));
    }
  }

  async function loadMonth(targetYear: number, targetMonth: number) {
    const response = await fetch(`/api/months/${targetYear}/${targetMonth}`, { cache: 'no-store' });
    const monthDetail = await response.json();
    setDetail(monthDetail);
    setAdjustmentForm({
      investmentContributionOverride: monthDetail.adjustment?.investmentContributionOverride?.toString() ?? '',
      investmentReturnAdjustment: monthDetail.adjustment?.investmentReturnAdjustment?.toString() ?? '',
    });
    setExpenseForm((current) => ({
      ...current,
      expenseDate: `${targetYear}-${String(targetMonth).padStart(2, '0')}-01`,
    }));
  }

  useEffect(() => {
    loadBootstrap().catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!year || !month) {
      return;
    }

    loadMonth(year, month).catch(() => undefined);
  }, [year, month]);

  async function createIncome(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await fetch(`/api/months/${year}/${month}/incomes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...incomeForm,
        day: incomeForm.day ? Number(incomeForm.day) : undefined,
        amount: Number(incomeForm.amount),
      }),
    });
    setIncomeForm({ description: '', day: '', amount: '', kind: 'OTHER' });
    await loadMonth(year!, month!);
  }

  async function createExpense(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await fetch(`/api/months/${year}/${month}/variable-expenses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...expenseForm,
        amount: Number(expenseForm.amount),
      }),
    });
    setExpenseForm((current) => ({ ...current, description: '', amount: '' }));
    await loadMonth(year!, month!);
  }

  async function saveAdjustment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await fetch(`/api/months/${year}/${month}/adjustments`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        investmentContributionOverride: adjustmentForm.investmentContributionOverride
          ? Number(adjustmentForm.investmentContributionOverride)
          : null,
        investmentReturnAdjustment: adjustmentForm.investmentReturnAdjustment
          ? Number(adjustmentForm.investmentReturnAdjustment)
          : null,
      }),
    });
    await loadMonth(year!, month!);
  }

  async function toggleFixedExpense(item: any, paid: boolean) {
    await fetch(`/api/months/${year}/${month}/fixed-expenses/${item.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: paid ? 'PAID' : 'PENDING',
        paidAmount: paid ? Number(item.plannedAmount) : 0,
      }),
    });
    await loadMonth(year!, month!);
  }

  if (!detail || !year || !month) {
    return <div className="panel">Carregando meses...</div>;
  }

  return (
    <div className="stack-xl">
      <section className="hero">
        <div>
          <p className="eyebrow">Meses</p>
          <h2 className="hero-title">Uma única aba operacional para navegar entre as competências.</h2>
          <p className="muted">
            O resumo do mês segue a aba mensal da planilha. O consolidado patrimonial usa o aporte efetivo definido em Contas quando houver ajuste manual.
          </p>
        </div>
        <div className="hero-actions">
          <label>
            Mês selecionado
            <select value={month} onChange={(event) => setMonth(Number(event.target.value))}>
              {MONTH_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <section className="card-grid">
        <article className="panel"><span className="card-label">Entradas</span><strong>{formatCurrency(detail.entriesTotal)}</strong></article>
        <article className="panel"><span className="card-label">Saldo disponível</span><strong>{formatCurrency(detail.availableBalance)}</strong></article>
        <article className="panel"><span className="card-label">Aporte do mês</span><strong>{formatCurrency(detail.investmentContribution)}</strong></article>
        <article className="panel"><span className="card-label">Aporte efetivo em Contas</span><strong>{formatCurrency(detail.effectiveInvestmentContribution)}</strong></article>
      </section>

      <section className="two-columns">
        <article className="panel">
          <h2>{formatMonth(month, year)}</h2>
          <dl className="summary-list">
            <div><dt>Fixas previstas</dt><dd>{formatCurrency(detail.fixedPlannedTotal)}</dd></div>
            <div><dt>Fixas pagas</dt><dd>{formatCurrency(detail.fixedPaidTotal)}</dd></div>
            <div><dt>Variáveis</dt><dd>{formatCurrency(detail.variableTotal)}</dd></div>
            <div><dt>Parcelas</dt><dd>{formatCurrency(detail.installmentTotal)}</dd></div>
            <div><dt>Conta corrente acumulada</dt><dd>{formatCurrency(detail.checkingBalance)}</dd></div>
            <div><dt>Investimentos</dt><dd>{formatCurrency(detail.investmentBalance)}</dd></div>
          </dl>
        </article>
        <article className="panel">
          <h2>Ajustes do consolidado</h2>
          <form onSubmit={saveAdjustment} className="form-grid compact compact-2">
            <label>
              Aporte sobrescrito em Contas
              <input type="number" value={adjustmentForm.investmentContributionOverride} onChange={(event) => setAdjustmentForm({ ...adjustmentForm, investmentContributionOverride: event.target.value })} />
            </label>
            <label>
              Ajuste manual investimento
              <input type="number" value={adjustmentForm.investmentReturnAdjustment} onChange={(event) => setAdjustmentForm({ ...adjustmentForm, investmentReturnAdjustment: event.target.value })} />
            </label>
            <button className="button" type="submit">Salvar ajustes</button>
          </form>
          <p className="muted small-note">
            A aba do mês continua exibindo o aporte operacional da competência. O campo acima altera apenas o consolidado patrimonial da aba Contas.
          </p>
        </article>
      </section>

      <section className="two-columns">
        <article className="panel">
          <h2>Entradas</h2>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Descrição</th><th>Dia</th><th>Valor</th></tr></thead>
              <tbody>
                {detail.incomes.map((item: any, index: number) => (
                  <tr key={item.id ?? `${item.description}-${index}`}>
                    <td>{item.description}</td>
                    <td>{item.day ?? '-'}</td>
                    <td>{formatCurrency(item.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <form onSubmit={createIncome} className="form-grid compact compact-5">
            <label>Descrição<input value={incomeForm.description} onChange={(event) => setIncomeForm({ ...incomeForm, description: event.target.value })} /></label>
            <label>Dia<input type="number" value={incomeForm.day} onChange={(event) => setIncomeForm({ ...incomeForm, day: event.target.value })} /></label>
            <label>Valor<input type="number" value={incomeForm.amount} onChange={(event) => setIncomeForm({ ...incomeForm, amount: event.target.value })} /></label>
            <label>Tipo<select value={incomeForm.kind} onChange={(event) => setIncomeForm({ ...incomeForm, kind: event.target.value })}><option value="FIXED_EXTRA">Fixa extra</option><option value="VARIABLE_EXTRA">Variável extra</option><option value="OTHER">Outra</option></select></label>
            <button className="button" type="submit">Adicionar entrada</button>
          </form>
        </article>
        <article className="panel">
          <h2>Parcelas ativas</h2>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Descrição</th><th>Categoria</th><th>Parcela</th><th>Valor</th><th>Origem</th></tr></thead>
              <tbody>
                {detail.activeInstallments.map((item: any) => (
                  <tr key={item.id}>
                    <td>{item.description}</td>
                    <td>{item.categoryName}</td>
                    <td>{item.installmentNumber}/{item.installmentCount}</td>
                    <td>{formatCurrency(item.installmentAmount)}</td>
                    <td>{item.paymentSource}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
      </section>

      <section className="two-columns">
        <article className="panel">
          <h2>Despesas fixas</h2>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Descrição</th><th>Categoria</th><th>Previsto</th><th>Pago</th><th>Status</th></tr></thead>
              <tbody>
                {detail.fixedExpenses.map((item: any) => (
                  <tr key={item.id}>
                    <td>{item.description}</td>
                    <td>{item.categoryName}</td>
                    <td>{formatCurrency(item.plannedAmount)}</td>
                    <td>{formatCurrency(item.paidAmount)}</td>
                    <td><button className={`chip ${item.status === 'PAID' ? 'chip-paid' : 'chip-pending'}`} onClick={() => toggleFixedExpense(item, item.status !== 'PAID')} type="button">{item.status === 'PAID' ? 'Pago' : 'Pendente'}</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
        <article className="panel">
          <h2>Gastos variáveis</h2>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Data</th><th>Descrição</th><th>Categoria</th><th>Valor</th></tr></thead>
              <tbody>
                {detail.variableExpenses.map((item: any) => (
                  <tr key={item.id}>
                    <td>{formatDate(item.expenseDate)}</td>
                    <td>{item.description}</td>
                    <td>{item.categoryName}</td>
                    <td>{formatCurrency(item.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <form onSubmit={createExpense} className="form-grid compact compact-5">
            <label>Data<input type="date" value={expenseForm.expenseDate} onChange={(event) => setExpenseForm({ ...expenseForm, expenseDate: event.target.value })} /></label>
            <label>Descrição<input value={expenseForm.description} onChange={(event) => setExpenseForm({ ...expenseForm, description: event.target.value })} /></label>
            <label>Categoria<select value={expenseForm.categoryId} onChange={(event) => setExpenseForm({ ...expenseForm, categoryId: event.target.value })}>{categories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
            <label>Valor<input type="number" value={expenseForm.amount} onChange={(event) => setExpenseForm({ ...expenseForm, amount: event.target.value })} /></label>
            <button className="button" type="submit">Lançar gasto</button>
          </form>
        </article>
      </section>
    </div>
  );
}