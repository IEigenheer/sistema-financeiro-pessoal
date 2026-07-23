'use client';

import type { FinancialSettings } from '@finance/contracts';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';


import { createApiClient } from '../../lib/api/client';

import { financialSettingsSchema, type FinancialSettingsFormValues } from './financial-settings.schema';

type Props = {
  initialValues: FinancialSettings | null;
  api?: ReturnType<typeof createApiClient>;
};

export function FinancialSettingsForm({ initialValues, api = createApiClient() }: Props) {
  const [message, setMessage] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FinancialSettingsFormValues>({
    resolver: zodResolver(financialSettingsSchema),
    defaultValues: initialValues ?? {
      controlStartDate: '2026-01-01',
      monthlyNetSalary: '0.00',
      firstSalaryInstallmentAmount: '0.00',
      firstSalaryInstallmentDay: 15,
      defaultMonthlyContribution: '0.00',
      projectedMonthlyInvestmentYieldRate: '0.00000000',
      initialOperationalBalance: '0.00',
      initialInvestmentBalance: '0.00',
      secondSalaryInstallmentDateRule: 'LAST_DAY_OF_MONTH',
    },
  });

  return (
    <form
      onSubmit={handleSubmit(async (values) => {
        const result = await api.upsertFinancialSettings(values, crypto.randomUUID());
        setMessage(`Configuração salva para ${result.controlStartDate}.`);
      })}
    >
      {message ? <p role="status">{message}</p> : null}
      <label>
        Data de início
        <input {...register('controlStartDate')} aria-invalid={Boolean(errors.controlStartDate)} />
      </label>
      <label>
        Salário líquido
        <input {...register('monthlyNetSalary')} aria-invalid={Boolean(errors.monthlyNetSalary)} />
      </label>
      <label>
        Primeira parcela
        <input {...register('firstSalaryInstallmentAmount')} aria-invalid={Boolean(errors.firstSalaryInstallmentAmount)} />
      </label>
      <label>
        Dia da primeira parcela
        <input type="number" {...register('firstSalaryInstallmentDay', { valueAsNumber: true })} aria-invalid={Boolean(errors.firstSalaryInstallmentDay)} />
      </label>
      <label>
        Aporte mensal padrão
        <input {...register('defaultMonthlyContribution')} aria-invalid={Boolean(errors.defaultMonthlyContribution)} />
      </label>
      <label>
        Rendimento projetado
        <input {...register('projectedMonthlyInvestmentYieldRate')} aria-invalid={Boolean(errors.projectedMonthlyInvestmentYieldRate)} />
      </label>
      <label>
        Saldo operacional inicial
        <input {...register('initialOperationalBalance')} aria-invalid={Boolean(errors.initialOperationalBalance)} />
      </label>
      <label>
        Saldo de investimentos inicial
        <input {...register('initialInvestmentBalance')} aria-invalid={Boolean(errors.initialInvestmentBalance)} />
      </label>
      <button type="submit" disabled={isSubmitting}>
        Salvar
      </button>
      {errors.controlStartDate ? <p role="alert">Valide a data inicial.</p> : null}
    </form>
  );
}
