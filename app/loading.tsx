export default function Loading() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Loading"
      className="mx-auto max-w-2xl rounded-3xl border border-border/70 bg-surface/70 p-6 sm:p-8 shadow-soft backdrop-blur-xs transition-all animate-pulse"
    >
      <div className="flex items-center justify-between border-b border-border/60 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="h-7 w-7 rounded-xl bg-muted/80" />
          <div className="h-5 w-32 rounded-lg bg-muted/80" />
        </div>
        <div className="h-4 w-16 rounded-full bg-muted/60" />
      </div>
      <div className="mt-6 space-y-3">
        <div className="h-4 w-3/4 rounded-md bg-muted/70" />
        <div className="h-4 w-full rounded-md bg-muted/60" />
        <div className="h-4 w-5/6 rounded-md bg-muted/60" />
        <div className="h-4 w-2/3 rounded-md bg-muted/50" />
      </div>
      <div className="mt-8 flex items-center justify-between border-t border-border/50 pt-4">
        <div className="h-3 w-28 rounded-md bg-muted/50" />
        <div className="h-9 w-24 rounded-xl bg-muted/70" />
      </div>
      <span className="sr-only">조용히 편지를 불러오는 중입니다...</span>
    </div>
  );
}
