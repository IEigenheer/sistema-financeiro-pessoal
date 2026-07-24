'use client';

import type { Category } from '@finance/contracts';
import { useState } from 'react';


import { createApiClient } from '../../lib/api/client';

import { CategoryForm } from './category-form';

type Props = {
  initialCategories: Category[];
  api?: ReturnType<typeof createApiClient>;
};

function CategoryRow({ category, api, onRefresh }: { category: Category; api: ReturnType<typeof createApiClient>; onRefresh: () => Promise<void> }) {
  const [name, setName] = useState(category.name);

  return (
    <li>
      <form
        onSubmit={async (event) => {
          event.preventDefault();
          await api.updateCategory(category.id, { name });
          await onRefresh();
        }}
      >
        <input value={name} onChange={(event) => setName(event.target.value)} />
        <button type="submit">Salvar</button>
      </form>
      {category.isActive ? null : <strong>Inativa</strong>}
      <button
        type="button"
        onClick={async () => {
          await api.updateCategory(category.id, { isActive: !category.isActive });
          await onRefresh();
        }}
      >
        {category.isActive ? 'Desativar' : 'Ativar'}
      </button>
    </li>
  );
}

export function CategoriesPage({ initialCategories, api = createApiClient() }: Props) {
  const [categories, setCategories] = useState(initialCategories);

  async function refresh(): Promise<void> {
    setCategories(await api.listCategories());
  }

  return (
    <section>
      <h1>Categorias</h1>
      <CategoryForm
        api={api}
        onCreated={refresh}
      />
      <ul>
        {categories.map((category) => (
          <CategoryRow key={category.id} category={category} api={api} onRefresh={refresh} />
        ))}
      </ul>
    </section>
  );
}
