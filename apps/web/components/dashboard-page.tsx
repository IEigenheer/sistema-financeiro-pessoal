'use client';

import Link from 'next/link';
import { startTransition, useEffect, useState } from 'react';
import { formatCurrency, formatDate, formatMonth } from '../lib/format';

type Overview = {
  year: number;
  currentMonth: number;
  settings: Record<string, unknown>;
  accounts: Array<Record<string, unknown>>;
  currentMonthDetail: Record<string, unknown>;
  dashboard: Array<Record<string, unknown>>;
};

type SimulatorState = {
  salaryMonthly: number;
  fixedMonthlyExpense: number;
  variableMonthlyExpense: number;
  investmentX: number;
  investmentY: number;
  monthlyReturnRate: number;
  monthsToSimulate: number;
  purchaseValue: number;
  purchaseMode: 'cash' | 'installment';
  purchaseInstallmentCount: number;
  purchaseStartMonthIndex: number;
};

export function DashboardPage() {
  const [overview, setOverview] = useState<Overview | null>(null);
  const [simulator, setSimulator] = useState<SimulatorState | null>(null);
  const [simulationResult, setSimulationResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  async function loadData() {
    const response = await fetch('/api/reports/overview', { cache: 'no-store' });
    const data = await response.json();
    setOverview(data);
    setSimulator({
      salaryMonthly: Number(data.settings.salaryNetTotal),
      fixedMonthlyExpense: Number(data.currentMonthDetail.fixedPlannedTotal),
      variableMonthlyExpense: Number(data.currentMonthDetail.variableTotal),
      investmentX: Number(data.currentMonthDetail.investmentContribution),
      investmentY: Number(data.currentMonthDetail.investmentContribution) + 2000,
      monthlyReturnRate: Number(data.settings.projectedMonthlyReturnRate),
      monthsToSimulate: 6,
      purchaseValue: 0,
      purchaseMode: 'cash',
      purchaseInstallmentCount: 1,
      purchaseStartMonthIndex: 1,
    });
    setLoading(false);
  }

  async function runSimulation(current: SimulatorState) {
    const response = await fetch('/api/reports/simulator', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(current),
    });
    const data = await response.json();
    setSimulationResult(data);
  }

  useEffect(() => {
    loadData().catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!simulator) {
      return;
    }

    startTransition(() => {
      runSimulation(simulator).catch(() => undefined);
    });
  }, [simulator]);

  if (loading || !overview || !simulator) {
    return <div className="panel">Carregando visão financeira...</div>;
  }

  const current = overview.currentMonthDetail as any;
  const accounts = overview.accounts as any[];
  const dashboard = overview.dashboard as any[];
  const currentAccount = accounts.find((item) => item.month === overview.currentMonth);

  return (
    <div className="stack-xl">
      <section className="hero">
        <div>
          <p className="eyebrow">Sistema Financeiro Pessoal</p>
          <h1>Controle mensal, patrimônio e simulação em uma aplicação única.</h1>
          <p className="muted">
            Base importada da planilha. As regras de despesas fixas, parcelamentos,
            dashboard e projeção patrimonial foram transportadas para o backend.
          </p>
        </div>
        <div className="hero-actions">
          <Link href="/settings" className="button button-secondary">
            Configurações
          </Link>
          <Link
            href={`/months/${overview.year}/${overview.currentMonth}`}
            className="button"
          >
            Abrir mês atual
          </Link>
        </div>
      </section>

      <section className="card-grid">
        <article className="panel">
          <span className="card-label">Entradas do mês</span>
          <strong>{formatCurrency(current.entriesTotal)}</strong>
        </article>
        <article className="panel">
          <span className="card-label">Saldo disponível</span>
          <strong>{formatCurrency(current.availableBalance)}</strong>
        </article>
        <article className="panel">
          <span className="card-label">Conta corrente acumulada</span>
          <strong>{formatCurrency(currentAccount?.checkingBalance)}</strong>
        </article>
        <article className="panel">
          <span className="card-label">Patrimônio total</span>
          <strong>{formatCurrency(currentAccount?.netWorth)}</strong>
        </article>
      </section>

      <section className="two-columns">
        <article className="panel">
          <div className="section-head">
            <div>
              <p className="eyebrow">Mês atual</p>
              <h2>{formatMonth(overview.currentMonth, overview.year)}</h2>
            </div>
            <Link href={`/months/${overview.year}/${overview.currentMonth}`}>Detalhar</Link>
          </div>
          <dl className="summary-list">
            <div><dt>Despesas fixas previstas</dt><dd>{formatCurrency(current.fixedPlannedTotal)}</dd></div>
            <div><dt>Despesas fixas pagas</dt><dd>{formatCurrency(current.fixedPaidTotal)}</dd></div>
            <div><dt>Despesas variáveis</dt><dd>{formatCurrency(current.variableTotal)}</dd></div>
            <div><dt>Parcelas ativas</dt><dd>{formatCurrency(current.installmentTotal)}</dd></div>
            <div><dt>Aporte do mês</dt><dd>{formatCurrency(current.investmentContribution)}</dd></div>
            <div><dt>Saldo em investimentos</dt><dd>{formatCurrency(currentAccount?.investmentBalance)}</dd></div>
          </dl>
        </article>

        <article className="panel">
          <div className="section-head">
            <div>
              <p className="eyebrow">Patrimônio por mês</p>
              <h2>Linha do ano</h2>
            </div>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Mês</th>
                  <th>Conta</th>
                  <th>Invest.</th>
                  <th>Patrimônio</th>
                </tr>
              </thead>
              <tbody>
                {accounts.map((row) => (
                  <tr key={String(row.month)}>
                    <td>{String(row.label)}</td>
                    <td>{formatCurrency(row.checkingBalance as number | null)}</td>
                    <td>{formatCurrency(row.investmentBalance as number | null)}</td>
                    <td>{formatCurrency(row.netWorth as number | null)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
      </section>

      <section className="panel">
        <div className="section-head">
          <div>
            <p className="eyebrow">Dashboard</p>
            <h2>Gastos por categoria</h2>
          </div>
        </div>
        <div className="category-grid">
          {dashboard.map((category) => (
            <article key={String(category.categoryId)} className="category-card">
              <div className="category-head">
                <strong>{String(category.categoryName)}</strong>
                <span>{formatCurrency(category.totalYear as number)}</span>
              </div>
              <div className="mini-bars">
                {(category.monthlyTotals as number[]).map((value, index) => (
                  <div key={`${category.categoryId}-${index}`} className="mini-bar-wrap">
                    <div
                      className="mini-bar"
                      style={{ height: `${Math.max(8, Math.min(100, Number(value) / 15))}%` }}
                    />
                    <span>{index + 1}</span>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="panel">
        <div className="section-head">
          <div>
            <p className="eyebrow">Simulador</p>
            <h2>Patrimônio futuro</h2>
          </div>
        </div>
        <div className="form-grid">
          <label>
            Salário mensal
            <input
              type="number"
              value={simulator.salaryMonthly}
              onChange={(event) =>
                setSimulator({ ...simulator, salaryMonthly: Number(event.target.value) })
              }
            />
          </label>
          <label>
            Gastos fixos
            <input
              type="number"
              value={simulator.fixedMonthlyExpense}
              onChange={(event) =>
                setSimulator({ ...simulator, fixedMonthlyExpense: Number(event.target.value) })
              }
            />
          </label>
          <label>
            Gastos variáveis
            <input
              type="number"
              value={simulator.variableMonthlyExpense}
              onChange={(event) =>
                setSimulator({ ...simulator, variableMonthlyExpense: Number(event.target.value) })
              }
            />
          </label>
          <label>
            Aporte X
            <input
              type="number"
              value={simulator.investmentX}
              onChange={(event) =>
                setSimulator({ ...simulator, investmentX: Number(event.target.value) })
              }
            />
          </label>
          <label>
            Aporte Y
            <input
              type="number"
              value={simulator.investmentY}
              onChange={(event) =>
                setSimulator({ ...simulator, investmentY: Number(event.target.value) })
              }
            />
          </label>
          <label>
            Rendimento mensal
            <input
              type="number"
              step="0.001"
              value={simulator.monthlyReturnRate}
              onChange={(event) =>
                setSimulator({ ...simulator, monthlyReturnRate: Number(event.target.value) })
              }
            />
          </label>
          <label>
            Meses simulados
            <input
              type="number"
              value={simulator.monthsToSimulate}
              onChange={(event) =>
                setSimulator({ ...simulator, monthsToSimulate: Number(event.target.value) })
              }
            />
          </label>
          <label>
            Valor da compra
            <input
              type="number"
              value={simulator.purchaseValue}
              onChange={(event) =>
                setSimulator({ ...simulator, purchaseValue: Number(event.target.value) })
              }
            />
          </label>
          <label>
            Forma de pagamento
            <select
              value={simulator.purchaseMode}
              onChange={(event) =>
                setSimulator({
                  ...simulator,
                  purchaseMode: event.target.value as 'cash' | 'installment',
                })
              }
            >
              <option value="cash">À vista</option>
              <option value="installment">Parcelado</option>
            </select>
          </label>
          <label>
            Nº parcelas
            <input
              type="number"
              value={simulator.purchaseInstallmentCount}
              onChange={(event) =>
                setSimulator({
                  ...simulator,
                  purchaseInstallmentCount: Number(event.target.value),
                })
              }
            />
          </label>
          <label>
            Compra inicia no mês
            <input
              type="number"
              value={simulator.purchaseStartMonthIndex}
              onChange={(event) =>
                setSimulator({
                  ...simulator,
                  purchaseStartMonthIndex: Number(event.target.value),
                })
              }
            />
          </label>
        </div>
        {simulationResult ? (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Mês</th>
                  <th>Data</th>
                  <th>Parcelas ativas</th>
                  <th>X sem compra</th>
                  <th>Y sem compra</th>
                  <th>Compra</th>
                  <th>X com compra</th>
                </tr>
              </thead>
              <tbody>
                {simulationResult.rows.map((row: any) => (
                  <tr key={row.monthIndex}>
                    <td>{row.monthIndex}</td>
                    <td>{formatDate(row.date)}</td>
                    <td>{formatCurrency(row.existingInstallments)}</td>
                    <td>{formatCurrency(row.xNetWorthWithoutPurchase)}</td>
                    <td>{formatCurrency(row.yNetWorthWithoutPurchase)}</td>
                    <td>{formatCurrency(row.purchaseInstallment)}</td>
                    <td>{formatCurrency(row.xNetWorthWithPurchase)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </section>
    </div>
  );
}
