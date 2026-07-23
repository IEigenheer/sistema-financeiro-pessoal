export function NotificationCenter({ message }: { message?: string | null }) {
  if (!message) {
    return null;
  }

  return (
    <div role="status" style={{ marginBottom: '1rem', padding: '0.75rem', background: '#f2f2f2' }}>
      {message}
    </div>
  );
}
