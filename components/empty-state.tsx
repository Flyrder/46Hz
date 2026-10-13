import Link from "next/link";
import { Mailbox } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

export function EmptyState({
  title,
  body,
  href,
  action,
  icon: Icon = Mailbox
}: {
  title: string;
  body: string;
  href?: string;
  action?: string;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-border/80 bg-surface/60 p-8 text-center shadow-xs backdrop-blur-xs">
      <div className="mx-auto mb-3.5 grid h-12 w-12 place-items-center rounded-2xl bg-muted/70 text-muted-foreground">
        <Icon className="h-5 w-5" />
      </div>
      <h2 className="text-base font-semibold text-foreground tracking-tight">{title}</h2>
      <p className="mx-auto mt-1.5 max-w-md text-sm leading-6 text-muted-foreground">{body}</p>
      {href && action ? (
        <div className="mt-5">
          <Link href={href} className={buttonVariants("secondary")}>
            {action}
          </Link>
        </div>
      ) : null}
    </div>
  );
}
