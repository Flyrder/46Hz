import { cn } from "@/lib/utils";

export const buttonClassName =
  "inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-offset-2 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:active:scale-100 select-none";

export function buttonVariants(
  variant: "primary" | "secondary" | "danger" | "ghost" = "primary"
): string {
  return cn(
    buttonClassName,
    variant === "primary" &&
      "bg-accent text-accent-foreground shadow-xs hover:bg-accent/90 hover:shadow-sm",
    variant === "secondary" &&
      "border border-border/80 bg-surface text-foreground shadow-2xs hover:bg-muted/60 hover:border-border",
    variant === "danger" &&
      "bg-danger text-white shadow-xs hover:bg-danger/90 hover:shadow-sm",
    variant === "ghost" &&
      "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
  );
}
