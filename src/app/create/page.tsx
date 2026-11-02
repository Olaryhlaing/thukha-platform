"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import type { ChangeEvent, PointerEvent as ReactPointerEvent, ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import { START_TOKENS, GUEST_START_TOKENS, GUEST_MAX_GENERATIONS, tokenCost } from "@/lib/tokens";
import { TEMPLATES } from "@/lib/templates";
import { getSupabase } from "@/lib/supabase/client";
import { useLanguage } from "@/components/LanguageProvider";
import { serverErrorText } from "@/lib/i18n";

/*
 * ThuKha /create — minimal customer flow (2026-10-28), plus a
 * text overlay (2026-11-01, user request: "like before").
 * Text-first flow (2026-11-01): the customer types the overlay
 * text FIRST (section 1, before any image exists), then the AI
 * prompt (section 2). The overlay text is sent to the API only
 * as scene mood and is drawn as a separate layer on top of the
 * finished image in the browser, so Burmese text is always 100%
 * correct (the AI is still told to draw no text in the image).
 * No colors, no logo upload, no caption, no QA, no steps.
 */

const BUSINESS_TYPES = [
  "စားသောက်ဆိုင်",
  "Online shop",
  "အလှအပ",
  "ဝန်ဆောင်မှု",
  "Agency",
  "အခြား",
];

const GOALS = ["ရောင်းအား တိုးရန်", "Brand သိစေရန်", "Promotion ကြေညာရန်"];

// Display labels for the select options. The option VALUE stays the
// original Burmese string (templates, prompt examples and the API
// match on it), only the shown label switches with the UI language.
const BUSINESS_TYPE_LABELS_EN: Record<string, string> = {
  "စားသောက်ဆိုင်": "Restaurant",
  "Online shop": "Online shop",
  "အလှအပ": "Beauty",
  "ဝန်ဆောင်မှု": "Service",
  Agency: "Agency",
  "အခြား": "Other",
};
const GOAL_LABELS_EN: Record<string, string> = {
  "ရောင်းအား တိုးရန်": "Increase sales",
  "Brand သိစေရန်": "Raise brand awareness",
  "Promotion ကြေညာရန်": "Announce a promotion",
};

const CHANNELS = [
  { id: "Facebook post", format: "1080x1080" },
  { id: "Story", format: "story" },
  { id: "Cover", format: "cover" },
  { id: "Menu / product card", format: "1080x1080" },
] as const;

// Ready-to-use prompts (2026-11-01). Scene descriptions only —
// the server already appends the hard rules (no text, no logo,
// clean empty space at the top for the overlay text), so these
// must NOT mention text, prices, or brand names. Each is kept
// under 120 characters so the token cost stays at the base 10.
// Each example has a `type` matching a BUSINESS_TYPES value, and
// /create only shows the examples for the selected business type
// (2026-11-01, user request: do not show all of them).
const PROMPT_EXAMPLES = [
  {
    label: "စားသောက်ဆိုင် — မုန့်ဟင်းခါး",
    type: "စားသောက်ဆိုင်",
    prompt:
      "Steaming bowl of mohinga on a wooden table, fresh herbs and lime, warm morning light, cozy Myanmar teashop",
  },
  {
    label: "စားသောက်ဆိုင် — ကြော်ငြာ ပုံ",
    type: "စားသောက်ဆိုင်",
    prompt:
      "Grilled chicken and rice on a rustic plate, steam rising, warm restaurant lighting, appetizing close-up",
  },
  {
    label: "Online shop — အဝတ်အစား",
    type: "Online shop",
    prompt:
      "Elegant pastel dress on a wooden hanger against a soft cream wall, gentle daylight, minimal boutique style",
  },
  {
    label: "Online shop — ပစ္စည်း",
    type: "Online shop",
    prompt:
      "Skincare cream jar on a pastel pedestal with soft flowers beside it, clean bright studio light, minimal",
  },
  {
    label: "အလှအပ — Salon",
    type: "အလှအပ",
    prompt:
      "Bright modern beauty salon interior, comfortable chair and mirrors, soft flowers, warm relaxing light",
  },
  {
    label: "အလှအပ — မိတ်ကပ်",
    type: "အလှအပ",
    prompt:
      "Makeup brushes and lipsticks arranged neatly on a marble table, soft pink flowers, gentle daylight",
  },
  {
    label: "Agency — ရုံး",
    type: "Agency",
    prompt:
      "Modern creative office, young team discussing around a table with laptops, bright natural light",
  },
  {
    label: "Agency — ဒီဇိုင်း",
    type: "Agency",
    prompt:
      "Designer desk with color swatches, laptop and sketches, warm lamp light, creative studio atmosphere",
  },
  {
    label: "Promotion — လက်ဆောင်",
    type: "အခြား",
    prompt:
      "Colorful gift boxes and balloons on a festive table, confetti in the air, joyful celebration mood",
  },
  {
    label: "Promotion — ကော်ဖီဆိုင်",
    type: "အခြား",
    prompt:
      "Cup of latte with heart foam art on a wooden cafe table, croissant beside it, warm cozy morning light",
  },
];

// Ready-to-try overlay texts (2026-11-01). Clicking one fills
// both the headline and the subheadline in section 1, so the
// customer can test the overlay without typing Burmese first.
// The first one matches the Condo/Agency test case in the
// 2026-11-01 screenshot. These are overlay text only — they are
// never sent to the AI as image text.
const TEXT_EXAMPLES = [
  { label: "Condo — ရောင်းမည်", headline: "Condo အသစ် ရောင်းမည်", sub: "မြို့လယ်နေရာ • အခန်းကျယ်ကျယ်" },
  { label: "လျှော့စျေး", headline: "50% လျှော့စျေး", sub: "ဒီအပတ်ပဲ ရမယ်" },
  { label: "စားသောက်ဆိုင်", headline: "မုန့်ဟင်းခါး အထူး", sub: "မနက်တိုင်း လတ်လတ်ဆတ်ဆတ်" },
  { label: "Online shop", headline: "အဝတ်အစား အသစ်ရောက်ပြီ", sub: "ပို့ခ အခမဲ့" },
  { label: "အလှအပ", headline: "Salon အထူး Promotion", sub: "ဒီအပတ်ပဲ • ကြိုတင်စာရင်းပေးပါ" },
  { label: "ကော်ဖီဆိုင်", headline: "ကော်ဖီ အသစ်", sub: "မနက်ခင်းကို အရသာနဲ့ စတင်ပါ" },
];

const inputClass =
  "w-full rounded-xl border border-thukha-lilac/50 bg-white dark:bg-[#1b1c48] px-3 py-3 text-base text-thukha-indigo dark:text-[#f6f7fb] outline-none focus:border-thukha-violet focus:ring-2 focus:ring-thukha-lilac/50";
