export function ConfirmActionDialog({
  title,
  description,
  confirmLabel = 'Confirmar',
}: {
  title: string;
  description: string;
  confirmLabel?: string;
}) {
  return (
    <section aria-label={title} style={{ border: '1px solid #ddd', padding: '1rem' }}>
      <h2>{title}</h2>
      <p>{description}</p>
      <button type="button">{confirmLabel}</button>
    </section>
  );
}
