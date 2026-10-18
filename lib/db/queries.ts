import type { UniqueConstraintCriterion } from "@prisma/orm-postgres/orm-client";
import type { Contract } from "@/prisma/contract";
import { db, type DatabaseScope } from "@/lib/db";

/** Bridge composite @@unique indexes emitted via prisma7Schema into upsert(conflictOn). */
export function conflictKey<ModelName extends keyof Contract["roots"] & string>(
  criterion: Record<string, string>
): UniqueConstraintCriterion<Contract, ModelName> {
  return criterion as unknown as UniqueConstraintCriterion<Contract, ModelName>;
}

/** Reusable public/card projection: never fetch raw drafts or author credentials. */
export const letterPreview = db.orm.public.Letter.fragment((letters) =>
  letters.select(
    "id", "processedText", "emotionTags", "situationTags", "desiredReplyType",
    "riskLevel", "status", "maxReplies", "createdAt"
  )
);

/** Fetch reply eligibility with scalar counts rather than every reply body. */
export function replyEligibilityQuery(responderId: string, scope: DatabaseScope = db) {
  return scope.orm.public.Letter
    .select("id", "authorId", "status", "riskLevel", "maxReplies", "processedText", "desiredReplyType")
    .include("replies", (replies) => replies.combine({
      existing: replies.where({ responderId }).select("id").limit(1),
      activeCount: replies.where((reply) => reply.status.neq("REJECTED")).count()
    }))
    .include("matches", (matches) => matches
      .select("responderId", "status", "createdAt")
      .where({ status: "OFFERED" })
    );
}

/** Order support resources with active entries first, then region and title. */
export function orderedSupportResourcesQuery(scope: DatabaseScope = db) {
  return scope.orm.public.SupportResource.orderBy([
    (resource, { fns }) => fns.raw`${resource.active}`.returns("pg/int4@1").desc(),
    (resource) => resource.region.asc(),
    (resource) => resource.title.asc()
  ]);
}
