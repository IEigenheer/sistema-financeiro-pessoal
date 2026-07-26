'use client';

import { FormEvent, useEffect, useState } from 'react';
import { formatCurrency, formatDate, formatMonth } from '../lib/format';
import { PageHeader } from './page-header';
import { StatCard } from './stat-card';
import { Modal } from './modal';
import { Tabs } from './tabs';

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

const TABS = [
  { key: 'resumo', label: 'Resumo' },
  { key: 'entradas', label: 'Entradas' },
  { key: 'fixas', label: 'Despesas Fixas' },
  { key: 'variaveis', label: 'Saídas Variáveis' },
  { key: 'parcelas', label: 'Parcelas' },
];

export function MonthsWorkspace({ initialYear, initialMonth }: { initialYear?: number; initialMonth?: number }) {
  const [year, setYear] = useState<number | null>(initialYear ?? null);
  const [month, setMonth] = useState<number | null>(initialMonth ?? null);
  const [detail, setDetail] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('resumo');

  // Modal states
  const [incomeModalOpen, setIncomeModalOpen] = useState(false);
  const [expenseModalOpen, setExpenseModalOpen] = useState(false);

  // Form states
  const [incomeForm, setIncomeForm] = useState({ description: '', day: '', amount: '', kind: 'OTHER' });
  const [expenseForm, setExpenseForm] = useState({ expenseDate: '', description: '', categoryId: '', amount: '' });

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
    setExpenseForm((current) => ({
      ...current,
      expenseDate: `${targetYear}-${String(targetMonth).padStart(2, '0')}-01`,
    }));
  }

  useEffect(() => {
    loadBootstrap().catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!year || !month) return;
    loadMonth(year, month).catch(() => undefined);
  }, [year, month]);

  function navigateMonth(direction: -1 | 1) {
    if (!month || !year) return;
    let newMonth = month + direction;
    let newYear = year;
    if (newMonth < 1) { newMonth = 12; newYear--; }
    if (newMonth > 12) { newMonth = 1; newYear++; }
    setMonth(newMonth);
    setYear(newYear);
  }

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
    setIncomeModalOpen(false);
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
    setExpenseModalOpen(false);
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

  async function handleAporteSave(value: number) {
    await fetch(`/api/months/${year}/${month}/adjustments`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        investmentContributionOverride: value,
      }),
    });
    await loadMonth(year!, month!);
  }

  if (!detail || !year || !month) {
    return (
      <div className="content-stack">
        <div className="stat-cards">
          {[1, 2, 3].map((i) => <div key={i} className="skeleton skeleton-card" />)}
        </div>
      </div>
    );
  }

  const incomesTotal = detail.incomes.reduce((sum: number, item: any) => sum + Number(item.amount), 0);
  const fixedPlannedSum = detail.fixedExpenses.reduce((sum: number, item: any) => sum + Number(item.plannedAmount), 0);
  const fixedPaidSum = detail.fixedExpenses.reduce((sum: number, item: any) => sum + Number(item.paidAmount), 0);
  const variablesTotal = detail.variableExpenses.reduce((sum: number, item: any) => sum + Number(item.amount), 0);
  const installmentsTotal = detail.activeInstallments.reduce((sum: number, item: any) => sum + Number(item.installmentAmount), 0);

  return (
    <div className="content-stack">
      {/* Header with month navigation */}
      <PageHeader
        title={formatMonth(month, year)}
        subtitle="Visão mensal com entradas, despesas, parcelas e reflexo patrimonial"
        actions={
          <>
            <div className="month-nav">
              <button className="month-nav-btn" onClick={() => navigateMonth(-1)} type="button" title="Mês anterior">◀</button>
              <select
                className="month-nav-select"
                value={month}
                onChange={(e) => setMonth(Number(e.target.value))}
              >
                {MONTH_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <button className="month-nav-btn" onClick={() => navigateMonth(1)} type="button" title="Próximo mês">▶</button>
            </div>
            <button className="btn btn-primary" onClick={() => setIncomeModalOpen(true)} type="button">+ Entrada</button>
            <button className="btn btn-secondary" onClick={() => setExpenseModalOpen(true)} type="button">+ Gasto</button>
          </>
        }
      />

      {/* Stat Cards */}
      <div className="stat-cards">
        <StatCard
          icon="💵"
          label="Entradas"
          value={detail.entriesTotal}
          formula="Soma de salário + entradas extras do mês"
          color="emerald"
        />
        <StatCard
          icon="💰"
          label="Saldo disponível"
          value={detail.availableBalance}
          formula="Entradas − despesas fixas − saídas variáveis − parcelas − aporte"
          color="sky"
        />
        <StatCard
          icon="📈"
          label="Aporte do mês"
          value={detail.effectiveInvestmentContribution}
          formula="Clique no valor para editar o aporte deste mês"
          color="amber"
          editable
          onSave={handleAporteSave}
        />
      </div>

      {/* Tabs */}
      <div className="section-panel">
        <Tabs tabs={TABS} active={activeTab} onChange={setActiveTab} />

        {activeTab === 'resumo' && (
          <div className="section-panel-body">
            <div style={{ maxWidth: '600px' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '16px' }}>
                Resumo do mês
              </h3>
              <dl className="summary-list">
                <div className="summary-list-item">
                  <dt className="summary-list-label">Entradas</dt>
                  <dd className="summary-list-value" style={{ color: 'var(--emerald-600)' }}>{formatCurrency(detail.entriesTotal)}</dd>
                </div>
                <div className="summary-list-item">
                  <dt className="summary-list-label">Fixas previstas</dt>
                  <dd className="summary-list-value">{formatCurrency(detail.fixedPlannedTotal)}</dd>
                </div>
                <div className="summary-list-item">
                  <dt className="summary-list-label">Fixas pagas</dt>
                  <dd className="summary-list-value">{formatCurrency(detail.fixedPaidTotal)}</dd>
                </div>
                <div className="summary-list-item">
                  <dt className="summary-list-label">Saídas variáveis</dt>
                  <dd className="summary-list-value">{formatCurrency(detail.variableTotal)}</dd>
                </div>
                <div className="summary-list-item">
                  <dt className="summary-list-label">Parcelas</dt>
                  <dd className="summary-list-value">{formatCurrency(detail.installmentTotal)}</dd>
                </div>
                <div className="summary-list-item">
                  <dt className="summary-list-label">Aporte do mês</dt>
                  <dd className="summary-list-value" style={{ color: 'var(--amber-600)' }}>{formatCurrency(detail.effectiveInvestmentContribution)}</dd>
                </div>
                <div className="summary-list-item">
                  <dt className="summary-list-label">Saldo disponível</dt>
                  <dd className="summary-list-value" style={{ fontWeight: 700 }}>{formatCurrency(detail.availableBalance)}</dd>
                </div>
                <div className="summary-list-item">
                  <dt className="summary-list-label">Conta corrente acumulada</dt>
                  <dd className="summary-list-value">{formatCurrency(detail.checkingBalance)}</dd>
                </div>
                <div className="summary-list-item">
                  <dt className="summary-list-label">Investimentos acumulados</dt>
                  <dd className="summary-list-value">{formatCurrency(detail.investmentBalance)}</dd>
                </div>
              </dl>
            </div>
          </div>
        )}

        {activeTab === 'entradas' && (
          <div className="section-panel-body-flush">
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Descrição</th>
                    <th>Dia</th>
                    <th>Tipo</th>
                    <th style={{ textAlign: 'right' }}>Valor</th>
                  </tr>
                </thead>
                <tbody>
                  {detail.incomes.length === 0 && (
                    <tr>
                      <td colSpan={4}>
                        <div className="empty-state">
                          <div className="empty-state-icon">📭</div>
                          <div className="empty-state-text">Nenhuma entrada registrada neste mês</div>
                        </div>
                      </td>
                    </tr>
                  )}
                  {detail.incomes.map((item: any, index: number) => (
                    <tr key={item.id ?? `${item.description}-${index}`}>
                      <td>{item.description}</td>
                      <td>{item.day ?? '—'}</td>
                      <td>
                        <span className="badge badge-success">
                          {item.kind === 'FIXED_EXTRA' ? 'Fixa extra' : item.kind === 'VARIABLE_EXTRA' ? 'Variável extra' : 'Outra'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatCurrency(item.amount)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr style={{ fontWeight: 700, borderTop: '2px solid var(--border)', background: 'var(--bg-subtle)' }}>
                    <td colSpan={3}>Total</td>
                    <td style={{ textAlign: 'right' }}>{formatCurrency(incomesTotal)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'fixas' && (
          <div className="section-panel-body-flush">
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Descrição</th>
                    <th>Categoria</th>
                    <th style={{ textAlign: 'right' }}>Previsto</th>
                    <th style={{ textAlign: 'right' }}>Pago</th>
                    <th style={{ textAlign: 'center' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {detail.fixedExpenses.map((item: any) => (
                    <tr key={item.id}>
                      <td>{item.description}</td>
                      <td>{item.categoryName}</td>
                      <td style={{ textAlign: 'right' }}>{formatCurrency(item.plannedAmount)}</td>
                      <td style={{ textAlign: 'right' }}>{formatCurrency(item.paidAmount)}</td>
                      <td style={{ textAlign: 'center' }}>
                        <button
                          className={`badge ${item.status === 'PAID' ? 'badge-success' : 'badge-warning'}`}
                          onClick={() => toggleFixedExpense(item, item.status !== 'PAID')}
                          type="button"
                        >
                          {item.status === 'PAID' ? '✓ Pago' : '⏳ Pendente'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr style={{ fontWeight: 700, borderTop: '2px solid var(--border)', background: 'var(--bg-subtle)' }}>
                    <td colSpan={2}>Total</td>
                    <td style={{ textAlign: 'right' }}>{formatCurrency(fixedPlannedSum)}</td>
                    <td style={{ textAlign: 'right' }}>{formatCurrency(fixedPaidSum)}</td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'variaveis' && (
          <div className="section-panel-body-flush">
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Descrição</th>
                    <th>Categoria</th>
                    <th style={{ textAlign: 'right' }}>Valor</th>
                  </tr>
                </thead>
                <tbody>
                  {detail.variableExpenses.length === 0 && (
                    <tr>
                      <td colSpan={4}>
                        <div className="empty-state">
                          <div className="empty-state-icon">🧾</div>
                          <div className="empty-state-text">Nenhum gasto variável registrado</div>
                        </div>
                      </td>
                    </tr>
                  )}
                  {detail.variableExpenses.map((item: any) => (
                    <tr key={item.id}>
                      <td>{formatDate(item.expenseDate)}</td>
                      <td>{item.description}</td>
                      <td>{item.categoryName}</td>
                      <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatCurrency(item.amount)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr style={{ fontWeight: 700, borderTop: '2px solid var(--border)', background: 'var(--bg-subtle)' }}>
                    <td colSpan={3}>Total</td>
                    <td style={{ textAlign: 'right' }}>{formatCurrency(variablesTotal)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'parcelas' && (
          <div className="section-panel-body-flush">
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Descrição</th>
                    <th>Categoria</th>
                    <th>Parcela</th>
                    <th>Origem</th>
                    <th style={{ textAlign: 'right' }}>Valor</th>
                  </tr>
                </thead>
                <tbody>
                  {detail.activeInstallments.length === 0 && (
                    <tr>
                      <td colSpan={5}>
                        <div className="empty-state">
                          <div className="empty-state-icon">📋</div>
                          <div className="empty-state-text">Nenhuma parcela ativa neste mês</div>
                        </div>
                      </td>
                    </tr>
                  )}
                  {detail.activeInstallments.map((item: any) => (
                    <tr key={item.id}>
                      <td>{item.description}</td>
                      <td>{item.categoryName}</td>
                      <td>
                        <span className="badge badge-success">
                          {item.installmentNumber}/{item.installmentCount}
                        </span>
                      </td>
                      <td>{item.paymentSource}</td>
                      <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatCurrency(item.installmentAmount)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr style={{ fontWeight: 700, borderTop: '2px solid var(--border)', background: 'var(--bg-subtle)' }}>
                    <td colSpan={4}>Total</td>
                    <td style={{ textAlign: 'right' }}>{formatCurrency(installmentsTotal)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Income Modal */}
      <Modal
        title="Nova entrada"
        open={incomeModalOpen}
        onClose={() => setIncomeModalOpen(false)}
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setIncomeModalOpen(false)} type="button">Cancelar</button>
            <button className="btn btn-primary" form="income-form" type="submit">Adicionar</button>
          </>
        }
      >
        <form id="income-form" onSubmit={createIncome} className="form-stack">
          <div className="form-field">
            <label className="form-label">Descrição</label>
            <input
              className="form-input"
              value={incomeForm.description}
              onChange={(e) => setIncomeForm({ ...incomeForm, description: e.target.value })}
              placeholder="Ex: Salário, Freelance..."
              required
            />
          </div>
          <div className="form-row">
            <div className="form-field">
              <label className="form-label">Dia</label>
              <input
                className="form-input"
                type="number"
                value={incomeForm.day}
                onChange={(e) => setIncomeForm({ ...incomeForm, day: e.target.value })}
                placeholder="Opcional"
                min={1}
                max={31}
              />
            </div>
            <div className="form-field">
              <label className="form-label">Valor</label>
              <input
                className="form-input"
                type="number"
                value={incomeForm.amount}
                onChange={(e) => setIncomeForm({ ...incomeForm, amount: e.target.value })}
                placeholder="0,00"
                required
              />
            </div>
          </div>
          <div className="form-field">
            <label className="form-label">Tipo</label>
            <select
              className="form-select"
              value={incomeForm.kind}
              onChange={(e) => setIncomeForm({ ...incomeForm, kind: e.target.value })}
            >
              <option value="OTHER">Outra</option>
              <option value="FIXED_EXTRA">Fixa extra</option>
              <option value="VARIABLE_EXTRA">Variável extra</option>
            </select>
          </div>
        </form>
      </Modal>

      {/* Expense Modal */}
      <Modal
        title="Lançar gasto variável"
        open={expenseModalOpen}
        onClose={() => setExpenseModalOpen(false)}
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setExpenseModalOpen(false)} type="button">Cancelar</button>
            <button className="btn btn-primary" form="expense-form" type="submit">Lançar</button>
          </>
        }
      >
        <form id="expense-form" onSubmit={createExpense} className="form-stack">
          <div className="form-row">
            <div className="form-field">
              <label className="form-label">Data</label>
              <input
                className="form-input"
                type="date"
                value={expenseForm.expenseDate}
                onChange={(e) => setExpenseForm({ ...expenseForm, expenseDate: e.target.value })}
                required
              />
            </div>
            <div className="form-field">
              <label className="form-label">Valor</label>
              <input
                className="form-input"
                type="number"
                value={expenseForm.amount}
                onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                placeholder="0,00"
                required
              />
            </div>
          </div>
          <div className="form-field">
            <label className="form-label">Descrição</label>
            <input
              className="form-input"
              value={expenseForm.description}
              onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
              placeholder="Ex: Mercado, Restaurante..."
              required
            />
          </div>
          <div className="form-field">
            <label className="form-label">Categoria</label>
            <select
              className="form-select"
              value={expenseForm.categoryId}
              onChange={(e) => setExpenseForm({ ...expenseForm, categoryId: e.target.value })}
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
        </form>
      </Modal>
    </div>
  );
}