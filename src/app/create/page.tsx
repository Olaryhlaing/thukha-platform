"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import type { ChangeEvent, PointerEvent as ReactPointerEvent, ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import { START_TOKENS, GUEST_START_TOKENS, GUEST_MAX_GENERATIONS, tokenCost } from "@/lib/tokens";
import { TEMPLATES } from "@/lib/templates";
import { getSupabase } from "@/lib/supabase/client";
import { useLanguage } from "@/components/LanguageProvider";
import { serverErrorText } from "@/lib/i18n";

const BUSINESS_TYPES = [
  "စားသောက်ဆိုင်",
  "Online shop",
  "အလှအပ",
  "ဝန်ဆောင်မှု",
  "Agency",
  "အခြား",
];

const GOALS = ["ရောင်းအား တိုးရန်", "Brand သိစေရန်", "Promotion ကြေညာရန်"];

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

const TEXT_EXAMPLES = [
  { label: "Condo — ရောင်းမည်", headline: "Condo အသစ် ရောင်းမည်", sub: "မြို့လယ်နေရာ • အခန်းကျယ်ကျယ်" },
  { label: "လျှော့စျေး", headline: "50% လျှော့စျေး", sub: "ဒီအပတ်ပဲ ရမယ်" },
  { label: "စားသောက်ဆိုင်", headline: "မုန့်ဟင်းခါး အထူး", sub: "မနက်တိုင်း လတ်လတ်ဆတ်ဆတ်" },
  { label: "Online shop", headline: "အဝတ်အစား အသစ်ရောက်ပြီ", sub: "ပို့ခ အခမဲ့" },
  { label: "အလှအပ", headline: "Salon အထူး Promotion", sub: "ဒီအပတ်ပဲ • ကြိုတင်စာရင်းပေးပါ" },
  { label: "ကော်ဖီဆိုင်", headline: "ကော်ဖီ အသစ်", sub: "မနက်ခင်းကို အရသာနဲ့ စတင်ပါ" },
];

const inputClass =
  "w-full rounded-xl border border-thukha-lilac/40 bg-white/90 dark:bg-[#1b1c48]/90 px-3.5 py-2.5 text-base text-thukha-indigo dark:text-[#f6f7fb] outline-none transition-all duration-200 focus:border-thukha-violet focus:ring-4 focus:ring-thukha-violet/20 focus:shadow-[0_0_15px_rgba(89,70,237,0.2)]";
