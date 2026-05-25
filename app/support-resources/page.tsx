import { StatusBadge } from "@/components/status-badge";
import { prisma } from "@/lib/db";
import { highRiskSupportCopy, supportResourceIntro } from "@/lib/resources";

export const dynamic = "force-dynamic";

export default async function SupportResourcesPage({
  searchParams
}: {
  searchParams: Promise<{ routed?: string; suspended?: string }>;
}) {
  const params = await searchParams;
  const resources = await prisma.supportResource.findMany({
    where: { active: true },
    orderBy: [{ language: "asc" }, { region: "asc" }, { title: "asc" }]
  });

  return (
    <section className="mx-auto max-w-3xl">
      <h1 className="text-3xl font-semibold">Support resources</h1>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">
        {params.routed || params.suspended ? highRiskSupportCopy : supportResourceIntro}
      </p>
      <div className="mt-6 space-y-4">
        {resources.map((resource) => (
          <article key={resource.id} className="rounded-lg border border-border bg-surface p-5 shadow-soft">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-semibold">{resource.title}</h2>
              <StatusBadge>{resource.region}</StatusBadge>
              <StatusBadge>{resource.language}</StatusBadge>
            </div>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">{resource.description}</p>
            <div className="mt-4 flex flex-wrap gap-3 text-sm">
              {resource.url ? (
                <a className="font-semibold text-accent" href={resource.url} rel="noreferrer" target="_blank">
                  Website
                </a>
              ) : null}
              {resource.phone ? <span>{resource.phone}</span> : null}
            </div>
          </article>
        ))}
        {resources.length === 0 ? (
          <div className="rounded-lg border border-border bg-surface p-5 text-sm text-muted-foreground shadow-soft">
            No active resources have been configured yet.
          </div>
        ) : null}
      </div>
    </section>
  );
}
