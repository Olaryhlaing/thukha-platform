# Dev 2 Update — ThuKha (2026-10-28)

For Olary to send to Dev 2 (assumed Saw Thurizza, name swappable).
Muse did not message Dev 2.

## Message to send

> Saw, ThuKha /create is done. Run: unzip → `npm install` → `npm run dev` → `/create`.
>
> New:
> 1. Responsive — desktop: form left, sticky preview right. Phone: 1 column + step tabs (Brief → Editor → Export). Buttons 44px, text 16px.
> 2. Custom colors — customer picks post background, headline, subheadline, CTA colors. App UI stays Violet/Lilac.
> 3. Custom AI images — prompt + 7 styles. AI image = background only, no text inside. Burmese text is a separate layer, so it stays correct. No AI key yet, so placeholder shows — not a bug.
> 4. CTA — tells viewers what to do next. Optional: blank = no pill.
> 5. Home Launch Timeline removed — do not re-add.
>
> Your scope: `src/app/create/*`, `src/components/editor/*`, `src/components/ui/*`.
> My scope: `src/app/api/*`, Supabase, AI key.
>
> Need from you:
> 1. Canvas 2D now, Konva in v2 — OK?
> 2. Phone editor with step tabs — OK?
> 3. Nov 14 availability + daily sync time?

## How to explain

1. Demo /create on phone and desktop.
2. Walk Brief → Editor → Export, in customer terms only.
3. Don'ts: no Timeline, no Burmese text inside AI images, no mixing app color with post color.

## Commits

- `dbe5ad2` responsive /create
- `18068bc` `.env.example` (no keys)
- `a2a842a` custom colors
- `1c76a41` custom AI images
- `a3df3ad` Timeline removed
- Zip: `thukha-platform-fresh.zip`, not pushed

## APIs

- `POST /api/generate-background` — real only with key, else 503 + placeholder
- `POST /api/generate-caption` — template
- `POST /api/qa-check` — warnings only, never blocks export
