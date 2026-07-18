export default function Loading() {
  return (
    <div className="mx-auto max-w-xl rounded-lg border border-border bg-surface p-6 shadow-soft">
      <div className="h-4 w-32 animate-pulse rounded bg-muted" />
      <div className="mt-4 h-24 animate-pulse rounded-lg bg-muted" />
    </div>
  );
}
