'use client';

import { FormEvent, useEffect, useState } from 'react';
import { PageHeader } from './page-header';
import { StatCard } from './stat-card';
import { Modal } from './modal';
import { ConfirmModal } from './confirm-modal';
import { formatCurrency } from '../lib/format';

export function FixedExpensesPage() {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<any>(null);
  const [form, setForm] = useState({
    description: '',
    categoryId: '',
    defaultAmount: '',
    dueDay: '5',
    dueOnLastDay: false,
  });

  // Delete confirm state
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; description: string } | null>(null);

  async function loadData() {
    setLoading(true);
    try {
      const [expRes, catRes] = await Promise.all([
        fetch('/api/fixed-expenses', { cache: 'no-store' }),
        fetch('/api/categories', { cache: 'no-store' }),
      ]);
      const expData = await expRes.json();
      const catData = await catRes.json();
      setExpenses(expData);
      setCategories(catData);
      if (catData.length > 0 && !form.categoryId) {
        setForm((prev) => ({ ...prev, categoryId: catData[0].id }));
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  function openCreateModal() {
    setEditingExpense(null);
    setForm({
      description: '',
      categoryId: categories[0]?.id ?? '',
      defaultAmount: '',
      dueDay: '5',
      dueOnLastDay: false,
    });
    setModalOpen(true);
  }

  function openEditModal(expense: any) {
    setEditingExpense(expense);
    setForm({
      description: expense.description,
      categoryId: expense.categoryId,
      defaultAmount: String(expense.defaultAmount),
      dueDay: expense.dueDay ? String(expense.dueDay) : '5',
      dueOnLastDay: Boolean(expense.dueOnLastDay),
    });
    setModalOpen(true);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const payload = {
      description: form.description,
      categoryId: form.categoryId,
      defaultAmount: Number(form.defaultAmount),
      dueDay: form.dueOnLastDay ? null : Number(form.dueDay),
      dueOnLastDay: form.dueOnLastDay,
    };

    if (editingExpense) {
      await fetch(`/api/fixed-expenses/${editingExpense.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } else {
      await fetch('/api/fixed-expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    }
    setModalOpen(false);
    await loadData();
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    await fetch(`/api/fixed-expenses/${deleteTarget.id}`, { method: 'DELETE' });
    setDeleteTarget(null);
    await loadData();
  }

  const filtered = expenses.filter((e) =>
    e.description.toLowerCase().includes(search.toLowerCase()) ||
    (e.category?.name ?? '').toLowerCase().includes(search.toLowerCase())
  );

  const totalMonthlyPlanned = expenses.reduce((sum, item) => sum + Number(item.defaultAmount), 0);

  return (
    <div className="content-stack">
      <PageHeader
        title="Gastos Fixos Recorrentes"
        subtitle="Gerencie as despesas fixas mensais previstas (aluguel, internet, seguros...)"
        actions={
          <button className="btn btn-primary" type="button" onClick={openCreateModal}>
            + Novo Gasto Fixo
          </button>
        }
      />

      <div className="stat-cards">
        <StatCard
          icon="📌"
          label="Total Mensal Previsto"
          value={totalMonthlyPlanned}
          formula="Soma do valor padrão de todas as despesas fixas"
          color="rose"
        />
        <StatCard
          icon="📋"
          label="Quantidade de Gastos Fixos"
          value={expenses.length}
          formula="Total de despesas recorrentes cadastradas"
          color="emerald"
        />
        <StatCard
          icon="📊"
          label="Média por Gasto"
          value={expenses.length > 0 ? totalMonthlyPlanned / expenses.length : 0}
          formula="Total mensal ÷ quantidade de itens"
          color="sky"
        />
      </div>

      <div className="section-panel">
        <div className="section-panel-header">
          <div>
            <div className="section-panel-title">Lista de Despesas Fixas</div>
            <div className="section-panel-subtitle">Total: {filtered.length} exibidas</div>
          </div>
          <div style={{ width: '240px' }}>
            <input
              className="form-input"
              placeholder="🔍 Buscar gasto fixo..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="section-panel-body-flush">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Descrição</th>
                  <th>Categoria</th>
                  <th>Vencimento</th>
                  <th style={{ textAlign: 'right' }}>Valor Padrão</th>
                  <th style={{ textAlign: 'right' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '32px' }}>
                      Carregando gastos fixos...
                    </td>
                  </tr>
                )}
                {!loading && filtered.length === 0 && (
                  <tr>
                    <td colSpan={5}>
                      <div className="empty-state">
                        <div className="empty-state-icon">📭</div>
                        <div className="empty-state-text">Nenhum gasto fixo encontrado</div>
                      </div>
                    </td>
                  </tr>
                )}
                {!loading &&
                  filtered.map((item) => (
                    <tr key={item.id}>
                      <td style={{ fontWeight: 600 }}>{item.description}</td>
                      <td>
                        <span className="badge badge-warning">{item.category?.name ?? '—'}</span>
                      </td>
                      <td>{item.dueOnLastDay ? 'Último dia do mês' : `Dia ${item.dueDay}`}</td>
                      <td style={{ textAlign: 'right', fontWeight: 700 }}>
                        {formatCurrency(Number(item.defaultAmount))}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '8px' }}>
                          <button
                            className="btn btn-ghost btn-sm"
                            type="button"
                            onClick={() => openEditModal(item)}
                          >
                            ✏️ Editar
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            type="button"
                            onClick={() => setDeleteTarget({ id: item.id, description: item.description })}
                          >
                            🗑️ Excluir
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal Novo / Editar Gasto Fixo */}
      <Modal
        title={editingExpense ? 'Editar Gasto Fixo' : 'Novo Gasto Fixo'}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setModalOpen(false)} type="button">
              Cancelar
            </button>
            <button className="btn btn-primary" form="fixed-expense-form" type="submit">
              {editingExpense ? 'Salvar Alterações' : 'Cadastrar Gasto Fixo'}
            </button>
          </>
        }
      >
        <form id="fixed-expense-form" onSubmit={handleSubmit} className="form-stack">
          <div className="form-field">
            <label className="form-label">Descrição</label>
            <input
              className="form-input"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Ex: Aluguel, Internet Fibra, Netflix..."
              required
            />
          </div>

          <div className="form-row">
            <div className="form-field">
              <label className="form-label">Categoria</label>
              <select
                className="form-select"
                value={form.categoryId}
                onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                required
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-field">
              <label className="form-label">Valor Padrão (R$)</label>
              <input
                className="form-input"
                type="number"
                step="0.01"
                value={form.defaultAmount}
                onChange={(e) => setForm({ ...form, defaultAmount: e.target.value })}
                placeholder="0,00"
                required
              />
            </div>
          </div>

          <div className="form-field">
            <label className="form-label">Dia de Vencimento</label>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <input
                className="form-input"
                type="number"
                min={1}
                max={31}
                value={form.dueDay}
                disabled={form.dueOnLastDay}
                onChange={(e) => setForm({ ...form, dueDay: e.target.value })}
                style={{ width: '120px' }}
              />
              <label style={{ display: 'inline-flex', gap: '8px', alignItems: 'center', cursor: 'pointer', fontSize: '0.84rem' }}>
                <input
                  type="checkbox"
                  checked={form.dueOnLastDay}
                  onChange={(e) => setForm({ ...form, dueOnLastDay: e.target.checked })}
                />
                Vence no último dia do mês
              </label>
            </div>
          </div>
        </form>
      </Modal>

      {/* Modal Confirmação de Exclusão */}
      <ConfirmModal
        open={Boolean(deleteTarget)}
        message={`Deseja realmente excluir a despesa fixa "${deleteTarget?.description}"?`}
        onConfirm={confirmDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}
