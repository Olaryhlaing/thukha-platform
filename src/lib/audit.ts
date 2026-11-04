import type { SupabaseClient } from "@supabase/supabase-js";

/* Batch 2 audit log: best-effort, never blocks the admin action
   it records. A log failure must not turn a successful suspend,
   flag, refill or delete into a reported failure. */
export async function logAudit(
  service: SupabaseClient,
  actorId: string,
  action: string,
  targetId: string | null,
  detail: string | null,
): Promise<void> {
  try {
    await service.from("audit_logs").insert({
      actor_id: actorId,
      action,
      target_id: targetId,
      detail,
    });
  } catch {
    // Audit is extra evidence, not the action itself.
  }
}
