import { AdminNav } from "@/components/admin-nav";
import { LetterCard } from "@/components/letter-card";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminLettersPage() {
  await requireAdmin();
  const letters = await prisma.letter.findMany({
    where: { status: { in: ["PENDING", "ROUTED_TO_SUPPORT"] } },
    orderBy: [{ status: "asc" }, { createdAt: "asc" }],
    take: 50
  });

  return (
    <section className="mx-auto max-w-3xl">
      <h1 className="text-3xl font-semibold">Pending letters</h1>
      <AdminNav />
      <div className="space-y-4">
        {letters.map((letter) => (
          <LetterCard key={letter.id} letter={letter} href={`/admin/letters/${letter.id}`} mode="admin" />
        ))}
        {letters.length === 0 ? (
          <div className="rounded-lg border border-border bg-surface p-5 text-sm text-muted-foreground shadow-soft">
            No letters are waiting for review.
          </div>
        ) : null}
      </div>
    </section>
  );
}
