const BRL_FORMATTER = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

export function formatMoney(value: string): string {
  const numericValue = Number.parseFloat(value);
  return BRL_FORMATTER.format(Number.isNaN(numericValue) ? 0 : numericValue);
}
