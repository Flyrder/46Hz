"use server";

import { redirect } from "next/navigation";
import { clearCurrentUser } from "@/lib/session";

export async function leaveAnonymousSessionAction(): Promise<void> {
  await clearCurrentUser();
  redirect("/");
}
