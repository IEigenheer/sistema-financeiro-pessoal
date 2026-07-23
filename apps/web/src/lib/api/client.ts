import type {
  Category,
  FinancialSettings,
  MonthlyOverview,
  StartDatePreviewRequest,
  UpsertFinancialSettingsRequest,
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from '@finance/contracts';

import { getApiBaseUrl } from './api-config';
import { ApiError } from './api-error';

type FetchJsonOptions = RequestInit & {
  idempotencyKey?: string;
};

async function fetchJson<T>(path: string, options: FetchJsonOptions = {}): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');
  if (options.idempotencyKey) {
    headers.set('Idempotency-Key', options.idempotencyKey);
  }

  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    ...options,
    headers,
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new ApiError(`Erro HTTP ${response.status}`, response.status, await safeJson(response));
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

async function safeJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

export function createApiClient() {
  return {
    getFinancialSettings: () => fetchJson<FinancialSettings | null>('/financial-settings'),
    upsertFinancialSettings: (payload: UpsertFinancialSettingsRequest, idempotencyKey?: string) =>
      fetchJson<FinancialSettings>('/financial-settings', {
        method: 'PUT',
        body: JSON.stringify(payload),
        ...(idempotencyKey ? { idempotencyKey } : {}),
      }),
    previewStartDate: (payload: StartDatePreviewRequest) =>
      fetchJson('/financial-settings/start-date-preview', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    listCategories: () => fetchJson<Category[]>('/categories'),
    createCategory: (payload: CreateCategoryRequest, idempotencyKey?: string) =>
      fetchJson<Category>('/categories', {
        method: 'POST',
        body: JSON.stringify(payload),
        ...(idempotencyKey ? { idempotencyKey } : {}),
      }),
    updateCategory: (id: string, payload: UpdateCategoryRequest) =>
      fetchJson<Category>(`/categories/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      }),
    getMonthlyOverview: (month: string) => fetchJson<MonthlyOverview>(`/months/${month}/overview`),
  };
}
