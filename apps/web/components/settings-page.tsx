'use client';

import { FormEvent, useEffect, useState } from 'react';
import { formatCurrency } from '../lib/format';

export function SettingsPage() {
  const [settings, setSettings] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [fixedExpenses, setFixedExpenses] = useState<any[]>([]);
  const [installments, setInstallments] = useState<any[]>([]);

  async function load() {
    const [settingsRes, categoriesRes, fixedRes, installmentRes] = await Promise.all([
      fetch('/api/settings'),
      fetch('/api/categories'),
      fetch('/api/fixed-expenses'),
      fetch('/api/installments'),
    ]);

    setSettings(await settingsRes.json());
    setCategories(await categoriesRes.json());
    setFixedExpenses(await fixedRes.json());
    setInstallments(await installmentRes.json());
  }

  useEffect(() => {
    load().catch(() => undefined);
  }, []);

  async function submitSettings(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
    await load();
  }

  if (!settings) {
    return <div className="panel">Carregando configurações...</div>;
  }

  return (
    <div className="stack-xl">
      <section className="panel">
        <h1>Base estrutural</h1>
        <p className="muted">
          Ajuste os parâmetros que substituem a aba Config da planilha e sustentam o
          cálculo patrimonial.
        </p>
        <form onSubmit={submitSettings} className="form-grid">
          <label>
            Ano de referência
            <input
              type="number"
              value={settings.referenceYear}
              onChange={(event) =>
                setSettings({ ...settings, referenceYear: Number(event.target.value) })
              }
            />
          </label>
          <label>
            Mês atual
            <input
              type="date"
              value={String(settings.currentMonthReference).slice(0, 10)}
              onChange={(event) =>
                setSettings({ ...settings, currentMonthReference: event.target.value })
              }
            />
          </label>
          <label>
            Início do controle
            <input
              type="date"
              value={String(settings.controlStartDate).slice(0, 10)}
              onChange={(event) =>
                setSettings({ ...settings, controlStartDate: event.target.value })
              }
            />
          </label>
          <label>
            Salário líquido
            <input
              type="number"
              value={Number(settings.salaryNetTotal)}
              onChange={(event) =>
                setSettings({ ...settings, salaryNetTotal: Number(event.target.value) })
              }
            />
          </label>
          <label>
            1ª parcela
            <input
              type="number"
              value={Number(settings.salaryFirstInstallment)}
              onChange={(event) =>
                setSettings({
                  ...settings,
                  salaryFirstInstallment: Number(event.target.value),
                })
              }
            />
          </label>
          <label>
            2ª parcela
            <input
              type="number"
              value={Number(settings.salarySecondInstallment)}
              onChange={(event) =>
                setSettings({
                  ...settings,
                  salarySecondInstallment: Number(event.target.value),
                })
              }
            />
          </label>
          <label>
            Dia da 1ª parcela
            <input
              type="number"
              value={settings.salaryFirstInstallmentDay}
              onChange={(event) =>
                setSettings({
                  ...settings,
                  salaryFirstInstallmentDay: Number(event.target.value),
                })
              }
            />
          </label>
          <label>
            Aporte mensal
            <input
              type="number"
              value={Number(settings.monthlyInvestmentContribution)}
              onChange={(event) =>
                setSettings({
                  ...settings,
                  monthlyInvestmentContribution: Number(event.target.value),
                })
              }
            />
          </label>
          <label>
            Rendimento mensal
            <input
              type="number"
              step="0.001"
              value={Number(settings.projectedMonthlyReturnRate)}
              onChange={(event) =>
                setSettings({
                  ...settings,
                  projectedMonthlyReturnRate: Number(event.target.value),
                })
              }
            />
          </label>
          <label>
            Saldo inicial CC
            <input
              type="number"
              value={Number(settings.initialCheckingBalance)}
              onChange={(event) =>
                setSettings({
                  ...settings,
                  initialCheckingBalance: Number(event.target.value),
                })
              }
            />
          </label>
          <label>
            Saldo inicial investimento
            <input
              type="number"
              value={Number(settings.initialInvestmentBalance)}
              onChange={(event) =>
                setSettings({
                  ...settings,
                  initialInvestmentBalance: Number(event.target.value),
                })
              }
            />
          </label>
          <button className="button" type="submit">
            Salvar parâmetros
          </button>
        </form>
      </section>

      <section className="two-columns">
        <article className="panel">
          <h2>Categorias</h2>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Tipo</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((item) => (
                  <tr key={item.id}>
                    <td>{item.name}</td>
                    <td>{item.type}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <article className="panel">
          <h2>Despesas fixas</h2>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Descrição</th>
                  <th>Categoria</th>
                  <th>Valor</th>
                </tr>
              </thead>
              <tbody>
                {fixedExpenses.map((item) => (
                  <tr key={item.id}>
                    <td>{item.description}</td>
                    <td>{item.category.name}</td>
                    <td>{formatCurrency(item.defaultAmount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
      </section>

      <section className="panel">
        <h2>Parcelamentos</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Descrição</th>
                <th>Categoria</th>
                <th>Total</th>
                <th>Parcelas</th>
                <th>Valor/mês</th>
              </tr>
            </thead>
            <tbody>
              {installments.map((item) => (
                <tr key={item.id}>
                  <td>{item.description}</td>
                  <td>{item.category.name}</td>
                  <td>{formatCurrency(item.totalAmount)}</td>
                  <td>{item.installmentCount}</td>
                  <td>{formatCurrency(item.monthlyAmount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
