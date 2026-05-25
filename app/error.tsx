"use client";

import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function ErrorPage({ error }: { error: Error }) {
  return (
    <section className="mx-auto max-w-xl rounded-lg border border-border bg-surface p-6 shadow-soft">
      <h1 className="text-2xl font-semibold">Something needs attention</h1>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">{error.message}</p>
      <Link href="/" className={buttonVariants("secondary") + " mt-5"}>
        Return home
      </Link>
    </section>
  );
}
