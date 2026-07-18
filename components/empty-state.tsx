import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export function EmptyState({
  title,
  body,
  href,
  action
}: {
  title: string;
  body: string;
  href?: string;
  action?: string;
}) {
  return (
    <div className="rounded-lg border border-dashed border-border bg-surface/70 p-6 text-center shadow-soft">
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">{body}</p>
      {href && action ? (
        <Link href={href} className={buttonVariants("secondary") + " mt-5"}>
          {action}
        </Link>
      ) : null}
    </div>
  );
}
