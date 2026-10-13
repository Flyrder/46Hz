import { saveSupportResourceAction } from "@/app/actions/admin";
import { AdminNav } from "@/components/admin-nav";
import { StatusBadge } from "@/components/status-badge";
import { SubmitButton } from "@/components/ui/submit-button";
import { getAdminRole } from "@/lib/admin";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminResourcesPage() {
  const role = await getAdminRole();
  if (!role) {
    redirect("/admin");
  }

  if (role !== "ADMIN") {
    return (
      <section className="mx-auto max-w-4xl">
        <h1 className="text-3xl font-semibold">Support resources</h1>
        <AdminNav role={role} />
        <div className="mt-6 rounded-xl border border-amber-500/30 bg-amber-500/10 p-6 text-center">
          <h2 className="text-lg font-semibold">Administrator Privileges Required</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Crisis support resource management is restricted to full System Administrators.
          </p>
        </div>
      </section>
    );
  }

  const resources = await prisma.supportResource.findMany({
    orderBy: [{ active: "desc" }, { region: "asc" }, { title: "asc" }]
  });

  return (
    <section className="mx-auto max-w-4xl">
      <h1 className="text-3xl font-semibold">Support resources</h1>
      <AdminNav role={role} />
      <form action={saveSupportResourceAction} className="rounded-lg border border-border bg-surface p-5 shadow-soft">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-sm font-semibold">
            Title
            <input name="title" className="mt-2 w-full rounded-lg border border-border px-3 py-3" required />
          </label>
          <label className="text-sm font-semibold">
            Region
            <input name="region" defaultValue="Global" className="mt-2 w-full rounded-lg border border-border px-3 py-3" required />
          </label>
          <label className="text-sm font-semibold">
            Language
            <input name="language" defaultValue="en" className="mt-2 w-full rounded-lg border border-border px-3 py-3" required />
          </label>
          <label className="text-sm font-semibold">
            Phone
            <input name="phone" className="mt-2 w-full rounded-lg border border-border px-3 py-3" />
          </label>
        </div>
        <label className="mt-3 block text-sm font-semibold">
          URL
          <input name="url" type="url" className="mt-2 w-full rounded-lg border border-border px-3 py-3" />
        </label>
        <label className="mt-3 block text-sm font-semibold">
          Description
          <textarea name="description" rows={3} className="mt-2 w-full rounded-lg border border-border p-3" required />
        </label>
        <label className="mt-3 block text-sm">
          <input name="active" type="checkbox" defaultChecked className="mr-2" />
          Active
        </label>
        <div className="mt-4">
          <SubmitButton>Add resource</SubmitButton>
        </div>
      </form>

      <div className="mt-6 space-y-4">
        {resources.map((resource) => (
          <form key={resource.id} action={saveSupportResourceAction} className="rounded-lg border border-border bg-surface p-5 shadow-soft">
            <input type="hidden" name="id" value={resource.id} />
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge tone={resource.active ? "good" : "neutral"}>
                {resource.active ? "active" : "inactive"}
              </StatusBadge>
              <span className="font-semibold">{resource.title}</span>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <input name="title" defaultValue={resource.title} className="rounded-lg border border-border px-3 py-3" />
              <input name="region" defaultValue={resource.region} className="rounded-lg border border-border px-3 py-3" />
              <input name="language" defaultValue={resource.language} className="rounded-lg border border-border px-3 py-3" />
              <input name="phone" defaultValue={resource.phone ?? ""} className="rounded-lg border border-border px-3 py-3" />
            </div>
            <input name="url" defaultValue={resource.url ?? ""} className="mt-3 w-full rounded-lg border border-border px-3 py-3" />
            <textarea name="description" defaultValue={resource.description} rows={3} className="mt-3 w-full rounded-lg border border-border p-3" />
            <label className="mt-3 block text-sm">
              <input name="active" type="checkbox" defaultChecked={resource.active} className="mr-2" />
              Active
            </label>
            <div className="mt-4">
              <SubmitButton variant="secondary">Save</SubmitButton>
            </div>
          </form>
        ))}
      </div>
    </section>
  );
}
