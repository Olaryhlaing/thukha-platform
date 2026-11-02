/* Privacy: strip personal data before anything is sent to an AI
   provider (Cloudflare Workers AI / Google Gemini). The provider
   only needs a scene description — it never needs a phone number
   or an email address, and the overlay text is drawn by the browser
   later anyway, so losing a phone number from the AI prompt costs
   nothing: the phone still appears in the final PNG via overlay.

   What is stripped: email addresses, Myanmar phones (+95 / 09 …),
   and any other long digit sequence (7+ digits, allowing spaces
   and dashes). Short numbers are kept on purpose: "50% လျှော့စျေး",
   a year like 2026, or a price like 50000 must survive, because
   those are scene details, not identifiers. This is applied to
   every text field that reaches buildPrompt() in
   /api/generate-background — the user's own prompt, business name,
   goal, channel, and overlay text. The original text is NOT changed
   in the user's own account log (generations table) or in the
   browser overlay; only the provider-bound copy is cleaned. */

export function stripPersonalData(text: string): string {
  let out = text;
  // Email addresses.
  out = out.replace(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g, "[removed]");
  // Myanmar international numbers: +95 9… / +959…
  out = out.replace(/\+?95[\s-]?\d[\d\s-]{6,}\d/g, "[removed]");
  // Myanmar local numbers: 09…
  out = out.replace(/\b0\d[\d\s-]{6,}\d\b/g, "[removed]");
  // Any other long digit run (account numbers, other countries'
  // phones). 7+ digits, so short scene numbers survive.
  out = out.replace(/\b\d[\d\s-]{6,}\d\b/g, "[removed]");
  return out;
}
