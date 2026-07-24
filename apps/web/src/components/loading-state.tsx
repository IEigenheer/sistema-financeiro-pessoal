export function LoadingState({ label = 'Carregando...' }: { label?: string }) {
  return <p aria-live="polite">{label}</p>;
}
