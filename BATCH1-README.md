# Launch Batch 1 — 2026-11-04, commit eed39b4
No Supabase schema change, no new Storage bucket, no code push by Muse.
Overwrite the 9 files in this zip in D:\thukha-platform-fresh, then
git add . / git commit -m "Launch Batch 1" / git push, Vercel Ready,
then test below. Verify content, not folder dates, before committing.

## What is in Batch 1
Customer:
- Caption + Hashtags in /create (after an image is generated):
  "Caption ထုတ်ပါ" -> 3 template options + hashtags, Copy button.
  NOTE: template caption, NOT an AI model — UI says so, edit before posting.
- Token history in /account: generation spending (-cost, prompt) +
  admin refills (+amount), newest first. NOTE: initial 100 tokens are
  NOT in this list (they were never logged), and a low-balance warning
  shows when balance < 20 (customers only).
- Generation history in /designs (logged-in only): prompt, date,
  format, cost, "Recreate" link to /create with that prompt.
  NOTE: old images cannot be re-downloaded from history — images
  are still not stored. That is Batch 3 (saved images + Storage).

Admin (/admin, admin only):
- System Health section: images today, total images, tokens spent
  today, estimated daily quota left. NOTE: quota is an ESTIMATE
  (170 - today's generations). Cloudflare does not expose exact
  remaining neurons via API, and failure rate is not shown yet
  (failures are not logged — Batch 2).
- Data Export: Users CSV + Generations CSV download buttons.
  CSV downloads in the admin browser only. Prompts + names are in
  the file — store it securely.

## Test
Customer: /create -> generate image -> Caption button -> options
appear, Copy works. /account -> Token history shows spent/refill.
 /designs -> Generation History shows past generations, Recreate
 opens /create with that prompt.
Admin: /admin -> Health numbers appear, Export buttons download
 .csv files that open with correct columns.

## NOT in Batch 1 (Batch 2 / Batch 3, next)
Batch 2: Customer suspend (admin), content flagging, failure logging
 + failure rate, audit log view, announcements.
Batch 3: Saved generated images in Storage (view/re-download),
 Brand preset + logo upload + logo on download, own templates /
 favorites. Brand preset is built inside /create, NOT by restoring
 the removed /brands page.
Payment is excluded throughout, as requested.
