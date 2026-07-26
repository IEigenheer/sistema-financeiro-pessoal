'use client';

import { FormEvent, useEffect, useState } from 'react';
import { PageHeader } from './page-header';
import { StatCard } from './stat-card';
import { Modal } from './modal';
import { ConfirmModal } from './confirm-modal';
import { formatCurrency, formatDate } from '../lib/format';

function formatMonthYear(dateString: string) {
  if (!dateString) return '—';
  const date = new Date(dateString);
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const y = date.getUTCFullYear();
  return `${m}/${y}`;
}

export function InstallmentsPage() {
  const [installments, setInstallments] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [form, setForm] = useState({
    description: '',
    categoryId: '',
    totalAmount: '',
    installmentCount: '12',
    monthlyAmount: '',
    purchaseDate: `${new Date().toISOString().substring(0, 10)}`,
    firstInstallmentMonth: `${new Date().toISOString().substring(0, 7)}-01`,
    lastInstallmentMonth: '',
    paymentSource: 'Cartão de Crédito',
  });

  // Delete confirm state
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; description: string } | null>(null);

  async function loadData() {
    setLoading(true);
    try {
      const [instRes, catRes] = await Promise.all([
        fetch('/api/installments', { cache: 'no-store' }),
        fetch('/api/categories', { cache: 'no-store' }),
      ]);
      const instData = await instRes.json();
      const catData = await catRes.json();
      setInstallments(instData);
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
    setEditingItem(null);
    const today = new Date().toISOString().substring(0, 10);
    const firstMonth = `${new Date().toISOString().substring(0, 7)}-01`;
    setForm({
      description: '',
      categoryId: categories[0]?.id ?? '',
      totalAmount: '',
      installmentCount: '12',
      monthlyAmount: '',
      purchaseDate: today,
      firstInstallmentMonth: firstMonth,
      lastInstallmentMonth: calculateLastMonth(firstMonth, 12),
      paymentSource: 'Cartão de Crédito',
    });
    setModalOpen(true);
  }

  function openEditModal(item: any) {
    setEditingItem(item);
    const firstM = item.firstInstallmentMonth
      ? new Date(item.firstInstallmentMonth).toISOString().substring(0, 10)
      : '';
    const lastM = item.lastInstallmentMonth
      ? new Date(item.lastInstallmentMonth).toISOString().substring(0, 10)
      : '';
    const pDate = item.purchaseDate
      ? new Date(item.purchaseDate).toISOString().substring(0, 10)
      : '';

    setForm({
      description: item.description,
      categoryId: item.categoryId,
      totalAmount: String(item.totalAmount),
      installmentCount: String(item.installmentCount),
      monthlyAmount: String(item.monthlyAmount),
      purchaseDate: pDate,
      firstInstallmentMonth: firstM,
      lastInstallmentMonth: lastM,
      paymentSource: item.paymentSource ?? 'Cartão de Crédito',
    });
    setModalOpen(true);
  }

  function calculateLastMonth(firstMonthStr: string, count: number): string {
    if (!firstMonthStr || !count || count < 1) return firstMonthStr;
    const [y, m] = firstMonthStr.substring(0, 7).split('-').map(Number);
    if (!y || !m) return firstMonthStr;
    const endDate = new Date(y, m - 1 + count - 1, 1);
    const endY = endDate.getFullYear();
    const endM = String(endDate.getMonth() + 1).padStart(2, '0');
    return `${endY}-${endM}-01`;
  }

  function handleTotalAmountChange(total: string, countStr: string) {
    const tot = Number(total);
    const cnt = Number(countStr);
    const monthly = tot > 0 && cnt > 0 ? (tot / cnt).toFixed(2) : '';
    setForm((prev) => ({
      ...prev,
      totalAmount: total,
      monthlyAmount: monthly,
      lastInstallmentMonth: calculateLastMonth(prev.firstInstallmentMonth, cnt),
    }));
  }

  function handleInstallmentCountChange(countStr: string) {
    const cnt = Number(countStr);
    const tot = Number(form.totalAmount);
    const monthly = tot > 0 && cnt > 0 ? (tot / cnt).toFixed(2) : '';
    setForm((prev) => ({
      ...prev,
      installmentCount: countStr,
      monthlyAmount: monthly,
      lastInstallmentMonth: calculateLastMonth(prev.firstInstallmentMonth, cnt),
    }));
  }

  function handleFirstMonthChange(firstMonthStr: string) {
    const cnt = Number(form.installmentCount) || 1;
    setForm((prev) => ({
      ...prev,
      firstInstallmentMonth: firstMonthStr,
      lastInstallmentMonth: calculateLastMonth(firstMonthStr, cnt),
    }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const payload = {
      description: form.description,
      categoryId: form.categoryId,
      totalAmount: Number(form.totalAmount),
      installmentCount: Number(form.installmentCount),
      monthlyAmount: Number(form.monthlyAmount),
      purchaseDate: new Date(form.purchaseDate).toISOString(),
      firstInstallmentMonth: new Date(form.firstInstallmentMonth).toISOString(),
      lastInstallmentMonth: new Date(form.lastInstallmentMonth).toISOString(),
      paymentSource: form.paymentSource,
    };

    if (editingItem) {
      await fetch(`/api/installments/${editingItem.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } else {
      await fetch('/api/installments', {
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
    await fetch(`/api/installments/${deleteTarget.id}`, { method: 'DELETE' });
    setDeleteTarget(null);
    await loadData();
  }

  const filtered = installments.filter((item) =>
    item.description.toLowerCase().includes(search.toLowerCase()) ||
    (item.category?.name ?? '').toLowerCase().includes(search.toLowerCase()) ||
    (item.paymentSource ?? '').toLowerCase().includes(search.toLowerCase())
  );

  const totalAllInstallments = installments.reduce((sum, i) => sum + Number(i.totalAmount), 0);
  const totalMonthlySum = installments.reduce((sum, i) => sum + Number(i.monthlyAmount), 0);

  return (
    <div className="content-stack">
      <PageHeader
        title="Gerenciamento de Parcelamentos"
        subtitle="Cadastre e controle todas as compras parceladas, origem e períodos de início/fim"
        actions={
          <button className="btn btn-primary" type="button" onClick={openCreateModal}>
            + Novo Parcelamento
          </button>
        }
      />

      <div className="stat-cards">
        <StatCard
          icon="📋"
          label="Total em Parcelamentos"
          value={totalAllInstallments}
          formula="Soma dos valores totais de todas as compras parceladas"
          color="rose"
        />
        <StatCard
          icon="💳"
          label="Total Mensal Atual"
          value={totalMonthlySum}
          formula="Soma da parcela mensal de todos os contratos"
          color="amber"
        />
        <StatCard
          icon="🏷️"
          label="Contratos Ativos"
          value={installments.length}
          formula="Quantidade de parcelamentos cadastrados"
          color="emerald"
        />
      </div>

      <div className="section-panel">
        <div className="section-panel-header">
          <div>
            <div className="section-panel-title">Lista de Parcelamentos</div>
            <div className="section-panel-subtitle">Total: {filtered.length} exibidos</div>
          </div>
          <div style={{ width: '240px' }}>
            <input
              className="form-input"
              placeholder="🔍 Buscar parcelamento..."
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
                  <th>Origem</th>
                  <th style={{ textAlign: 'center' }}>1ª Parcela</th>
                  <th style={{ textAlign: 'center' }}>Última Parcela</th>
                  <th style={{ textAlign: 'center' }}>Nº Parcelas</th>
                  <th style={{ textAlign: 'right' }}>Parcela Mensal</th>
                  <th style={{ textAlign: 'right' }}>Valor Total</th>
                  <th style={{ textAlign: 'right' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={9} style={{ textAlign: 'center', padding: '32px' }}>
                      Carregando parcelamentos...
                    </td>
                  </tr>
                )}
                {!loading && filtered.length === 0 && (
                  <tr>
                    <td colSpan={9}>
                      <div className="empty-state">
                        <div className="empty-state-icon">📭</div>
                        <div className="empty-state-text">Nenhum parcelamento encontrado</div>
                      </div>
                    </td>
                  </tr>
                )}
                {!loading &&
                  filtered.map((item) => (
                    <tr key={item.id}>
                      <td style={{ fontWeight: 600 }}>{item.description}</td>
                      <td>
                        <span className="badge badge-success">{item.category?.name ?? '—'}</span>
                      </td>
                      <td>{item.paymentSource ?? '—'}</td>
                      <td style={{ textAlign: 'center' }}>
                        <span className="badge badge-warning">
                          {formatMonthYear(item.firstInstallmentMonth)}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span className="badge badge-warning">
                          {formatMonthYear(item.lastInstallmentMonth)}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center', fontWeight: 600 }}>
                        {item.installmentCount}x
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 600, color: 'var(--amber-600)' }}>
                        {formatCurrency(Number(item.monthlyAmount))}
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 700 }}>
                        {formatCurrency(Number(item.totalAmount))}
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

      {/* Modal Novo / Editar Parcelamento */}
      <Modal
        title={editingItem ? 'Editar Parcelamento' : 'Novo Parcelamento'}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setModalOpen(false)} type="button">
              Cancelar
            </button>
            <button className="btn btn-primary" form="installment-form" type="submit">
              {editingItem ? 'Salvar Alterações' : 'Cadastrar Parcelamento'}
            </button>
          </>
        }
      >
        <form id="installment-form" onSubmit={handleSubmit} className="form-stack">
          <div className="form-field">
            <label className="form-label">Descrição da Compra</label>
            <input
              className="form-input"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Ex: Notebook Dell, iPhone, Seguro Auto..."
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
              <label className="form-label">Origem do Pagamento</label>
              <input
                className="form-input"
                value={form.paymentSource}
                onChange={(e) => setForm({ ...form, paymentSource: e.target.value })}
                placeholder="Ex: Cartão Itaú, Nubank, Banco do Brasil..."
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-field">
              <label className="form-label">Valor Total (R$)</label>
              <input
                className="form-input"
                type="number"
                step="0.01"
                value={form.totalAmount}
                onChange={(e) => handleTotalAmountChange(e.target.value, form.installmentCount)}
                placeholder="0,00"
                required
              />
            </div>

            <div className="form-field">
              <label className="form-label">Nº de Parcelas</label>
              <input
                className="form-input"
                type="number"
                min={1}
                max={360}
                value={form.installmentCount}
                onChange={(e) => handleInstallmentCountChange(e.target.value)}
                placeholder="12"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-field">
              <label className="form-label">Valor Mensal (R$)</label>
              <input
                className="form-input"
                type="number"
                step="0.01"
                value={form.monthlyAmount}
                onChange={(e) => setForm({ ...form, monthlyAmount: e.target.value })}
                placeholder="Calculado automaticamente"
                required
              />
            </div>

            <div className="form-field">
              <label className="form-label">Data da Compra</label>
              <input
                className="form-input"
                type="date"
                value={form.purchaseDate}
                onChange={(e) => setForm({ ...form, purchaseDate: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-field">
              <label className="form-label">Mês da 1ª Parcela</label>
              <input
                className="form-input"
                type="date"
                value={form.firstInstallmentMonth}
                onChange={(e) => handleFirstMonthChange(e.target.value)}
                required
              />
            </div>

            <div className="form-field">
              <label className="form-label">Mês da Última Parcela 🔒</label>
              <input
                className="form-input"
                type="date"
                value={form.lastInstallmentMonth}
                readOnly
              />
            </div>
          </div>
        </form>
      </Modal>

      {/* Modal Confirmação de Exclusão */}
      <ConfirmModal
        open={Boolean(deleteTarget)}
        message={`Deseja realmente excluir o parcelamento "${deleteTarget?.description}"?`}
        onConfirm={confirmDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}
