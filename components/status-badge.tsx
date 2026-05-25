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
        "inline-flex items-center rounded-md border px-2 py-1 text-xs font-medium",
        tone === "neutral" && "border-border bg-muted/60 text-muted-foreground",
        tone === "good" && "border-emerald-200 bg-emerald-50 text-emerald-800",
        tone === "warning" && "border-warning/35 bg-warning/10 text-warning",
        tone === "danger" && "border-red-200 bg-red-50 text-red-800"
      )}
    >
      {children}
    </span>
  );
}
