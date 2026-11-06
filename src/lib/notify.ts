import type { SupabaseClient } from "@supabase/supabase-js";

/* In-app notifications (header bell): best-effort, never blocks the
   action that triggers them — a notification failure must not turn
   a successful reply, refill or suspend into a reported failure.
   Titles are rendered from i18n by `type` on the client, so the
   stored row is language-neutral; `detail` is the human detail
   (ticket subject, token amount, name, announcement title). */
export async function notifyUser(
  service: SupabaseClient,
  ownerId: string,
  type: string,
  detail: string | null,
  link: string,
): Promise<void> {
  try {
    await service.from("notifications").insert({ owner_id: ownerId, type, detail, link });
  } catch {
    // Notification is extra — the action itself already succeeded.
  }
}

async function notifyRole(
  service: SupabaseClient,
  role: string,
  type: string,
  detail: string | null,
  link: string,
): Promise<void> {
  try {
    const { data } = await service.from("profiles").select("id").eq("role", role);
    const rows = (data ?? []).map((u) => ({ owner_id: u.id, type, detail, link }));
    if (rows.length) await service.from("notifications").insert(rows);
  } catch {
    // Notification is extra — the action itself already succeeded.
  }
}

export async function notifyAdmins(
  service: SupabaseClient,
  type: string,
  detail: string | null,
  link: string,
): Promise<void> {
  await notifyRole(service, "admin", type, detail, link);
}

export async function notifyCustomers(
  service: SupabaseClient,
  type: string,
  detail: string | null,
  link: string,
): Promise<void> {
  await notifyRole(service, "customer", type, detail, link);
}
