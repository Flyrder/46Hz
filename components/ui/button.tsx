import { cn } from "@/lib/utils";

export const buttonClassName =
  "inline-flex min-h-10 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-accent/40 disabled:cursor-not-allowed disabled:opacity-60";

export function buttonVariants(
  variant: "primary" | "secondary" | "danger" | "ghost" = "primary"
): string {
  return cn(
    buttonClassName,
    variant === "primary" && "bg-accent text-accent-foreground hover:bg-accent/90",
    variant === "secondary" && "border border-border bg-surface hover:bg-muted",
    variant === "danger" && "bg-danger text-white hover:bg-danger/90",
    variant === "ghost" && "hover:bg-muted"
  );
}
