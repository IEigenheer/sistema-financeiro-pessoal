'use client';

import { FormEvent, useEffect, useState } from 'react';
import { PageHeader } from './page-header';
import { StatCard } from './stat-card';
import { Modal } from './modal';
import { ConfirmModal } from './confirm-modal';

export function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [form, setForm] = useState({ name: '', type: 'VARIABLE' });

  // Delete confirm state
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  async function loadCategories() {
    setLoading(true);
    try {
      const res = await fetch('/api/categories', { cache: 'no-store' });
      const data = await res.json();
      setCategories(data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCategories();
  }, []);

  function openCreateModal() {
    setEditingCategory(null);
    setForm({ name: '', type: 'VARIABLE' });
    setModalOpen(true);
  }

  function openEditModal(category: any) {
    setEditingCategory(category);
    setForm({ name: category.name, type: category.type });
    setModalOpen(true);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (editingCategory) {
      await fetch(`/api/categories/${editingCategory.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
    } else {
      await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
    }
    setModalOpen(false);
    await loadCategories();
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    await fetch(`/api/categories/${deleteTarget.id}`, { method: 'DELETE' });
    setDeleteTarget(null);
    await loadCategories();
  }

  const filtered = categories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const fixedCount = categories.filter((c) => c.type === 'FIXED').length;
  const variableCount = categories.filter((c) => c.type === 'VARIABLE').length;

  return (
    <div className="content-stack">
      <PageHeader
        title="Gerenciamento de Categorias"
        subtitle="Cadastre, edite e organize todas as categorias do seu orçamento"
        actions={
          <button className="btn btn-primary" type="button" onClick={openCreateModal}>
            + Nova Categoria
          </button>
        }
      />

      <div className="stat-cards">
        <StatCard
          icon="🏷️"
          label="Total de Categorias"
          value={categories.length}
          formula="Total de categorias cadastradas no sistema"
          color="emerald"
        />
        <StatCard
          icon="📌"
          label="Categorias Fixas"
          value={fixedCount}
          formula="Usadas para despesas fixas recorrentes"
          color="sky"
        />
        <StatCard
          icon="📊"
          label="Categorias Variáveis"
          value={variableCount}
          formula="Usadas para lançamentos e variáveis"
          color="amber"
        />
      </div>

      <div className="section-panel">
        <div className="section-panel-header">
          <div>
            <div className="section-panel-title">Lista de Categorias</div>
            <div className="section-panel-subtitle">Total: {filtered.length} exibidas</div>
          </div>
          <div style={{ width: '240px' }}>
            <input
              className="form-input"
              placeholder="🔍 Buscar categoria..."
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
                  <th>Nome</th>
                  <th>Tipo</th>
                  <th style={{ textAlign: 'right' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={3} style={{ textAlign: 'center', padding: '32px' }}>
                      Carregando categorias...
                    </td>
                  </tr>
                )}
                {!loading && filtered.length === 0 && (
                  <tr>
                    <td colSpan={3}>
                      <div className="empty-state">
                        <div className="empty-state-icon">📭</div>
                        <div className="empty-state-text">Nenhuma categoria encontrada</div>
                      </div>
                    </td>
                  </tr>
                )}
                {!loading &&
                  filtered.map((item) => (
                    <tr key={item.id}>
                      <td style={{ fontWeight: 600 }}>{item.name}</td>
                      <td>
                        <span className={`badge ${item.type === 'FIXED' ? 'badge-success' : 'badge-warning'}`}>
                          {item.type === 'FIXED' ? 'Fixa' : 'Variável'}
                        </span>
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
                            onClick={() => setDeleteTarget({ id: item.id, name: item.name })}
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

      {/* Modal Nova / Editar Categoria */}
      <Modal
        title={editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setModalOpen(false)} type="button">
              Cancelar
            </button>
            <button className="btn btn-primary" form="category-form" type="submit">
              {editingCategory ? 'Salvar Alterações' : 'Cadastrar Categoria'}
            </button>
          </>
        }
      >
        <form id="category-form" onSubmit={handleSubmit} className="form-stack">
          <div className="form-field">
            <label className="form-label">Nome da Categoria</label>
            <input
              className="form-input"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Ex: Alimentação, Transporte, Lazer..."
              required
            />
          </div>
          <div className="form-field">
            <label className="form-label">Tipo</label>
            <select
              className="form-select"
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
            >
              <option value="VARIABLE">Variável (Gasto geral / pontual)</option>
              <option value="FIXED">Fixa (Despesa recorrente mensal)</option>
            </select>
          </div>
        </form>
      </Modal>

      {/* Modal Confirmação de Exclusão */}
      <ConfirmModal
        open={Boolean(deleteTarget)}
        message={`Deseja realmente excluir a categoria "${deleteTarget?.name}"?`}
        onConfirm={confirmDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}
