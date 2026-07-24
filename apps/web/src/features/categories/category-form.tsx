'use client';

import { useState } from 'react';

import { createApiClient } from '../../lib/api/client';

type Props = {
  api?: ReturnType<typeof createApiClient>;
  onCreated?: () => void;
};

export function CategoryForm({ api = createApiClient(), onCreated }: Props) {
  const [name, setName] = useState('');

  return (
    <form
      onSubmit={async (event) => {
        event.preventDefault();
        await api.createCategory({ name }, crypto.randomUUID());
        setName('');
        onCreated?.();
      }}
    >
      <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Nome da categoria" />
      <button type="submit">Adicionar</button>
    </form>
  );
}
