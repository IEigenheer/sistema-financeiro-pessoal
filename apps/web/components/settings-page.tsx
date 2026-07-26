'use client';

import { FormEvent, useEffect, useState } from 'react';
import { PageHeader } from './page-header';
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
    return (
      <div className="content-stack">
        <div className="skeleton skeleton-card" style={{ height: 200 }} />
      </div>
    );
  }

  return (
    <div className="content-stack">
      <PageHeader
        title="Base estrutural"
        subtitle="Parâmetros que sustentam o cálculo patrimonial e substituem a aba Config da planilha"
      />

      <form onSubmit={submitSettings}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Fieldset: Datas */}
          <div className="fieldset">
            <div className="fieldset-legend">
              <span className="fieldset-legend-icon">📅</span>
              Datas de referência
            </div>
            <div className="form-stack">
              <div className="form-row form-row-3">
                <div className="form-field">
                  <label className="form-label">Ano de referência</label>
                  <span className="form-hint">Ano do controle financeiro</span>
                  <input
                    className="form-input"
                    type="number"
                    value={settings.referenceYear}
                    onChange={(e) => setSettings({ ...settings, referenceYear: Number(e.target.value) })}
                  />
                </div>
                <div className="form-field">
                  <label className="form-label">Mês atual</label>
                  <span className="form-hint">Data de referência do mês corrente</span>
                  <input
                    className="form-input"
                    type="date"
                    value={String(settings.currentMonthReference).slice(0, 10)}
                    onChange={(e) => setSettings({ ...settings, currentMonthReference: e.target.value })}
                  />
                </div>
                <div className="form-field">
                  <label className="form-label">Início do controle</label>
                  <span className="form-hint">Data que o controle começou</span>
                  <input
                    className="form-input"
                    type="date"
                    value={String(settings.controlStartDate).slice(0, 10)}
                    onChange={(e) => setSettings({ ...settings, controlStartDate: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Fieldset: Salário */}
          <div className="fieldset">
            <div className="fieldset-legend">
              <span className="fieldset-legend-icon">💰</span>
              Salário
            </div>
            <div className="form-stack">
              <div className="form-row form-row-4">
                <div className="form-field">
                  <label className="form-label">Salário líquido</label>
                  <span className="form-hint">Total líquido mensal</span>
                  <input
                    className="form-input"
                    type="number"
                    value={Number(settings.salaryNetTotal)}
                    onChange={(e) => setSettings({ ...settings, salaryNetTotal: Number(e.target.value) })}
                  />
                </div>
                <div className="form-field">
                  <label className="form-label">1ª parcela</label>
                  <span className="form-hint">Valor da primeira parcela</span>
                  <input
                    className="form-input"
                    type="number"
                    value={Number(settings.salaryFirstInstallment)}
                    onChange={(e) => setSettings({ ...settings, salaryFirstInstallment: Number(e.target.value) })}
                  />
                </div>
                <div className="form-field">
                  <label className="form-label">2ª parcela</label>
                  <span className="form-hint">Valor da segunda parcela</span>
                  <input
                    className="form-input"
                    type="number"
                    value={Number(settings.salarySecondInstallment)}
                    onChange={(e) => setSettings({ ...settings, salarySecondInstallment: Number(e.target.value) })}
                  />
                </div>
                <div className="form-field">
                  <label className="form-label">Dia da 1ª parcela</label>
                  <span className="form-hint">Dia do mês do pagamento</span>
                  <input
                    className="form-input"
                    type="number"
                    value={settings.salaryFirstInstallmentDay}
                    onChange={(e) => setSettings({ ...settings, salaryFirstInstallmentDay: Number(e.target.value) })}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Fieldset: Investimento */}
          <div className="fieldset">
            <div className="fieldset-legend">
              <span className="fieldset-legend-icon">📈</span>
              Projeções e saldos iniciais
            </div>
            <div className="form-stack">
              <div className="form-row form-row-3">
                <div className="form-field">
                  <label className="form-label">Aporte mensal</label>
                  <span className="form-hint">Valor padrão mensal de investimento</span>
                  <input
                    className="form-input"
                    type="number"
                    value={Number(settings.monthlyInvestmentContribution)}
                    onChange={(e) => setSettings({ ...settings, monthlyInvestmentContribution: Number(e.target.value) })}
                  />
                </div>
                <div className="form-field">
                  <label className="form-label">Rendimento mensal</label>
                  <span className="form-hint">Taxa projetada ao mês</span>
                  <input
                    className="form-input"
                    type="number"
                    step="0.001"
                    value={Number(settings.projectedMonthlyReturnRate)}
                    onChange={(e) => setSettings({ ...settings, projectedMonthlyReturnRate: Number(e.target.value) })}
                  />
                </div>
                <div className="form-field">
                  <label className="form-label">Saldo inicial CC</label>
                  <span className="form-hint">Conta corrente no início</span>
                  <input
                    className="form-input"
                    type="number"
                    value={Number(settings.initialCheckingBalance)}
                    onChange={(e) => setSettings({ ...settings, initialCheckingBalance: Number(e.target.value) })}
                  />
                </div>
              </div>
              <div className="form-field" style={{ maxWidth: '33%' }}>
                <label className="form-label">Saldo inicial investimento</label>
                <span className="form-hint">Valor inicial em investimentos</span>
                <input
                  className="form-input"
                  type="number"
                  value={Number(settings.initialInvestmentBalance)}
                  onChange={(e) => setSettings({ ...settings, initialInvestmentBalance: Number(e.target.value) })}
                />
              </div>
            </div>
          </div>

          <div>
            <button className="btn btn-primary" type="submit">Salvar parâmetros</button>
          </div>
        </div>
      </form>

      <div className="two-col">
        <div className="section-panel">
          <div className="section-panel-header">
            <div className="section-panel-title">Categorias</div>
          </div>
          <div className="section-panel-body-flush" style={{ maxHeight: '280px', overflowY: 'auto' }}>
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
                      <td style={{ fontWeight: 600 }}>{item.name}</td>
                      <td>
                        <span className={`badge ${item.type === 'FIXED' ? 'badge-success' : 'badge-warning'}`}>
                          {item.type === 'FIXED' ? 'Fixa' : 'Variável'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="section-panel">
          <div className="section-panel-header">
            <div className="section-panel-title">Despesas fixas</div>
          </div>
          <div className="section-panel-body-flush">
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Descrição</th>
                    <th>Categoria</th>
                    <th style={{ textAlign: 'right' }}>Valor</th>
                  </tr>
                </thead>
                <tbody>
                  {fixedExpenses.map((item) => (
                    <tr key={item.id}>
                      <td style={{ fontWeight: 600 }}>{item.description}</td>
                      <td>{item.category.name}</td>
                      <td style={{ textAlign: 'right' }}>{formatCurrency(item.defaultAmount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <div className="section-panel">
        <div className="section-panel-header">
          <div className="section-panel-title">Parcelamentos</div>
        </div>
        <div className="section-panel-body-flush">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Descrição</th>
                  <th>Categoria</th>
                  <th style={{ textAlign: 'right' }}>Total</th>
                  <th style={{ textAlign: 'center' }}>Parcelas</th>
                  <th style={{ textAlign: 'right' }}>Valor/mês</th>
                </tr>
              </thead>
              <tbody>
                {installments.map((item) => (
                  <tr key={item.id}>
                    <td style={{ fontWeight: 600 }}>{item.description}</td>
                    <td>{item.category.name}</td>
                    <td style={{ textAlign: 'right' }}>{formatCurrency(item.totalAmount)}</td>
                    <td style={{ textAlign: 'center' }}>
                      <span className="badge badge-success">{item.installmentCount}x</span>
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatCurrency(item.monthlyAmount)}</td>
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
