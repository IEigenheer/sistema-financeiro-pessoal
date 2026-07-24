export const MONTH_NAMES = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
] as const;

export const MONTH_NAME_TO_NUMBER: Record<string, number> = MONTH_NAMES.reduce(
  (acc, name, index) => {
    acc[name.toLowerCase()] = index + 1;
    return acc;
  },
  {} as Record<string, number>,
);
