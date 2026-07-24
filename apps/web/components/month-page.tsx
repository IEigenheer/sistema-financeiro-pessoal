'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useState } from 'react';
import { formatCurrency, formatDate, formatMonth } from '../lib/format';

type Props = {
  year: number;
  month: number;
};

export function MonthPage({ year, month }: Props) {
  const [detail, setDetail] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [incomeForm, setIncomeForm] = useState({
    description: '',
    day: '',
    amount: '',
    kind: 'OTHER',
  });
  const [expenseForm, setExpenseForm] = useState({
    expenseDate: `${year}-${String(month).padStart(2, '0')}-01`,
    description: '',
    categoryId: '',
    amount: '',
  });
  const [adjustmentForm, setAdjustmentForm] = useState({
    investmentContributionOverride: '',
    investmentReturnAdjustment: '',
  });

  async function load() {
    const [detailRes, categoriesRes] = await Promise.all([
      fetch(`/api/months/${year}/${month}`, { cache: 'no-store' }),
      fetch('/api/categories'),
    ]);
    const monthDetail = await detailRes.json();
    const categoriesData = await categoriesRes.json();
    setDetail(monthDetail);
    setCategories(categoriesData);
    setAdjustmentForm({
      investmentContributionOverride:
        monthDetail.adjustment?.investmentContributionOverride?.toString() ?? '',
      investmentReturnAdjustment:
        monthDetail.adjustment?.investmentReturnAdjustment?.toString() ?? '',
    });
    if (!expenseForm.categoryId && categoriesData[0]) {
      setExpenseForm((current) => ({ ...current, categoryId: categoriesData[0].id }));
    }
  }

  useEffect(() => {
    load().catch(() => undefined);
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
    await load();
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
    await load();
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
    await load();
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
    await load();
  }

  if (!detail) {
    return <div className="panel">Carregando mês...</div>;
  }

  return (
    <div className="stack-xl">
      <section className="hero">
        <div>
          <p className="eyebrow">Competência</p>
          <h1>{formatMonth(month, year)}</h1>
          <p className="muted">
            Visão mensal com entradas, despesas fixas, gastos variáveis, parcelas e
            reflexo patrimonial.
          </p>
        </div>
        <div className="hero-actions">
          <Link href="/" className="button button-secondary">
            Voltar ao painel
          </Link>
        </div>
      </section>

      <section className="card-grid">
        <article className="panel">
          <span className="card-label">Entradas</span>
          <strong>{formatCurrency(detail.entriesTotal)}</strong>
        </article>
        <article className="panel">
          <span className="card-label">Fixas pagas</span>
          <strong>{formatCurrency(detail.fixedPaidTotal)}</strong>
        </article>
        <article className="panel">
          <span className="card-label">Variáveis</span>
          <strong>{formatCurrency(detail.variableTotal)}</strong>
        </article>
        <article className="panel">
          <span className="card-label">Saldo disponível</span>
          <strong>{formatCurrency(detail.availableBalance)}</strong>
        </article>
      </section>

      <section className="two-columns">
        <article className="panel">
          <h2>Entradas</h2>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Descrição</th>
                  <th>Dia</th>
                  <th>Valor</th>
                </tr>
              </thead>
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
          <form onSubmit={createIncome} className="form-grid compact">
            <label>
              Descrição
              <input
                value={incomeForm.description}
                onChange={(event) =>
                  setIncomeForm({ ...incomeForm, description: event.target.value })
                }
              />
            </label>
            <label>
              Dia
              <input
                type="number"
                value={incomeForm.day}
                onChange={(event) => setIncomeForm({ ...incomeForm, day: event.target.value })}
              />
            </label>
            <label>
              Valor
              <input
                type="number"
                value={incomeForm.amount}
                onChange={(event) =>
                  setIncomeForm({ ...incomeForm, amount: event.target.value })
                }
              />
            </label>
            <label>
              Tipo
              <select
                value={incomeForm.kind}
                onChange={(event) => setIncomeForm({ ...incomeForm, kind: event.target.value })}
              >
                <option value="FIXED_EXTRA">Fixa extra</option>
                <option value="VARIABLE_EXTRA">Variável extra</option>
                <option value="OTHER">Outra</option>
              </select>
            </label>
            <button className="button" type="submit">
              Adicionar entrada
            </button>
          </form>
        </article>

        <article className="panel">
          <h2>Ajustes do mês</h2>
          <form onSubmit={saveAdjustment} className="form-grid compact">
            <label>
              Aporte sobrescrito
              <input
                type="number"
                value={adjustmentForm.investmentContributionOverride}
                onChange={(event) =>
                  setAdjustmentForm({
                    ...adjustmentForm,
                    investmentContributionOverride: event.target.value,
                  })
                }
              />
            </label>
            <label>
              Ajuste manual investimento
              <input
                type="number"
                value={adjustmentForm.investmentReturnAdjustment}
                onChange={(event) =>
                  setAdjustmentForm({
                    ...adjustmentForm,
                    investmentReturnAdjustment: event.target.value,
                  })
                }
              />
            </label>
            <button className="button" type="submit">
              Salvar ajustes
            </button>
          </form>
          <dl className="summary-list">
            <div><dt>Conta corrente acumulada</dt><dd>{formatCurrency(detail.checkingBalance)}</dd></div>
            <div><dt>Investimentos</dt><dd>{formatCurrency(detail.investmentBalance)}</dd></div>
            <div><dt>Patrimônio total</dt><dd>{formatCurrency(detail.netWorth)}</dd></div>
          </dl>
        </article>
      </section>

      <section className="two-columns">
        <article className="panel">
          <h2>Despesas fixas</h2>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Descrição</th>
                  <th>Categoria</th>
                  <th>Previsto</th>
                  <th>Pago</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {detail.fixedExpenses.map((item: any) => (
                  <tr key={item.id}>
                    <td>{item.description}</td>
                    <td>{item.categoryName}</td>
                    <td>{formatCurrency(item.plannedAmount)}</td>
                    <td>{formatCurrency(item.paidAmount)}</td>
                    <td>
                      <button
                        className={`chip ${item.status === 'PAID' ? 'chip-paid' : 'chip-pending'}`}
                        onClick={() => toggleFixedExpense(item, item.status !== 'PAID')}
                        type="button"
                      >
                        {item.status === 'PAID' ? 'Pago' : 'Pendente'}
                      </button>
                    </td>
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
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Descrição</th>
                  <th>Categoria</th>
                  <th>Valor</th>
                </tr>
              </thead>
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
          <form onSubmit={createExpense} className="form-grid compact">
            <label>
              Data
              <input
                type="date"
                value={expenseForm.expenseDate}
                onChange={(event) =>
                  setExpenseForm({ ...expenseForm, expenseDate: event.target.value })
                }
              />
            </label>
            <label>
              Descrição
              <input
                value={expenseForm.description}
                onChange={(event) =>
                  setExpenseForm({ ...expenseForm, description: event.target.value })
                }
              />
            </label>
            <label>
              Categoria
              <select
                value={expenseForm.categoryId}
                onChange={(event) =>
                  setExpenseForm({ ...expenseForm, categoryId: event.target.value })
                }
              >
                {categories.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Valor
              <input
                type="number"
                value={expenseForm.amount}
                onChange={(event) =>
                  setExpenseForm({ ...expenseForm, amount: event.target.value })
                }
              />
            </label>
            <button className="button" type="submit">
              Lançar gasto
            </button>
          </form>
        </article>
      </section>

      <section className="panel">
        <h2>Parcelas ativas</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Descrição</th>
                <th>Categoria</th>
                <th>Parcela</th>
                <th>Valor</th>
                <th>Origem</th>
              </tr>
            </thead>
            <tbody>
              {detail.activeInstallments.map((item: any) => (
                <tr key={item.id}>
                  <td>{item.description}</td>
                  <td>{item.categoryName}</td>
                  <td>
                    {item.installmentNumber}/{item.installmentCount}
                  </td>
                  <td>{formatCurrency(item.installmentAmount)}</td>
                  <td>{item.paymentSource}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
