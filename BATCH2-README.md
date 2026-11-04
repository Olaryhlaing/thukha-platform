# Launch Batch 2 — 2026-11-04
Admin launch features (payment excluded, as requested).
IMPORTANT — Supabase step FIRST (unlike Batch 1):
1. Supabase Dashboard -> SQL Editor -> New query -> paste the
   WHOLE supabase/schema.sql from this zip and Run.
   It is safe to re-run (all Batch 2 changes are "if not exists"
   migrations). This adds: profiles.suspended, generations.flagged,
   and new tables generation_failures, audit_logs, announcements.
   Without this step, suspend/flag/failure/audit/announcement
   calls will fail with a missing-column/table error.
2. Overwrite the other 17 files in D:\thukha-platform-fresh
   (this create page already contains Batch 1 + token refresh
   v1/v2/debug, so it can overwrite those), commit, push,
   Vercel Ready, then test below. Verify content, not dates.

## What is in Batch 2
- Suspend (admin): /admin Users list -> Suspend / Unsuspend per
  customer. Cannot suspend yourself or another admin. Suspended
  customer can still log in and sees a red warning on /account
  and /create, and the Generate button is disabled — the generate
  API also blocks with 403, so the UI button is not the only guard.
- Flagging (admin): /admin Latest Generations -> Flag / Unflag.
  Flag = "admin review" only. It does NOT delete the generation
  and does NOT hide it from its owner. Delete stays separate.
- Failure logging + rate: provider errors (Cloudflare/Gemini
  returned an error or no image) are now logged to
  generation_failures. /admin Health now also shows Failures
  today + Failure rate %. NOTE: the rate counts only failures
  logged from Batch 2 onward — older failures were never logged,
  so an old period would understate the rate. Validation errors
  (empty prompt, insufficient tokens, reference rejected) and
  charge failures are NOT counted as provider failures.
- Audit log (admin): /admin Audit Log section, latest 50 shown
  (API returns 100). Every suspend/unsuspend, flag/unflag,
  refill, generation delete, announcement create/activate/
  deactivate is logged with actor, target, detail, time.
- Announcements (admin + customer): /admin form -> Title + Body
  -> Post. Active announcements show as a banner at the top of
  /create for everyone (customers and guests). Dismiss (X) hides
  it for that page load only — it returns on the next visit.
  Deactivate keeps history; there is no delete button on purpose.

## Test (use a throwaway customer for suspend, never a real one
## without unsuspending it right after)
1. Admin suspends a test customer -> test customer /account and
   /create show the red suspended warning, Generate is disabled,
   and a generate attempt is blocked. Admin unsuspends -> warning
   gone, generation works again. Audit Log shows suspend +
   unsuspend with the admin name.
2. Admin flags a generation -> Flagged badge appears, owner
   still sees it in their own history. Unflag -> badge gone.
   Audit Log shows flag/unflag.
3. Force a provider failure if possible (e.g. wrong provider
   config in a test deploy, or a Cloudflare quota day) -> Health
   Failures today goes up and Failure rate changes. If no failure
   occurs, Health correctly shows 0 / 0% — that is not a bug.
4. Admin posts an announcement -> /create shows the banner.
   Dismiss it, reload /create -> banner returns. Admin
   deactivates it -> banner gone. Audit Log shows both actions.
5. Admin refills a customer and deletes a generation -> both
   appear in Audit Log (refill was already in usage_events;
   audit is the readable view).

## NOT in Batch 2 (Batch 3, final pre-launch batch)
Saved generated images in Storage (view/re-download), Brand
preset + logo upload + logo on download, own templates /
favorites. Brand preset is built inside /create, NOT by
restoring the removed /brands page.