const labelClass = "text-sm font-bold text-thukha-indigo dark:text-[#f6f7fb]";
const sectionClass =
  "flex flex-col gap-4 rounded-2xl border border-thukha-lilac/40 bg-white dark:bg-[#1b1c48] p-4 shadow-sm transition-shadow hover:shadow-md sm:p-5";

export default function CreatePage() {
  return (
    <Suspense>
      <CreatePageInner />
    </Suspense>
  );
}

function CreatePageInner() {
  const searchParams = useSearchParams();
  const { t, lang } = useLanguage();
  // Prefill from Templates / Brands / Designs links, from the URL
  // itself (no effect needed): ?template=<id>, ?brand=<name>&type=<t>,
  // ?prompt=<p>&channel=<c>. Template wins for type/channel/prompt
  // unless a direct prompt/channel param overrides it.
  const template = TEMPLATES.find((t) => t.id === searchParams.get("template"));
  const paramChannel = searchParams.get("channel");
  const initialChannel = CHANNELS.some((c) => c.id === paramChannel)
    ? (paramChannel as string)
    : (template?.channel ?? "Facebook post");
  const paramType = searchParams.get("type");
  const [businessType, setBusinessType] = useState(
    paramType && BUSINESS_TYPES.includes(paramType)
      ? paramType
      : (template?.businessType ?? BUSINESS_TYPES[0]),
  );
  const [businessName, setBusinessName] = useState(searchParams.get("brand") ?? "");
  const [goal, setGoal] = useState(GOALS[0]);
  const [channel, setChannel] = useState<string>(initialChannel);
  const [aiPrompt, setAiPrompt] = useState(
    searchParams.get("prompt") ?? template?.prompt ?? "",
  );
  const [referenceImages, setReferenceImages] = useState<string[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");
  const [aiImages, setAiImages] = useState<string[]>([]);
  const [selected, setSelected] = useState("");
  // ThuKha tokens (customer's own credit, not the Gemini key):
  // logged-in customers start 100 on the server; guests start 50
  // in this browser only (GUEST_START_TOKENS). An old browser
  // balance above 50 is capped to 50, so old guests do not keep
  // the old 100. Lazy init: server renders 50, browser reads its
  // own (capped) balance. suppressHydrationWarning is set on the
  // balance pill below.
  const [tokens, setTokens] = useState(() => {
    if (typeof window === "undefined") return GUEST_START_TOKENS;
    const stored = Number(localStorage.getItem("thukha-tokens"));
    if (!Number.isFinite(stored) || stored < 0) return GUEST_START_TOKENS;
    return Math.min(stored, GUEST_START_TOKENS);
  });
  // Guest generation count (browser only): how many images this
  // browser has already generated as a guest. Counted only on
  // success, never on failure; the test refill does NOT reset it.
  const [guestGenerations, setGuestGenerations] = useState(() => {
    if (typeof window === "undefined") return 0;
    const stored = Number(localStorage.getItem("thukha-guest-generations"));
    return Number.isFinite(stored) && stored > 0 ? Math.floor(stored) : 0;
  });
  const [promptSuggestions, setPromptSuggestions] = useState<string[]>([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  // Server tokens (logged-in) take over from browser tokens (guest).
  const [serverTokens, setServerTokens] = useState<number | null>(null);
  // Admin accounts are unlimited (role=admin, server-side): no
  // balance check, no deduction — the pill shows ∞ instead of a number.
  const [isUnlimited, setIsUnlimited] = useState(false);
  const [authToken, setAuthToken] = useState<string | null>(null);
  // Image provider (from the generate API's GET): "cloudflare" means
  // the free FLUX model, which cannot edit reference images.
  const [imageProvider, setImageProvider] = useState<string>("");
  // Text overlay (drawn on top of the finished image, never by AI):
  // headline + optional subheadline, position, and text colour.
  const [overlayHeadline, setOverlayHeadline] = useState("");
  const [overlaySub, setOverlaySub] = useState("");
  const [overlayPosition, setOverlayPosition] = useState<"top" | "center" | "bottom">("top");
  const [overlayColor, setOverlayColor] = useState<"white" | "black">("white");
  // Full customer control (2026-11-01, user request: "as they like"):
  // size, alignment, and a translucent background behind the text.
  // All three apply to both the live preview and the canvas PNG.
  const [overlaySize, setOverlaySize] = useState<"small" | "medium" | "large">("medium");
  const [overlayAlign, setOverlayAlign] = useState<"left" | "center" | "right">("center");
  const [overlayBg, setOverlayBg] = useState<"none" | "dark" | "light">("none");
  // Overlay font, chosen by the customer for the text they add
  // (headline, subheadline, brand name — all three share it, so
  // the promo looks like one design, not three). Default is now
  // Padauk (2026-11-02, user request: beautiful font on the AI
  // image output) — designed for Burmese, elegant and readable —
  // so a customer who never touches the Font select still gets
  // a beautiful overlay, in preview and in the PNG download.
  // The other stacks always end in a font that has Burmese
  // glyphs, so Burmese text never falls back to a broken
  // system font.
  const [overlayFont, setOverlayFont] = useState<"default" | "padauk" | "serif" | "playfair">("padauk");
  // AI-text mode (2026-11-02, user request: let AI write the
  // text in the image), default ON. OFF = Overlay mode: the
  // browser draws the text with 100% correct Burmese.
  const [aiWritesText, setAiWritesText] = useState(true);
  const overlayFontStack =
    overlayFont === "padauk"
      ? '"Padauk", "Noto Sans Myanmar", sans-serif'
      : overlayFont === "serif"
        ? '"Noto Serif Myanmar", Georgia, serif'
        : overlayFont === "playfair"
          ? '"Playfair Display", "Noto Sans Myanmar", serif'
          : '"Noto Sans Myanmar", Inter, sans-serif';
  // Separate drag-to-position (2026-11-01, user request: headline
  // and subheadline as separate layers, one by one): each line has
  // its own free position in % of the image, set by dragging that
  // line in the preview. While set, it overrides the top/center/
  // bottom select for that line only; changing that select (or
  // the reset button) clears both again. Works with mouse and
  // touch via Pointer Events. Until a line is dragged, both lines
  // stay together in one block at the select position, as before.
  const [overlayCustomHead, setOverlayCustomHead] = useState<{ x: number; y: number } | null>(null);
  const [overlayCustomSub, setOverlayCustomSub] = useState<{ x: number; y: number } | null>(null);
  // Business-name layer: the business name (e.g. "Yangon kitchen")
  // is shown ON the final image as a separate browser-drawn layer,
  // not by the AI. The AI must never draw text (it garbles Burmese
  // and is unreliable even for English), so the name is drawn by
  // the browser like the headline/subheadline — spelling 100%
  // correct, draggable, and included in the with-text PNG only.
  const [showBrandName, setShowBrandName] = useState(true);
  const [overlayCustomBrand, setOverlayCustomBrand] = useState<{ x: number; y: number } | null>(null);
  const previewRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<{
    pointerId: number;
    which: "head" | "sub" | "brand";
    startX: number;
    startY: number;
    startPos: { x: number; y: number };
  } | null>(null);

  function defaultCustomPos(which: "head" | "sub" | "brand"): { x: number; y: number } {
    // Brand footer stays at the bottom regardless of the headline
    // position (the headline defaults to the top, so they rarely
    // overlap; if they do, the brand can be dragged away).
    const baseY = which === "brand" ? 92 : overlayPosition === "top" ? 15 : overlayPosition === "bottom" ? 85 : 50;
    return {
      x: overlayAlign === "left" ? 10 : overlayAlign === "right" ? 90 : 50,
      // The subheadline sits just below the headline in the
      // default combined block, so its drag start is a bit lower.
      y: which === "sub" ? Math.min(100, baseY + 12) : baseY,
    };
  }

  function onOverlayPointerDown(which: "head" | "sub" | "brand") {
    return (e: ReactPointerEvent<HTMLDivElement>) => {
      const container = previewRef.current;
      if (!container) return;
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      dragRef.current = {
        pointerId: e.pointerId,
        which,
        startX: e.clientX,
        startY: e.clientY,
        startPos:
          (which === "head" ? overlayCustomHead : which === "sub" ? overlayCustomSub : overlayCustomBrand) ?? defaultCustomPos(which),
      };
    };
  }

  function onOverlayPointerMove(e: ReactPointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    const container = previewRef.current;
    if (!drag || drag.pointerId !== e.pointerId || !container) return;
    const rect = container.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    const clamp = (v: number) => Math.max(0, Math.min(100, v));
    const pos = {
      x: clamp(drag.startPos.x + ((e.clientX - drag.startX) / rect.width) * 100),
      y: clamp(drag.startPos.y + ((e.clientY - drag.startY) / rect.height) * 100),
    };
    if (drag.which === "head") setOverlayCustomHead(pos);
    else if (drag.which === "sub") setOverlayCustomSub(pos);
    else setOverlayCustomBrand(pos);
  }

  function onOverlayPointerUp(e: ReactPointerEvent<HTMLDivElement>) {
    if (dragRef.current?.pointerId === e.pointerId) dragRef.current = null;
  }
  const [overlayMessage, setOverlayMessage] = useState("");
  const [savedMessage, setSavedMessage] = useState("");

  const channelInfo = CHANNELS.find((c) => c.id === channel) ?? CHANNELS[0];
  const cost = tokenCost({
    prompt: aiPrompt,
    format: channelInfo.format,
    referenceCount: referenceImages.length,
  });
  // Admin unlimited: never blocked by a (browser or server) number.
  const effectiveTokens = isUnlimited ? Number.POSITIVE_INFINITY : (serverTokens ?? tokens);
  // Guest = no Supabase session. Guests may generate and preview,
  // but they must NOT download a clean image (see below).
  const isGuest = !authToken;
  // Guest limit: 1 image only per browser. Logged-in customers
  // and admins are never limited by this (isGuest is false).
  const guestUsedUp = isGuest && !isUnlimited && guestGenerations >= GUEST_MAX_GENERATIONS;

  // Load the image provider once, so /create can warn about the
  // Cloudflare reference-image limit before the user generates.
  useEffect(() => {
    fetch("/api/generate-background")
      .then((res) => res.json())
      .then((json) => {
        if (typeof json.provider === "string") setImageProvider(json.provider);
      })
      .catch(() => {});
  }, []);

  // Load the server balance once a session exists; guests stay local.
  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) return;
    supabase.auth.getSession().then(async ({ data }) => {
      const token = data.session?.access_token ?? null;
      setAuthToken(token);
      if (!token) return;
      const res = await fetch("/api/tokens", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = (await res.json()) as { mode?: string; balance?: number; unlimited?: boolean };
      if (json.mode === "server" && json.unlimited) {
        setIsUnlimited(true);
      } else if (json.mode === "server" && typeof json.balance === "number") {
        setServerTokens(json.balance);
      }
    });
  }, []);

  function spendTokens(amount: number) {
    setTokens((prev) => {
      const next = Math.max(0, prev - amount);
      localStorage.setItem("thukha-tokens", String(next));
      return next;
    });
  }

  // Test-only refill: restores the starting guest tokens (50)
  // in this browser. Remove this button before a real launch — a
  // real top-up must go through payment/admin, not a free button.
  function refillTestTokens() {
    localStorage.setItem("thukha-tokens", String(GUEST_START_TOKENS));
    setTokens(GUEST_START_TOKENS);
    setAiError("");
  }

  async function getPromptSuggestions() {
    // Text-first: suggestions work from the text typed above
    // (section 1 headline/subheadline) even if the prompt box
    // is still empty — the API builds them from the overlay text.
    const overlayText = [overlayHeadline, overlaySub].map((t) => t.trim()).filter(Boolean).join(" — ");
    if (!aiPrompt.trim() && !overlayText) {
      setAiError(t("create.errNeedTextOrPrompt"));
      return;
    }
    setSuggestionsLoading(true);
    setAiError("");
    try {
      const res = await fetch("/api/improve-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idea: aiPrompt,
          overlayText,
          businessType,
          businessName,
          goal,
          channel,
          // Mode-aware suggestions: in AI-text mode they must
          // not say "no text" (that would contradict the render
          // instruction); in Overlay mode they must.
          renderText: aiWritesText,
        }),
      });
      const data = (await res.json()) as { options?: string[]; error?: string };
      if (!res.ok || !data.options) {
        setAiError(serverErrorText(lang, data.error) ?? t("create.errSuggestionFailed"));
        return;
      }
      setPromptSuggestions(data.options);
    } catch {
      setAiError(t("create.errSuggestionFailedRetry"));
    } finally {
      setSuggestionsLoading(false);
    }
  }

  function addReferenceImages(e: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []).slice(0, 3 - referenceImages.length);
    if (files.some((f) => f.size > 5_000_000)) {
      setAiError(t("create.errImageTooBig"));
      return;
    }
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () =>
        setReferenceImages((prev) => (prev.length < 3 ? [...prev, String(reader.result ?? "")] : prev));
      reader.readAsDataURL(file);
    });
  }

  async function generateAi() {
    if (!aiPrompt.trim()) {
      setAiError(t("create.errNeedPrompt"));
      return;
    }
    // Guest limit first: after 1 guest image, only login helps —
    // this error deliberately has no "Token" in it, so the token
    // refill button (shown only for Token errors) never appears.
    if (guestUsedUp) {
      setAiError(t("create.errGuestLimit"));
      return;
    }
    // Token check first: insufficient balance blocks generation, and
    // a failed generation never deducts (deduct only on success).
    if (effectiveTokens < cost) {
      setAiError(isGuest ? t("create.errGuestLimit") : t("create.errTokenNotEnough", { cost, balance: effectiveTokens }));
      return;
    }
    setAiLoading(true);
    setAiError("");
    try {
      const res = await fetch("/api/generate-background", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: aiPrompt,
          style: "photorealistic",
          format: channelInfo.format,
          businessType,
          businessName,
          goal,
          channel,
          referenceImages,
          // AI-text mode: the text typed above is sent to be
          // rendered in the image. Overlay mode: the server must
          // NOT render it — it only guides scene mood.
          renderText: aiWritesText,
          overlayText: [overlayHeadline, overlaySub, showBrandName ? businessName : ""].map((t) => t.trim()).filter(Boolean).join(" — "),
          ...(authToken ? { authToken } : {}),
        }),
      });
      const data = (await res.json()) as {
        imageUrl?: string;
        error?: string;
        cost?: number;
        serverBalance?: number;
        unlimited?: boolean;
      };
      if (!res.ok || !data.imageUrl) {
        setAiError(serverErrorText(lang, data.error) ?? t("create.errGenerateFailed"));
        return;
      }
      if (data.unlimited) {
        // Admin: nothing deducted, nothing to update.
        setIsUnlimited(true);
      } else if (typeof data.serverBalance === "number") {
        setServerTokens(data.serverBalance);
      } else {
        spendTokens(data.cost ?? cost);
        // Guest only: this branch runs only without a server
        // balance, so it is a guest success — count it toward the
        // 1-image guest limit. Failures return above, uncounted.
        if (!authToken) {
          setGuestGenerations((prev) => {
            const next = prev + 1;
            localStorage.setItem("thukha-guest-generations", String(next));
            return next;
          });
        }
      }
      setAiImages((prev) => [data.imageUrl as string, ...prev].slice(0, 4));
      setSelected(data.imageUrl);
    } catch {
      setAiError(t("create.errGenerateFailedRetry"));
    } finally {
      setAiLoading(false);
    }
  }

  // Download the selected image WITH the overlay text composited
  // on top via canvas. The image is a data URL (Gemini/Cloudflare
  // base64), so the canvas is never tainted by cross-origin data.
  // Text is wrapped, centred, and drawn with a dark shadow so it
  // stays readable on any background. Burmese is drawn by the
  // browser's own text engine, so it cannot garble like AI text.
  function downloadWithText() {
    if (!selected) return;
    if (isGuest) {
      setOverlayMessage(t("create.errGuestDownload"));
      return;
    }
    if (aiWritesText) {
      // Text already drawn by the AI — download the image as-is.
      setOverlayMessage("");
      const a = document.createElement("a");
      a.href = selected;
      a.download = "thukha-promo.png";
      a.click();
      return;
    }
    if (!overlayHeadline.trim() && !overlaySub.trim() && !(showBrandName && businessName.trim())) {
      setOverlayMessage(t("create.errNeedOverlayText"));
      return;
    }
    setOverlayMessage("");
    const img = new Image();
    img.onload = async () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(img, 0, 0);
      const w = canvas.width;
      const h = canvas.height;
      const pad = w * 0.06;
      const maxWidth = w - pad * 2;
      const font = overlayFontStack;
      // Size control: headline is 7% / 9% / 12% of image width,
      // subheadline is always half the headline size.
      const headlineSize = Math.round(
        w * (overlaySize === "small" ? 0.07 : overlaySize === "large" ? 0.12 : 0.09),
      );
      const subSize = Math.round(headlineSize * 0.5);
      // Per-line dragged position: the % point is the anchor —
      // left edge for left align, centre for centre align, right
      // edge for right align — matching the preview's translate.
      const textXFor = (custom: { x: number; y: number } | null) =>
        custom
          ? (custom.x / 100) * w
          : overlayAlign === "left"
            ? pad
            : overlayAlign === "right"
              ? w - pad
              : w / 2;
      const drawLines = (text: string, fontSize: number, bold: boolean) => {
        ctx.font = `${bold ? "bold" : "400"} ${fontSize}px ${font}`;
        ctx.fillStyle = overlayColor;
        ctx.textAlign = overlayAlign;
        ctx.textBaseline = "alphabetic";
        ctx.shadowColor = "rgba(0,0,0,0.75)";
        ctx.shadowBlur = Math.max(4, fontSize * 0.12);
        ctx.shadowOffsetY = Math.max(2, fontSize * 0.05);
        const words = text.split(/\s+/).filter(Boolean);
        const lines: string[] = [];
        let line = "";
        for (const word of words) {
          const test = line ? `${line} ${word}` : word;
          if (ctx.measureText(test).width > maxWidth && line) {
            lines.push(line);
            line = word;
          } else {
            line = test;
          }
        }
        if (line) lines.push(line);
        return lines;
      };
      // Load the beautiful font before measuring/drawing, so
      // the PNG uses Padauk (or the customer's chosen font),
      // not a silent sans fallback.
      try {
        await document.fonts.load(`bold ${headlineSize}px ${font}`);
        await document.fonts.load(`400 ${subSize}px ${font}`);
        await document.fonts.load(`bold ${Math.round(headlineSize * 0.6)}px ${font}`);
      } catch {
        // Font API unavailable: draw anyway with the fallback stack.
      }
      const headlineLines = overlayHeadline.trim()
        ? drawLines(overlayHeadline.trim(), headlineSize, true)
        : [];
      const subLines = overlaySub.trim() ? drawLines(overlaySub.trim(), subSize, false) : [];
      const brandSize = Math.round(headlineSize * 0.6);
      const brandLines =
        showBrandName && businessName.trim() ? drawLines(businessName.trim(), brandSize, true) : [];
      const lineHeight = (size: number) => size * 1.25;
      const headHeight = headlineLines.length * lineHeight(headlineSize);
      const subHeight = subLines.length * lineHeight(subSize);
      const brandHeight = brandLines.length * lineHeight(brandSize);
      // Draw one line's block (its own bg rect + text) at a top.
      const drawBlock = (
        lines: string[],
        fontSize: number,
        bold: boolean,
        blockTop: number,
        custom: { x: number; y: number } | null,
      ) => {
        if (lines.length === 0) return;
        const textX = textXFor(custom);
        const height = lines.length * lineHeight(fontSize);
        if (overlayBg !== "none") {
          let blockWidth = 0;
          ctx.font = `${bold ? "bold" : "400"} ${fontSize}px ${font}`;
          for (const lineText of lines) blockWidth = Math.max(blockWidth, ctx.measureText(lineText).width);
          const bgPad = Math.round(w * 0.03);
          const bgX =
            overlayAlign === "left"
              ? textX - bgPad
              : overlayAlign === "right"
                ? textX - blockWidth - bgPad
                : textX - blockWidth / 2 - bgPad;
          ctx.shadowColor = "transparent";
          ctx.shadowBlur = 0;
          ctx.shadowOffsetY = 0;
          ctx.fillStyle = overlayBg === "dark" ? "rgba(0,0,0,0.45)" : "rgba(255,255,255,0.65)";
          ctx.fillRect(bgX, blockTop - bgPad / 2, blockWidth + bgPad * 2, height + bgPad);
        }
        let y = blockTop + fontSize;
        for (const lineText of lines) {
          ctx.font = `${bold ? "bold" : "400"} ${fontSize}px ${font}`;
          ctx.fillStyle = overlayColor;
          ctx.textAlign = overlayAlign;
          ctx.shadowColor = "rgba(0,0,0,0.75)";
          ctx.shadowBlur = Math.max(4, fontSize * 0.12);
          ctx.shadowOffsetY = Math.max(2, fontSize * 0.05);
          ctx.fillText(lineText, textX, y);
          y += lineHeight(fontSize);
        }
      };
      // Separate positions (preview and download use the same
      // model): each line is centred vertically on its own anchor.
      // Default anchors: the two lines straddle the select
      // position (top 15% / centre 50% / bottom 85%), offset by
      // size; a single line sits exactly on the select position.
      // A dragged line uses its own % anchor instead.
      const centerPct =
        overlayPosition === "top" ? 0.15 : overlayPosition === "bottom" ? 0.85 : 0.5;
      const offsetPct =
        headlineLines.length > 0 && subLines.length > 0
          ? overlaySize === "small"
            ? 0.08
            : overlaySize === "large"
              ? 0.16
              : 0.11
          : 0;
      const headTop = overlayCustomHead
        ? (overlayCustomHead.y / 100) * h - headHeight / 2
        : (centerPct - offsetPct / 2) * h - headHeight / 2;
      const subTop = overlayCustomSub
        ? (overlayCustomSub.y / 100) * h - subHeight / 2
        : (centerPct + offsetPct / 2) * h - subHeight / 2;
      drawBlock(headlineLines, headlineSize, true, headTop, overlayCustomHead);
      drawBlock(subLines, subSize, false, subTop, overlayCustomSub);
      const brandTop = overlayCustomBrand
        ? (overlayCustomBrand.y / 100) * h - brandHeight / 2
        : 0.92 * h - brandHeight / 2;
      drawBlock(brandLines, brandSize, true, brandTop, overlayCustomBrand);
      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "thukha-promo.png";
        a.click();
        URL.revokeObjectURL(url);
      }, "image/png");
    };
    img.onerror = () => setOverlayMessage(t("create.errImageOpenFailed"));
    img.src = selected;
  }

  async function saveDesign() {
    if (!aiPrompt.trim()) {
      setSavedMessage(t("create.msgNoPrompt"));
      return;
    }
    const record = {
      // eslint-disable-next-line react-hooks/purity -- id is generated in a click handler, not during render.
      id: `guest-${Date.now()}`,
      prompt: aiPrompt,
      channel,
      format: channelInfo.format,
    };
    if (authToken) {
      const res = await fetch("/api/designs", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${authToken}` },
        body: JSON.stringify({ prompt: aiPrompt, channel, format: channelInfo.format }),
      });
      setSavedMessage(res.ok ? t("create.msgDesignSaved") : t("create.msgDesignSaveFailed"));
      return;
    }
    try {
      const prev = JSON.parse(localStorage.getItem("thukha-designs") ?? "[]") as typeof record[];
      localStorage.setItem("thukha-designs", JSON.stringify([record, ...prev].slice(0, 20)));
      setSavedMessage(t("create.msgDesignSaved"));
    } catch {
      setSavedMessage(t("create.msgDesignSaveFailed"));
    }
  }

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:py-10">
      <header className="flex flex-col gap-2 rounded-3xl bg-gradient-to-br from-thukha-violet via-thukha-violet to-thukha-lilac p-5 text-white shadow-xl shadow-thukha-violet/30 sm:p-8">
        <h1 className="text-2xl font-bold sm:text-3xl">{t("create.title")}</h1>
        <p className="leading-7 text-white/85">
          {t("create.subtitle")}
        </p>
        {!isGuest && (
          <p suppressHydrationWarning className="mt-1 w-fit rounded-full bg-white/20 px-4 py-1 text-sm font-bold">
            {isUnlimited
              ? t("create.tokenPillUnlimited")
              : t("create.tokenPill", { tokens: effectiveTokens, start: START_TOKENS, mode: t("create.modeServer"), provider: imageProvider === "cloudflare" ? t("create.providerCloudflare") : t("create.providerGemini") })}
          </p>
        )}
      </header>

      {/* Side preview (2026-11-01, user request: preview beside, not
          below, and always visible): desktop = form left + sticky
          preview right; mobile = single column, preview after form. */}
      <div className="mt-6 grid grid-cols-1 items-start gap-6 lg:grid-cols-[1fr_420px]">
        <div className="flex flex-col gap-6">
      <section className={sectionClass}>
        <h2 className="text-lg font-bold">{t("create.business")}</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className={labelClass}>
            {t("create.businessType")}
            <select value={businessType} onChange={(e) => setBusinessType(e.target.value)} className={`${inputClass} mt-1`}>
              {BUSINESS_TYPES.map((bt) => (
                <option key={bt} value={bt}>{lang === "en" ? (BUSINESS_TYPE_LABELS_EN[bt] ?? bt) : bt}</option>
              ))}
            </select>
          </label>
          <label className={labelClass}>
            {t("create.goal")}
            <select value={goal} onChange={(e) => setGoal(e.target.value)} className={`${inputClass} mt-1`}>
              {GOALS.map((g) => (
                <option key={g} value={g}>{lang === "en" ? (GOAL_LABELS_EN[g] ?? g) : g}</option>
              ))}
            </select>
          </label>
        </div>
        <label className={labelClass}>
          {t("create.businessName")}
          <input id="business-name-input" value={businessName} onChange={(e) => setBusinessName(e.target.value)} placeholder={t("create.businessNamePlaceholder")} className={`${inputClass} mt-1`} />
        </label>
        <label className="flex items-start gap-2 text-sm leading-6 text-thukha-indigo dark:text-[#f6f7fb]">
          <input type="checkbox" checked={showBrandName} onChange={(e) => setShowBrandName(e.target.checked)} className="mt-1.5 h-4 w-4 accent-[#5946ED]" />
          <span>
            <b>{t("create.showBrandName")}</b>
            <span className="block text-thukha-indigo/70 dark:text-white/70">{t("create.showBrandHelp")}</span>
          </span>
        </label>
        <label className={labelClass}>
          {t("create.channel")}
          <select value={channel} onChange={(e) => setChannel(e.target.value)} className={`${inputClass} mt-1`}>
            {CHANNELS.map((c) => (
              <option key={c.id}>{c.id}</option>
            ))}
          </select>
        </label>
      </section>

      {/* Text-first flow (2026-11-01): the customer types the text
          BEFORE generating — no image needed first. This text is
          sent to the API only as scene mood, and after generation
          it is overlaid on the image automatically. */}
      <section className={sectionClass}>
        <h2 className="text-lg font-bold">{t("create.section1")}</h2>
        <p className="text-sm leading-6 text-thukha-indigo/70 dark:text-white/70">
          {t("create.section1Help")}
        </p>
        <div className="flex flex-col gap-2">
          <p className="text-sm font-bold text-thukha-indigo dark:text-[#f6f7fb]">
            {t("create.samples")}
          </p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {TEXT_EXAMPLES.map((ex) => (
              <button
                key={ex.label}
                type="button"
                onClick={() => {
                  setOverlayHeadline(ex.headline);
                  setOverlaySub(ex.sub);
                }}
                className="rounded-xl bg-thukha-lilac/20 p-3 text-left ring-1 ring-thukha-lilac/50"
              >
                <span className="block text-sm font-bold text-thukha-indigo dark:text-[#f6f7fb]">{ex.label}</span>
                <span className="mt-1 block text-xs leading-5 text-thukha-indigo/70 dark:text-white/70">
                  {ex.headline} — {ex.sub}
                </span>
              </button>
            ))}
          </div>
        </div>
        <label className={labelClass}>
          {t("create.headline")}
          <input
            id="overlay-headline-input"
            value={overlayHeadline}
            onChange={(e) => setOverlayHeadline(e.target.value)}
            placeholder={t("create.headlinePlaceholder")}
            className={`${inputClass} mt-1`}
          />
        </label>
        <label className={labelClass}>
          {t("create.sub")}
          <input
            id="overlay-sub-input"
            value={overlaySub}
            onChange={(e) => setOverlaySub(e.target.value)}
            placeholder={t("create.subPlaceholder")}
            className={`${inputClass} mt-1`}
          />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className={labelClass}>
            {t("create.position")}
            <select
              value={overlayPosition}
              onChange={(e) => {
                setOverlayPosition(e.target.value as "top" | "center" | "bottom");
                setOverlayCustomHead(null);
                setOverlayCustomSub(null);
                setOverlayCustomBrand(null);
              }}
              className={`${inputClass} mt-1`}
            >
              <option value="top">{t("create.positionTop")}</option>
              <option value="center">{t("create.positionCenter")}</option>
              <option value="bottom">{t("create.positionBottom")}</option>
            </select>
          </label>
          <label className={labelClass}>
            {t("create.color")}
            <select
              value={overlayColor}
              onChange={(e) => setOverlayColor(e.target.value as "white" | "black")}
              className={`${inputClass} mt-1`}
            >
              <option value="white">{t("create.colorWhite")}</option>
              <option value="black">{t("create.colorBlack")}</option>
            </select>
          </label>
          <label className={labelClass}>
            {t("create.size")}
            <select
              value={overlaySize}
              onChange={(e) => setOverlaySize(e.target.value as "small" | "medium" | "large")}
              className={`${inputClass} mt-1`}
            >
              <option value="small">{t("create.sizeSmall")}</option>
              <option value="medium">{t("create.sizeMedium")}</option>
              <option value="large">{t("create.sizeLarge")}</option>
            </select>
          </label>
          <label className={labelClass}>
            {t("create.align")}
            <select
              value={overlayAlign}
              onChange={(e) => setOverlayAlign(e.target.value as "left" | "center" | "right")}
              className={`${inputClass} mt-1`}
            >
              <option value="left">{t("create.alignLeft")}</option>
              <option value="center">{t("create.alignCenter")}</option>
              <option value="right">{t("create.alignRight")}</option>
            </select>
          </label>
          <label className={`${labelClass} col-span-2`}>
            {t("create.font")}
            <select
              value={overlayFont}
              onChange={(e) => setOverlayFont(e.target.value as "default" | "padauk" | "serif" | "playfair")}
              className={`${inputClass} mt-1`}
            >
              <option value="default">{t("create.fontDefault")}</option>
              <option value="padauk">{t("create.fontPadauk")}</option>
              <option value="serif">{t("create.fontSerif")}</option>
              <option value="playfair">{t("create.fontPlayfair")}</option>
            </select>
          </label>
          <label className={`${labelClass} col-span-2`}>
            {t("create.bg")}
            <select
              value={overlayBg}
              onChange={(e) => setOverlayBg(e.target.value as "none" | "dark" | "light")}
              className={`${inputClass} mt-1`}
            >
              <option value="none">{t("create.bgNone")}</option>
              <option value="dark">{t("create.bgDark")}</option>
              <option value="light">{t("create.bgLight")}</option>
            </select>
          </label>
          <div className="col-span-2 flex flex-col gap-1">
            <label className="flex items-center gap-2 text-sm font-bold">
              <input
                type="checkbox"
                checked={aiWritesText}
                onChange={(e) => setAiWritesText(e.target.checked)}
                className="h-5 w-5 accent-thukha-violet"
              />
              {t("create.aiText")}
            </label>
            <p className="text-sm leading-6 text-thukha-indigo/70 dark:text-white/70">
              {t("create.aiTextHelp")}
            </p>
          </div>
        </div>
      </section>

      <section className={sectionClass}>
        <h2 className="text-lg font-bold">{t("create.section2")}</h2>
        <label className={labelClass}>
          {t("create.promptLabel")}
          <textarea value={aiPrompt} onChange={(e) => setAiPrompt(e.target.value)} rows={3} placeholder={t("create.promptPlaceholder")} className={`${inputClass} mt-1`} />
        </label>
        {/* Hidden entirely when the selected type has no examples
            (e.g. ဝန်ဆောင်မှု after its cleaning/delivery examples
            were removed 2026-11-01) — no empty heading is shown. */}
        {PROMPT_EXAMPLES.filter((ex) => ex.type === businessType).length > 0 && (
          <div className="flex flex-col gap-2">
            <p className="text-sm font-bold text-thukha-indigo dark:text-[#f6f7fb]">
              {t("create.promptExamples", { type: businessType })}
            </p>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {PROMPT_EXAMPLES.filter((ex) => ex.type === businessType).map((ex) => (
                <button key={ex.label} type="button" onClick={() => setAiPrompt(ex.prompt)} className="rounded-xl bg-thukha-lilac/20 p-3 text-left ring-1 ring-thukha-lilac/50">
                  <span className="block text-sm font-bold text-thukha-indigo dark:text-[#f6f7fb]">{ex.label}</span>
                  <span className="mt-1 block text-xs leading-5 text-thukha-indigo/70 dark:text-white/70">{ex.prompt}</span>
                </button>
              ))}
            </div>
          </div>
        )}
        <button type="button" onClick={getPromptSuggestions} disabled={suggestionsLoading} className="min-h-[44px] w-fit rounded-full border-2 border-thukha-violet px-6 py-2 text-sm font-bold text-thukha-violet dark:text-thukha-lilac disabled:opacity-50">
          {suggestionsLoading ? t("create.suggestionsLoading") : t("create.suggestionsButton")}
        </button>
        {promptSuggestions.length > 0 && (
          <div className="flex flex-col gap-2">
            <p className="text-sm font-bold text-thukha-indigo dark:text-[#f6f7fb]">{t("create.suggestionsHelp")}</p>
            {promptSuggestions.map((s) => (
              <button key={s.slice(0, 40)} type="button" onClick={() => setAiPrompt(s)} className="rounded-xl bg-thukha-lilac/20 p-3 text-left text-sm leading-6 text-thukha-indigo dark:text-[#f6f7fb] ring-1 ring-thukha-lilac/50">
                {s}
              </button>
            ))}
          </div>
        )}
        <label className={labelClass}>
          {t("create.refLabel")}
          <input type="file" accept="image/*" multiple onChange={addReferenceImages} className={`${inputClass} mt-1`} />
        </label>
        {referenceImages.length > 0 && (
          <div className="grid grid-cols-3 gap-3">
            {referenceImages.map((url, i) => (
              <div key={url.slice(-32) + i} className="relative overflow-hidden rounded-2xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt={`${t("create.refAlt")} ${i + 1}`} className="h-24 w-full object-cover sm:h-28" />
                <button type="button" onClick={() => setReferenceImages((prev) => prev.filter((_, j) => j !== i))} aria-label={t("create.refRemove")} className="absolute right-1 top-1 flex h-8 w-8 items-center justify-center rounded-full bg-thukha-indigo text-white">
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
        <p className="text-sm text-thukha-indigo/60 dark:text-white/60">
          {t("create.refWarning")}
        </p>
        {imageProvider === "cloudflare" && (
          <p className="rounded-xl bg-teal-50 dark:bg-teal-950 p-3 text-sm leading-6 text-teal-900 dark:text-teal-100 ring-1 ring-teal-200 dark:ring-teal-800">
            {t("create.freeMode")}
          </p>
        )}
        {imageProvider === "cloudflare" && referenceImages.length > 0 && (
          <p className="rounded-xl bg-amber-50 dark:bg-amber-950 p-3 text-sm leading-6 text-amber-900 dark:text-amber-100 ring-1 ring-amber-300 dark:ring-amber-800">
            {t("create.freeModeRefWarning")}
          </p>
        )}
        {!isGuest && (
          <p className="text-sm leading-6 text-thukha-indigo dark:text-[#f6f7fb]">
            {isUnlimited
              ? t("create.costNoteAdmin")
              : t("create.costNote", { cost })}
          </p>
        )}
        {isGuest && !guestUsedUp && (
          <p className="text-sm leading-6 text-thukha-indigo/70 dark:text-white/70">
            {t("create.guestLimitNote")}
          </p>
        )}
        {guestUsedUp ? (
          <>
            <p className="rounded-xl bg-amber-50 dark:bg-amber-950 p-4 text-sm leading-6 text-amber-900 dark:text-amber-100 ring-1 ring-amber-300 dark:ring-amber-800">
              {t("create.guestLimitUsed")}
            </p>
            <a href="/login" className="flex min-h-[44px] items-center justify-center rounded-full bg-thukha-violet px-6 py-3 font-bold text-white">
              {t("create.guestLimitCta")}
            </a>
          </>
        ) : (
          <button type="button" onClick={generateAi} disabled={aiLoading} className="min-h-[44px] rounded-full bg-gradient-to-r from-thukha-violet to-thukha-lilac px-6 py-3 font-bold text-white shadow-lg shadow-thukha-violet/30 disabled:opacity-50 disabled:animate-pulse">
            {aiLoading ? t("create.generateLoading") : isUnlimited ? t("create.generateAdmin") : isGuest ? t("create.generateGuest") : t("create.generate", { cost })}
          </button>
        )}
        {aiError && (
          <div className="rounded-xl bg-amber-50 dark:bg-amber-950 p-4 text-sm leading-6 text-amber-900 dark:text-amber-100 ring-1 ring-amber-300 dark:ring-amber-800">
            <p className="font-bold">{aiError}</p>
            {aiError.includes("Token") ? (
              <>
                <p className="mt-1">{t("create.tokenOut")}</p>
                {serverTokens === null ? (
                  <button type="button" onClick={refillTestTokens} className="mt-2 min-h-[44px] rounded-full bg-thukha-violet px-6 py-2 font-bold text-white">
                    {t("create.refillTest")}
                  </button>
                ) : (
                  <p className="mt-1">{t("create.serverTokenNote")}</p>
                )}
              </>
            ) : null}
          </div>
        )}
      </section>

        </div>
        <aside className="lg:sticky lg:top-24">
      <section className={sectionClass}>
        <h2 className="text-lg font-bold">{t("create.preview")}</h2>
        <p className="text-sm leading-6 text-thukha-indigo dark:text-[#f6f7fb]">
          <b>{t("create.previewFree")}</b> {t("create.previewFreeHelp")}
        </p>
        {isGuest && (
          <p className="rounded-xl bg-amber-50 dark:bg-amber-950 p-4 text-sm leading-6 text-amber-900 dark:text-amber-100 ring-1 ring-amber-300 dark:ring-amber-800">
            {t("create.previewGuest")} {t("create.previewGuestHelp")}{" "}
            <a href="/login" className="font-bold text-thukha-violet dark:text-thukha-lilac">{t("create.previewGuestLogin")}</a>.
          </p>
        )}
        <div ref={previewRef} onContextMenu={(e) => { if (isGuest) e.preventDefault(); }} className="relative mx-auto w-full max-w-[480px] select-none">
          {selected ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={selected} src={selected} alt={t("create.previewAlt")} draggable={false} onContextMenu={(e) => { if (isGuest) e.preventDefault(); }} className="anim-fade-in w-full rounded-2xl shadow-xl shadow-thukha-violet/30" />
          ) : (
            <div className="flex aspect-square w-full items-center justify-center rounded-2xl bg-gradient-to-br from-thukha-violet to-thukha-lilac p-6 text-center font-bold text-white shadow-xl shadow-thukha-violet/30">
              {overlayHeadline.trim() || overlaySub.trim()
                ? t("create.previewPlaceholderBg")
                : t("create.previewPlaceholderNoImage")}
            </div>
          )}
              {/* AI-text mode: hide browser layers once an AI image
                  exists (text already in it); before generation
                  and in Overlay mode, layers show as before. */}
              {(!aiWritesText || !selected) && (
              <>
              {/* Separate layers: headline and subheadline are two
                  independent draggable elements, one by one. Each
                  uses the same anchor model as the canvas download:
                  default anchors straddle the select position, a
                  dragged line uses its own % anchor instead. */}
              {(() => {
                const centerPct = overlayPosition === "top" ? 15 : overlayPosition === "bottom" ? 85 : 50;
                const offsetPct =
                  overlayHeadline.trim() && overlaySub.trim()
                    ? overlaySize === "small"
                      ? 8
                      : overlaySize === "large"
                        ? 16
                        : 11
                    : 0;
                const alignX = overlayAlign === "left" ? "0" : overlayAlign === "right" ? "-100%" : "-50%";
                const bgColor =
                  overlayBg === "dark"
                    ? "rgba(0,0,0,0.45)"
                    : overlayBg === "light"
                      ? "rgba(255,255,255,0.65)"
                      : "transparent";
                const layer = (
                  which: "head" | "sub" | "brand",
                  custom: { x: number; y: number } | null,
                  defaultY: number,
                  content: ReactNode,
                ) => (
                  <div
                    onPointerDown={onOverlayPointerDown(which)}
                    onPointerMove={onOverlayPointerMove}
                    onPointerUp={onOverlayPointerUp}
                    onPointerCancel={onOverlayPointerUp}
                    onDoubleClick={() => {
                      // Edit from the preview itself (free, no token):
                      // jump to the matching section-1 input and focus it.
                      const el = document.getElementById(
                        which === "head" ? "overlay-headline-input" : which === "sub" ? "overlay-sub-input" : "business-name-input",
                      );
                      el?.scrollIntoView({ behavior: "smooth", block: "center" });
                      (el as HTMLInputElement | null)?.focus();
                    }}
                    className="absolute cursor-grab px-4 active:cursor-grabbing"
                    style={{
                      fontFamily: overlayFontStack,
                      color: overlayColor,
                      textAlign: overlayAlign,
                      textShadow: "0 2px 8px rgba(0,0,0,0.75)",
                      touchAction: "none",
                      left: custom
                        ? `${custom.x}%`
                        : overlayAlign === "left"
                          ? "0%"
                          : overlayAlign === "right"
                            ? "100%"
                            : "50%",
                      top: custom ? `${custom.y}%` : `${defaultY}%`,
                      transform: `translate(${alignX}, -50%)`,
                    }}
                  >
                    <span className="inline-block rounded-xl px-3 py-2" style={{ backgroundColor: bgColor }}>
                      {content}
                    </span>
                  </div>
                );
                return (
                  <>
                    {overlayHeadline.trim() &&
                      layer(
                        "head",
                        overlayCustomHead,
                        centerPct - offsetPct / 2,
                        <p
                          className={`font-bold leading-snug ${
                            overlaySize === "small"
                              ? "text-xl sm:text-2xl"
                              : overlaySize === "large"
                                ? "text-4xl sm:text-5xl"
                                : "text-2xl sm:text-3xl"
                          }`}
                        >
                          {overlayHeadline}
                        </p>,
                      )}
                    {showBrandName && businessName.trim() &&
                      layer(
                        "brand",
                        overlayCustomBrand,
                        92,
                        <p className="font-bold leading-snug text-lg sm:text-xl">
                          {businessName}
                        </p>,
                      )}
                    {overlaySub.trim() &&
                      layer(
                        "sub",
                        overlayCustomSub,
                        centerPct + offsetPct / 2,
                        <p
                          className={`leading-snug ${
                            overlaySize === "small" ? "text-sm" : overlaySize === "large" ? "text-xl" : "text-base"
                          }`}
                        >
                          {overlaySub}
                        </p>,
                      )}
                  </>
                );
              })()}
              </>)}
          {selected && isGuest && (
            <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl">
              <div className="absolute inset-x-0 top-0 bg-black/60 py-2 text-center text-xs font-bold text-white">
                {t("create.guestWatermark")}
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="whitespace-nowrap text-2xl font-black text-white/70 sm:text-3xl" style={{ transform: "rotate(-25deg)", textShadow: "0 2px 12px rgba(0,0,0,0.8)" }}>
                  ThuKha Preview
                </span>
              </div>
            </div>
          )}
        </div>
        {!selected && (overlayHeadline.trim() || overlaySub.trim()) && (
          <p className="text-sm leading-6 text-thukha-indigo dark:text-[#f6f7fb]">
            {t("create.dragHelp")}
          </p>
        )}
        {!selected && (overlayCustomHead || overlayCustomSub) && (
          <button
            type="button"
            onClick={() => {
              setOverlayCustomHead(null);
              setOverlayCustomSub(null);
              setOverlayCustomBrand(null);
            }}
            className="min-h-[44px] w-fit rounded-full border-2 border-thukha-violet px-6 py-2 text-sm font-bold text-thukha-violet dark:text-thukha-lilac"
          >
            {t("create.dragReset")}
          </button>
        )}
        {selected ? (
          <>
            {(overlayHeadline.trim() || overlaySub.trim()) && (
              <p className="text-sm leading-6 text-thukha-indigo dark:text-[#f6f7fb]">
                {t("create.layersHelp")}
              </p>
            )}
            {(overlayCustomHead || overlayCustomSub) && (
              <button
                type="button"
                onClick={() => {
                  setOverlayCustomHead(null);
                  setOverlayCustomSub(null);
                }}
                className="min-h-[44px] w-fit rounded-full border-2 border-thukha-violet px-6 py-2 text-sm font-bold text-thukha-violet dark:text-thukha-lilac"
              >
                {t("create.dragResetFull")}
              </button>
            )}
            {isGuest ? (
              <>
                <a href="/login" className="flex min-h-[44px] items-center justify-center rounded-full bg-thukha-violet px-6 py-3 font-bold text-white">
                  {t("create.downloadLoginCta")}
                </a>
              </>
            ) : (
              <>
                <button type="button" onClick={downloadWithText} className="min-h-[44px] rounded-full bg-thukha-violet px-6 py-3 font-bold text-white">
                  {t("create.downloadWithText")}
                </button>
                {overlayMessage && <p className="text-sm leading-6 text-thukha-indigo dark:text-[#f6f7fb]">{overlayMessage}</p>}
                <a href={selected} download="thukha-ai.png" className="flex min-h-[44px] items-center justify-center rounded-full border-2 border-thukha-violet px-6 py-3 font-bold text-thukha-violet dark:text-thukha-lilac">
                  {t("create.downloadWithoutText")}
                </a>
              </>
            )}
            <button type="button" onClick={saveDesign} className="min-h-[44px] rounded-full border-2 border-thukha-violet px-6 py-3 font-bold text-thukha-violet dark:text-thukha-lilac">
              {t("create.saveDesign")}
            </button>
            {savedMessage && <p className="text-sm leading-6 text-thukha-indigo dark:text-[#f6f7fb]">{savedMessage}</p>}
          </>
        ) : null}
        {aiImages.length > 1 && (
          <div className="grid grid-cols-4 gap-3">
            {aiImages.map((url, i) => (
              <button key={url.slice(-32) + i} type="button" onClick={() => setSelected(url)} className={`overflow-hidden rounded-2xl ring-2 ${selected === url ? "ring-thukha-violet" : "ring-thukha-lilac/40"}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt={`${t("create.historyAlt")} ${i + 1}`} className="h-20 w-full object-cover sm:h-24" />
              </button>
            ))}
          </div>
        )}
      </section>
        </aside>
      </div>
    </main>
  );
}
