/* ThuKha tokens — the customer's own credit, not the Gemini API key.
   The Gemini key stays server-only in .env.local and the customer
   never sees it. The customer starts with 100 ThuKha tokens, and
   each successful image costs an amount based on its difficulty:

     base                            10 tokens
     + 5 per reference image         (max +15, up to 3 images)
     + 5 for a large format          (Story / Cover)
     + 5 for a detailed prompt       (over 120 characters)

   So a simple post costs 10, the hardest (story/cover + 3 refs +
   long prompt) costs 35. Failed generations cost nothing — the
   client deducts only after the API returns an image.

   Prototype note: the balance lives in the browser's localStorage
   (key "thukha-tokens"), so it is per device/browser and can be
   reset by clearing site data. The real version needs Supabase
   auth + a server-side balance so a customer cannot reset it.

   Guests are different from customers: a guest (no login) starts
   with only GUEST_START_TOKENS (50) in this browser, while a
   logged-in customer starts with START_TOKENS (100) on the server.
   The server code must never use GUEST_START_TOKENS. */

export const START_TOKENS = 100;
export const GUEST_START_TOKENS = 50;
/* Guests may generate only GUEST_MAX_GENERATIONS images in this
   browser (localStorage key "thukha-guest-generations", counted
   only on a successful image, never on failure). Honest limit:
   this is browser-only, so clearing site data or switching
   browser/device resets it — it stops casual repeated use, it
   does not stop a determined person. Only login (server tokens)
   gives a real per-account limit. */
export const GUEST_MAX_GENERATIONS = 1;

export function tokenCost(input: {
  prompt: string;
  format: string;
  referenceCount: number;
}): number {
  let cost = 10;
  cost += Math.min(input.referenceCount, 3) * 5;
  if (input.format === "story" || input.format === "cover") cost += 5;
  if (input.prompt.trim().length > 120) cost += 5;
  return cost;
}
