import { cn } from "@/lib/utils";

export function StatusBadge({
  children,
  tone = "neutral"
}: {
  children: React.ReactNode;
  tone?: "neutral" | "good" | "warning" | "danger";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium tracking-tight",
        tone === "neutral" &&
          "border-border/70 bg-muted/60 text-muted-foreground",
        tone === "good" &&
          "border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
        tone === "warning" &&
          "border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-300",
        tone === "danger" &&
          "border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-300"
      )}
    >
      {children}
    </span>
  );
}