const labelClass = "text-xs font-bold uppercase tracking-wider text-thukha-indigo dark:text-[#f6f7fb]";
const sectionClass =
  "gradient-border-top flex flex-col gap-5 rounded-3xl border border-thukha-lilac/30 bg-white/80 dark:bg-thukha-indigo/70 p-5 shadow-lg backdrop-blur-xl transition-all duration-300 hover:shadow-xl sm:p-6";

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
  const [tokens, setTokens] = useState(() => {
    if (typeof window === "undefined") return GUEST_START_TOKENS;
    const stored = Number(localStorage.getItem("thukha-tokens"));
    if (!Number.isFinite(stored) || stored < 0) return GUEST_START_TOKENS;
    return Math.min(stored, GUEST_START_TOKENS);
  });
  const [guestGenerations, setGuestGenerations] = useState(() => {
    if (typeof window === "undefined") return 0;
    const stored = Number(localStorage.getItem("thukha-guest-generations"));
    return Number.isFinite(stored) && stored > 0 ? Math.floor(stored) : 0;
  });
  const [promptSuggestions, setPromptSuggestions] = useState<string[]>([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [serverTokens, setServerTokens] = useState<number | null>(null);
  const [serverTotal, setServerTotal] = useState<number | null>(null);
  const [isUnlimited, setIsUnlimited] = useState(false);
  const [isSuspended, setIsSuspended] = useState(false);
  type Ann = { id: string; title: string; body: string; created_at?: string };
  const [announcements, setAnnouncements] = useState<Ann[]>([]);
  const [dismissedAnns, setDismissedAnns] = useState<Set<string>>(new Set());
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [imageProvider, setImageProvider] = useState<string>("");
  const [overlayHeadline, setOverlayHeadline] = useState("");
  const [overlaySub, setOverlaySub] = useState("");
  const [overlayPosition, setOverlayPosition] = useState<"top" | "center" | "bottom">("top");
  const [overlayColor, setOverlayColor] = useState<"white" | "black">("white");
  const [overlaySize, setOverlaySize] = useState<"small" | "medium" | "large">("medium");
  const [overlayAlign, setOverlayAlign] = useState<"left" | "center" | "right">("center");
  const [overlayBg, setOverlayBg] = useState<"none" | "dark" | "light">("none");
  const [overlayFont, setOverlayFont] = useState<"default" | "padauk" | "serif" | "playfair">("padauk");
  const [aiWritesText, setAiWritesText] = useState(true);
  const overlayFontStack =
    overlayFont === "padauk"
      ? '"Padauk", "Noto Sans Myanmar", sans-serif'
      : overlayFont === "serif"
        ? '"Noto Serif Myanmar", Georgia, serif'
        : overlayFont === "playfair"
          ? '"Playfair Display", "Noto Sans Myanmar", serif'
          : '"Noto Sans Myanmar", Inter, sans-serif';
  const [overlayCustomHead, setOverlayCustomHead] = useState<{ x: number; y: number } | null>(null);
  const [overlayCustomSub, setOverlayCustomSub] = useState<{ x: number; y: number } | null>(null);
  const [showBrandName, setShowBrandName] = useState(true);
  const [overlayCustomBrand, setOverlayCustomBrand] = useState<{ x: number; y: number } | null>(null);

  // Brand preset + Logo upload inside /create (Batch 3B):
  // logo is drawn by the browser (never AI), preserving natural
  // aspect ratio, draggable on preview, and composited on PNG export.
  type BrandPreset = {
    id: string;
    name: string;
    business_type: string | null;
    logo_url?: string | null;
  };
  const [brandPresets, setBrandPresets] = useState<BrandPreset[]>(() => {
    if (typeof window === "undefined" || getSupabase()) return [];
    try {
      return JSON.parse(localStorage.getItem("thukha-brands") ?? "[]") as BrandPreset[];
    } catch {
      return [];
    }
  });
  const [selectedBrandId, setSelectedBrandId] = useState("");
  const [logoSrc, setLogoSrc] = useState("");
  const [logoSize, setLogoSize] = useState<"small" | "medium" | "large">("medium");
  const [overlayCustomLogo, setOverlayCustomLogo] = useState<{ x: number; y: number } | null>(null);
  const [brandMessage, setBrandMessage] = useState("");
  const [savingBrand, setSavingBrand] = useState(false);

  const previewRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<{
    pointerId: number;
    which: "head" | "sub" | "brand" | "logo";
    startX: number;
    startY: number;
    startPos: { x: number; y: number };
  } | null>(null);

  function defaultCustomPos(which: "head" | "sub" | "brand" | "logo"): { x: number; y: number } {
    if (which === "logo") return { x: 16, y: 14 };
    const baseY = which === "brand" ? 92 : overlayPosition === "top" ? 15 : overlayPosition === "bottom" ? 85 : 50;
    return {
      x: overlayAlign === "left" ? 10 : overlayAlign === "right" ? 90 : 50,
      y: which === "sub" ? Math.min(100, baseY + 12) : baseY,
    };
  }

  function onOverlayPointerDown(which: "head" | "sub" | "brand" | "logo") {
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
          (which === "head"
            ? overlayCustomHead
            : which === "sub"
              ? overlayCustomSub
              : which === "brand"
                ? overlayCustomBrand
                : overlayCustomLogo) ?? defaultCustomPos(which),
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
    else if (drag.which === "logo") setOverlayCustomLogo(pos);
    else setOverlayCustomBrand(pos);
  }

  function onOverlayPointerUp(e: ReactPointerEvent<HTMLDivElement>) {
    if (dragRef.current?.pointerId === e.pointerId) dragRef.current = null;
  }
  const [overlayMessage, setOverlayMessage] = useState("");
  const [savedMessage, setSavedMessage] = useState("");
  const [savingDesign, setSavingDesign] = useState(false);
  const [captionOptions, setCaptionOptions] = useState<string[]>([]);
  const [captionHashtags, setCaptionHashtags] = useState<string[]>([]);
  const [captionLoading, setCaptionLoading] = useState(false);
  const [captionMsg, setCaptionMsg] = useState("");
  const [copiedCaption, setCopiedCaption] = useState<string | null>(null);

  const channelInfo = CHANNELS.find((c) => c.id === channel) ?? CHANNELS[0];
  const cost = tokenCost({
    prompt: aiPrompt,
    format: channelInfo.format,
    referenceCount: referenceImages.length,
  });
  const effectiveTokens = isUnlimited ? Number.POSITIVE_INFINITY : (serverTokens ?? tokens);
  const isGuest = !authToken;
  const guestUsedUp = isGuest && !isUnlimited && guestGenerations >= GUEST_MAX_GENERATIONS;

  useEffect(() => {
    fetch("/api/generate-background")
      .then((res) => res.json())
      .then((json) => {
        if (typeof json.provider === "string") setImageProvider(json.provider);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch("/api/announcements")
      .then((res) => res.json())
      .then((json) => {
        if (Array.isArray(json.announcements)) setAnnouncements(json.announcements);
      })
      .catch(() => {});
  }, []);

  const [tokenMsg, setTokenMsg] = useState("");
  const [tokenRefreshing, setTokenRefreshing] = useState(false);
  async function loadServerTokens() {
    const supabase = getSupabase();
    if (!supabase) return;
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token ?? null;
    setAuthToken(token);
    if (!token) return;
    try {
      const res = await fetch("/api/tokens", {
        headers: { Authorization: `Bearer ${token}` },
      });
      let json: { mode?: string; balance?: number; total?: number; unlimited?: boolean; reason?: string; error?: string };
      try {
        json = (await res.json()) as typeof json;
      } catch {
        setTokenMsg(`${t("create.tokenRefreshFailed")} (HTTP ${res.status}, response not JSON)`);
        return;
      }
      if (!res.ok) {
        setTokenMsg(`${t("create.tokenRefreshFailed")} (HTTP ${res.status}${json.error ? `: ${json.error}` : ""})`);
        return;
      }
      if (json.mode === "server" && json.unlimited) {
        setIsUnlimited(true);
        setTokenMsg("");
      } else if (json.mode === "server" && typeof json.balance === "number") {
        setServerTokens(json.balance);
        if (typeof json.total === "number") setServerTotal(json.total);
        setIsSuspended((json as { suspended?: boolean }).suspended ?? false);
        setTokenMsg("");
      } else {
        setTokenMsg(`${t("create.tokenGuestMode")} (${json.reason ?? "unknown"})`);
      }
    } catch {
      setTokenMsg(t("create.tokenRefreshFailed"));
    }
  }
  async function refreshTokens() {
    setTokenRefreshing(true);
    setTokenMsg("");
    await loadServerTokens();
    setTokenRefreshing(false);
    setTokenMsg((prev) => (prev ? prev : t("create.tokenRefreshed")));
  }
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadServerTokens();
    const onVisible = () => {
      if (!document.hidden) loadServerTokens();
    };
    window.addEventListener("focus", loadServerTokens);
    window.addEventListener("pageshow", loadServerTokens);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.removeEventListener("focus", loadServerTokens);
      window.removeEventListener("pageshow", loadServerTokens);
      document.removeEventListener("visibilitychange", onVisible);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load saved brand presets (cloud when logged in, localStorage for guests).
  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) return;
    supabase.auth.getSession().then(async ({ data }) => {
      const token = data.session?.access_token;
      if (!token) {
        try {
          setBrandPresets(JSON.parse(localStorage.getItem("thukha-brands") ?? "[]") as BrandPreset[]);
        } catch {
          setBrandPresets([]);
        }
        return;
      }
      try {
        const res = await fetch("/api/brands", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = (await res.json()) as { brands?: BrandPreset[] };
        if (res.ok && Array.isArray(json.brands)) setBrandPresets(json.brands);
      } catch {
        // Brand presets are optional — /create still works without them.
      }
    });
  }, []);

  function selectBrandPreset(id: string) {
    setSelectedBrandId(id);
    setBrandMessage("");
    const found = brandPresets.find((b) => b.id === id);
    if (!found) return;
    setBusinessName(found.name);
    if (found.business_type && BUSINESS_TYPES.includes(found.business_type)) {
      setBusinessType(found.business_type);
    }
    setLogoSrc(found.logo_url ?? "");
  }

  function handleLogoUpload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setBrandMessage(t("create.logoInvalidType"));
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setBrandMessage(t("create.logoTooLarge"));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setLogoSrc(String(reader.result ?? ""));
      setBrandMessage("");
    };
    reader.readAsDataURL(file);
  }

  async function saveBrandPreset() {
    const trimmed = businessName.trim();
    if (!trimmed) {
      setBrandMessage(t("create.brandPresetNeedName"));
      return;
    }
    setSavingBrand(true);
    setBrandMessage("");
    if (authToken) {
      try {
        const res = await fetch("/api/brands", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${authToken}` },
          body: JSON.stringify({
            name: trimmed,
            businessType,
            ...(logoSrc ? { logoDataUrl: logoSrc } : {}),
          }),
        });
        const json = (await res.json()) as { brand?: BrandPreset; error?: string };
        if (!res.ok || !json.brand) {
          setBrandMessage(serverErrorText(lang, json.error) ?? t("create.brandPresetFailed"));
        } else {
          setBrandPresets((prev) => [json.brand!, ...prev]);
          setSelectedBrandId(json.brand.id);
          if (json.brand.logo_url) setLogoSrc(json.brand.logo_url);
          setBrandMessage(t("create.brandPresetSaved"));
        }
      } catch {
        setBrandMessage(t("create.brandPresetFailed"));
      } finally {
        setSavingBrand(false);
      }
      return;
    }
    try {
      const preset: BrandPreset = {
        id: `guest-brand-${Date.now()}`,
        name: trimmed,
        business_type: businessType,
        logo_url: logoSrc || null,
      };
      const next = [preset, ...brandPresets].slice(0, 15);
      localStorage.setItem("thukha-brands", JSON.stringify(next));
      setBrandPresets(next);
      setSelectedBrandId(preset.id);
      setBrandMessage(t("create.brandPresetSaved"));
    } catch {
      setBrandMessage(t("create.brandPresetFailed"));
    } finally {
      setSavingBrand(false);
    }
  }

  async function deleteBrandPreset() {
    if (!selectedBrandId) return;
    if (authToken) {
      const res = await fetch(`/api/brands?id=${encodeURIComponent(selectedBrandId)}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (!res.ok) {
        setBrandMessage(t("create.brandPresetDeleteFailed"));
        return;
      }
    } else {
      const next = brandPresets.filter((b) => b.id !== selectedBrandId);
      localStorage.setItem("thukha-brands", JSON.stringify(next));
    }
    setBrandPresets((prev) => prev.filter((b) => b.id !== selectedBrandId));
    setSelectedBrandId("");
    setBrandMessage(t("create.brandPresetDeleted"));
  }

  function spendTokens(amount: number) {
    setTokens((prev) => {
      const next = Math.max(0, prev - amount);
      localStorage.setItem("thukha-tokens", String(next));
      return next;
    });
  }

  function refillTestTokens() {
    localStorage.setItem("thukha-tokens", String(GUEST_START_TOKENS));
    setTokens(GUEST_START_TOKENS);
    setAiError("");
  }

  async function getPromptSuggestions() {
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
    if (guestUsedUp) {
      setAiError(t("create.errGuestLimit"));
      return;
    }
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
        setIsUnlimited(true);
      } else if (typeof data.serverBalance === "number") {
        setServerTokens(data.serverBalance);
      } else {
        spendTokens(data.cost ?? cost);
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

  function downloadWithText() {
    if (!selected) return;
    if (isGuest) {
      setOverlayMessage(t("create.errGuestDownload"));
      return;
    }
    if (aiWritesText && !logoSrc) {
      setOverlayMessage("");
      const a = document.createElement("a");
      a.href = selected;
      a.download = "thukha-promo.png";
      a.click();
      return;
    }
    if (!aiWritesText && !logoSrc && !overlayHeadline.trim() && !overlaySub.trim() && !(showBrandName && businessName.trim())) {
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
      if (!aiWritesText) {
        const headlineSize = Math.round(
          w * (overlaySize === "small" ? 0.07 : overlaySize === "large" ? 0.12 : 0.09),
        );
        const subSize = Math.round(headlineSize * 0.5);
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
      }

      // Composite the business logo (preserving natural aspect ratio, never stretched).
      if (logoSrc) {
        try {
          const logoImg = await new Promise<HTMLImageElement>((resolve, reject) => {
            const el = new Image();
            if (logoSrc.startsWith("http")) el.crossOrigin = "anonymous";
            el.onload = () => resolve(el);
            el.onerror = () => reject(new Error("logo load failed"));
            el.src = logoSrc;
          });
          const ratio = logoSize === "small" ? 0.11 : logoSize === "large" ? 0.22 : 0.16;
          const logoW = Math.round(w * ratio);
          const logoH = logoImg.naturalWidth > 0
            ? Math.round(logoW * (logoImg.naturalHeight / logoImg.naturalWidth))
            : logoW;
          const anchor = overlayCustomLogo ?? defaultCustomPos("logo");
          const cx = (anchor.x / 100) * w;
          const cy = (anchor.y / 100) * h;
          ctx.shadowColor = "rgba(0,0,0,0.35)";
          ctx.shadowBlur = 6;
          ctx.shadowOffsetY = 2;
          ctx.drawImage(logoImg, cx - logoW / 2, cy - logoH / 2, logoW, logoH);
        } catch {
          // Continue exporting even if an external logo fails to load.
        }
      }

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

  async function generateCaption() {
    setCaptionLoading(true);
    setCaptionMsg("");
    try {
      const res = await fetch("/api/generate-caption", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brief: {
            businessName: businessName || undefined,
            product: aiPrompt || overlayHeadline || undefined,
            goal,
            channel,
            headline: overlayHeadline || undefined,
          },
          tone: goal.includes("Promotion") ? "discount" : "friendly",
        }),
      });
      const json = (await res.json()) as { options?: string[]; hashtags?: string[] };
      if (!res.ok || !json.options) {
        setCaptionMsg(t("create.captionFailed"));
      } else {
        setCaptionOptions(json.options);
        setCaptionHashtags(json.hashtags ?? []);
      }
    } catch {
      setCaptionMsg(t("create.captionFailed"));
    }
    setCaptionLoading(false);
  }

  async function copyCaption(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedCaption(text);
    } catch {
      setCaptionMsg(t("create.captionFailed"));
    }
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
      setSavingDesign(true);
      setSavedMessage("");
      try {
        const res = await fetch("/api/designs", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${authToken}` },
          body: JSON.stringify({
            prompt: aiPrompt,
            channel,
            format: channelInfo.format,
            ...(selected ? { imageDataUrl: selected } : {}),
          }),
        });
        const json = (await res.json().catch(() => ({}))) as { error?: string };
        setSavedMessage(
          res.ok
            ? t("create.msgDesignSaved")
            : (serverErrorText(lang, json.error) ?? t("create.msgDesignSaveFailed")),
        );
      } catch {
        setSavedMessage(t("create.msgDesignSaveFailed"));
      } finally {
        setSavingDesign(false);
      }
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
      {isSuspended && (
        <p className="mb-4 rounded-2xl border border-rose-300 bg-rose-50 p-4 text-sm font-bold text-rose-900 dark:border-rose-800 dark:bg-rose-950/80 dark:text-rose-200">
          {t("create.suspendedWarning")}
        </p>
      )}
      {announcements.filter((a) => !dismissedAnns.has(a.id)).map((a) => (
        <div key={a.id} className="mb-4 flex items-start justify-between gap-3 rounded-2xl border border-thukha-violet/30 bg-violet-50 p-4 dark:border-white/10 dark:bg-white/5">
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-thukha-violet dark:text-thukha-lilac">{t("create.announcement")}</p>
            <p className="mt-1 font-bold">{a.title}</p>
            <p className="text-sm leading-6">{a.body}</p>
          </div>
          <button type="button" onClick={() => setDismissedAnns((prev) => new Set(prev).add(a.id))} aria-label="Dismiss" className="shrink-0 rounded-full border border-thukha-violet/30 px-3 py-1 text-xs font-bold">
            ✕
          </button>
        </div>
      ))}
      <header className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-thukha-violet via-[#7c3aed] to-[#2563eb] p-6 text-white shadow-xl shadow-thukha-violet/25 sm:p-8">
        <div
          className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-gradient-to-br from-pink-500/30 to-thukha-teal/30 blur-2xl animate-thu-aurora-spin"
          style={{ animationDuration: "20s" }}
        />
        <div className="relative z-10 flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="pulsing-dot h-2 w-2 rounded-full bg-emerald-400" />
            <span className="text-xs font-black tracking-widest uppercase text-white/90">Creative AI Studio</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight sm:text-3xl">{t("create.title")}</h1>
          <p className="max-w-2xl text-sm leading-relaxed text-white/90 sm:text-base">
            {t("create.subtitle")}
          </p>
          {!isGuest && (
            <div className="mt-1 flex items-center gap-2">
              <span suppressHydrationWarning className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/15 px-4 py-1 text-xs font-bold text-white backdrop-blur-md shadow-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
                {isUnlimited
                  ? t("create.tokenPillUnlimited")
                  : t("create.tokenPill", { tokens: effectiveTokens, start: Math.max(serverTotal ?? START_TOKENS, effectiveTokens), mode: t("create.modeServer"), provider: imageProvider === "cloudflare" ? t("create.providerCloudflare") : t("create.providerGemini") })}
              </span>
              <button
                type="button"
                onClick={refreshTokens}
                disabled={tokenRefreshing}
                className="inline-flex min-h-[28px] items-center rounded-full border border-white/30 bg-white/15 px-3 py-1 text-xs font-bold text-white disabled:opacity-50"
              >
                {tokenRefreshing ? t("create.tokenRefreshing") : `↻ ${t("create.tokenRefresh")}`}
              </button>
            </div>
          )}
          {tokenMsg && (
            <p className="mt-2 text-xs font-semibold text-white/90">{tokenMsg}</p>
          )}
        </div>
      </header>

      <div className="mt-6 grid grid-cols-1 items-start gap-6 lg:grid-cols-[1fr_420px]">
        <div className="flex flex-col gap-6">
      <section className={sectionClass}>
        <h2 className="text-lg font-bold">{t("create.business")}</h2>
        {/* Brand Preset bar inside /create (no separate /brands page) */}
        <div className="flex flex-col gap-2 rounded-2xl border border-thukha-lilac/30 bg-thukha-lilac/10 p-3.5 dark:border-white/10 dark:bg-white/5">
          <label className={labelClass}>
            {t("create.brandPresetLabel")}
            <div className="mt-1 flex flex-wrap gap-2">
              <select
                value={selectedBrandId}
                onChange={(e) => selectBrandPreset(e.target.value)}
                className={`${inputClass} min-w-0 flex-1`}
              >
                <option value="">{t("create.brandPresetNone")}</option>
                {brandPresets.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}{b.business_type ? ` (${b.business_type})` : ""}
                  </option>
                ))}
              </select>
              {selectedBrandId && (
                <button
                  type="button"
                  onClick={deleteBrandPreset}
                  className="min-h-[44px] rounded-xl bg-rose-50 px-4 py-2 text-xs font-bold text-rose-700 hover:bg-rose-600 hover:text-white dark:bg-rose-950/60 dark:text-rose-300"
                >
                  {t("common.delete")}
                </button>
              )}
            </div>
          </label>
        </div>
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
        {/* Business Logo Upload (browser-composited, never redrawn by AI) */}
        <div className="flex flex-col gap-2">
          <label className={labelClass}>
            {t("create.logoLabel")}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleLogoUpload}
              className={`${inputClass} mt-1`}
            />
          </label>
          {logoSrc && (
            <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-thukha-lilac/30 bg-white/60 p-3 dark:border-white/10 dark:bg-white/5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={logoSrc} alt="Logo" className="h-12 w-12 rounded-xl object-contain bg-white/80 p-1 shadow-sm" />
              <label className="text-xs font-bold text-thukha-indigo dark:text-[#f6f7fb]">
                {t("create.logoSizeLabel")}
                <select
                  value={logoSize}
                  onChange={(e) => setLogoSize(e.target.value as "small" | "medium" | "large")}
                  className="ml-2 rounded-lg border border-thukha-lilac/40 bg-white px-2.5 py-1.5 text-xs font-bold dark:bg-[#1b1c48]"
                >
                  <option value="small">{t("create.sizeSmall")}</option>
                  <option value="medium">{t("create.sizeMedium")}</option>
                  <option value="large">{t("create.sizeLarge")}</option>
                </select>
              </label>
              <button
                type="button"
                onClick={() => {
                  setLogoSrc("");
                  setOverlayCustomLogo(null);
                }}
                className="ml-auto min-h-[36px] rounded-xl bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-600 hover:text-white dark:bg-rose-950/60 dark:text-rose-300"
              >
                {t("create.logoRemove")}
              </button>
            </div>
          )}
          <p className="text-xs leading-5 text-thukha-indigo/65 dark:text-white/65">{t("create.logoHelp")}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={saveBrandPreset}
            disabled={savingBrand}
            className="min-h-[42px] w-fit rounded-full border-2 border-thukha-violet px-5 py-2 text-xs font-bold text-thukha-violet transition-colors hover:bg-thukha-violet hover:text-white disabled:opacity-50 dark:text-thukha-lilac"
          >
            {savingBrand ? t("create.savingDesign") : t("create.brandPresetSave")}
          </button>
          {brandMessage && <span className="text-xs font-semibold text-thukha-indigo dark:text-white">{brandMessage}</span>}
        </div>
        <label className={labelClass}>
          {t("create.channel")}
          <select value={channel} onChange={(e) => setChannel(e.target.value)} className={`${inputClass} mt-1`}>
            {CHANNELS.map((c) => (
              <option key={c.id}>{c.id}</option>
            ))}
          </select>
        </label>
      </section>

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
                className="group rounded-2xl border border-thukha-lilac/30 bg-thukha-lilac/10 p-3.5 text-left transition-all duration-200 hover:border-thukha-violet hover:bg-white hover:shadow-md hover:scale-[1.01] active:scale-[0.99] dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
              >
                <span className="block text-sm font-bold text-thukha-indigo transition-colors group-hover:text-thukha-violet dark:text-[#f6f7fb] dark:group-hover:text-thukha-lilac">{ex.label}</span>
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
        {PROMPT_EXAMPLES.filter((ex) => ex.type === businessType).length > 0 && (
          <div className="flex flex-col gap-2">
            <p className="text-sm font-bold text-thukha-indigo dark:text-[#f6f7fb]">
              {t("create.promptExamples", { type: businessType })}
            </p>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {PROMPT_EXAMPLES.filter((ex) => ex.type === businessType).map((ex) => (
                <button
                  key={ex.label}
                  type="button"
                  onClick={() => setAiPrompt(ex.prompt)}
                  className="group rounded-2xl border border-thukha-lilac/30 bg-thukha-lilac/10 p-3.5 text-left transition-all duration-200 hover:border-thukha-violet hover:bg-white hover:shadow-md hover:scale-[1.01] active:scale-[0.99] dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
                >
                  <span className="block text-sm font-bold text-thukha-indigo transition-colors group-hover:text-thukha-violet dark:text-[#f6f7fb] dark:group-hover:text-thukha-lilac">{ex.label}</span>
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
          <button
            type="button"
            onClick={generateAi}
            disabled={aiLoading || isSuspended}
            className="colorful-btn-gradient shimmer-hover min-h-[50px] w-full rounded-2xl px-8 py-3.5 text-base font-black text-white shadow-xl shadow-thukha-violet/30 disabled:opacity-50"
          >
            {aiLoading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                {t("create.generateLoading")}
              </span>
            ) : isUnlimited ? (
              `⚡ ${t("create.generateAdmin")}`
            ) : isGuest ? (
              `⚡ ${t("create.generateGuest")}`
            ) : (
              `⚡ ${t("create.generate", { cost })}`
            )}
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
        <div
          ref={previewRef}
          onContextMenu={(e) => { if (isGuest) e.preventDefault(); }}
          className={`relative mx-auto w-full max-w-[480px] select-none rounded-2xl transition-all duration-300 ${
            aiLoading ? "ring-4 ring-thukha-violet/60 shadow-[0_0_35px_rgba(89,70,237,0.45)] animate-pulse" : ""
          }`}
        >
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
          {/* Draggable Business Logo layer (always browser-drawn, never AI) */}
          {logoSrc && (() => {
            const pos = overlayCustomLogo ?? defaultCustomPos("logo");
            const widthClass = logoSize === "small" ? "w-12 sm:w-14" : logoSize === "large" ? "w-24 sm:w-28" : "w-16 sm:w-20";
            return (
              <div
                onPointerDown={onOverlayPointerDown("logo")}
                onPointerMove={onOverlayPointerMove}
                onPointerUp={onOverlayPointerUp}
                onPointerCancel={onOverlayPointerUp}
                className="absolute z-10 cursor-grab active:cursor-grabbing"
                style={{
                  left: `${pos.x}%`,
                  top: `${pos.y}%`,
                  transform: "translate(-50%, -50%)",
                  touchAction: "none",
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={logoSrc}
                  alt="Brand Logo"
                  draggable={false}
                  className={`${widthClass} h-auto rounded-lg object-contain drop-shadow-md`}
                />
              </div>
            );
          })()}
              {(!aiWritesText || !selected) && (
              <>
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
        {!selected && (overlayCustomHead || overlayCustomSub || overlayCustomBrand || overlayCustomLogo) && (
          <button
            type="button"
            onClick={() => {
              setOverlayCustomHead(null);
              setOverlayCustomSub(null);
              setOverlayCustomBrand(null);
              setOverlayCustomLogo(null);
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
            {(overlayCustomHead || overlayCustomSub || overlayCustomBrand || overlayCustomLogo) && (
              <button
                type="button"
                onClick={() => {
                  setOverlayCustomHead(null);
                  setOverlayCustomSub(null);
                  setOverlayCustomBrand(null);
                  setOverlayCustomLogo(null);
                }}
                className="min-h-[44px] w-fit rounded-full border-2 border-thukha-violet px-6 py-2 text-sm font-bold text-thukha-violet dark:text-thukha-lilac"
              >
                {t("create.dragResetFull")}
              </button>
            )}
            {isGuest ? (
              <>
                <a href="/login" className="colorful-btn-gradient shimmer-hover flex min-h-[46px] items-center justify-center rounded-xl px-6 py-3 font-bold text-white shadow-md">
                  {t("create.downloadLoginCta")}
                </a>
              </>
            ) : (
              <>
                <button type="button" onClick={downloadWithText} className="colorful-btn-gradient shimmer-hover min-h-[46px] rounded-xl px-6 py-3 font-bold text-white shadow-lg">
                  {t("create.downloadWithText")}
                </button>
                {overlayMessage && <p className="anim-scale-in text-sm leading-6 text-thukha-indigo dark:text-[#f6f7fb]">{overlayMessage}</p>}
                <a href={selected} download="thukha-ai.png" className="flex min-h-[44px] items-center justify-center rounded-xl border-2 border-thukha-violet/40 bg-white/40 px-6 py-3 font-bold text-thukha-violet transition-all duration-200 hover:border-thukha-violet hover:bg-thukha-violet/10 hover:scale-[1.01] active:scale-[0.99] dark:border-thukha-lilac/40 dark:bg-white/5 dark:text-thukha-lilac dark:hover:border-thukha-lilac dark:hover:bg-white/10">
                  {t("create.downloadWithoutText")}
                </a>
              </>
            )}
            <button
              type="button"
              onClick={saveDesign}
              disabled={savingDesign}
              className="flex min-h-[44px] items-center justify-center rounded-xl border border-thukha-violet/30 bg-white/40 px-6 py-3 font-bold text-thukha-violet transition-all duration-200 hover:border-thukha-violet hover:bg-thukha-violet/10 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 dark:border-white/10 dark:bg-white/5 dark:text-thukha-lilac dark:hover:bg-white/10"
            >
              {savingDesign ? t("create.savingDesign") : t("create.saveDesign")}
            </button>
            {savedMessage && <p className="text-sm leading-6 text-thukha-indigo dark:text-[#f6f7fb]">{savedMessage}</p>}
            <div className="rounded-2xl border border-thukha-lilac/30 bg-white/40 p-4 dark:border-white/10 dark:bg-white/5">
              <h3 className="text-sm font-bold">{t("create.captionTitle")}</h3>
              <button
                type="button"
                onClick={generateCaption}
                disabled={captionLoading}
                className="mt-2 min-h-[44px] rounded-full bg-thukha-violet px-5 py-2 text-sm font-bold text-white disabled:opacity-50"
              >
                {captionLoading ? t("create.captionLoading") : t("create.captionButton")}
              </button>
              {captionMsg && <p className="mt-2 text-sm font-semibold">{captionMsg}</p>}
              {captionOptions.length > 0 && (
                <ul className="mt-3 flex flex-col gap-2">
                  {captionOptions.map((opt) => (
                    <li key={opt} className="flex items-start justify-between gap-2 rounded-xl bg-white/60 p-3 text-sm leading-6 dark:bg-black/20">
                      <span>{opt}</span>
                      <button
                        type="button"
                        onClick={() => copyCaption(opt)}
                        className="shrink-0 rounded-full border border-thukha-violet/40 px-3 py-1 text-xs font-bold text-thukha-violet dark:text-thukha-lilac"
                      >
                        {copiedCaption === opt ? t("create.captionCopied") : t("create.captionCopy")}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              {captionHashtags.length > 0 && (
                <p className="mt-2 text-sm text-thukha-violet dark:text-thukha-lilac">
                  {t("create.captionHashtags")}: {captionHashtags.join(" ")}
                </p>
              )}
              <p className="mt-2 text-xs leading-5 text-thukha-indigo/70 dark:text-white/70">{t("create.captionNote")}</p>
            </div>
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