"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { translate, type Lang } from "@/lib/i18n";

type LanguageCtx = {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
};

const Ctx = createContext<LanguageCtx>({
  lang: "my",
  setLang: () => {},
  t: (key, vars) => translate("my", key, vars),
});

export function useLanguage(): LanguageCtx {
  return useContext(Ctx);
}

/* Language state for the whole app. Saved in localStorage
   ("thukha-lang", default Burmese — the original UI), and the
   <html lang> attribute follows it so browsers / screen readers
   pronounce the page correctly. The no-flash script in layout.tsx
   applies the saved language before first paint; this effect
   keeps it in sync when the toggle changes it. */
export default function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("my");

  useEffect(() => {
    const saved = localStorage.getItem("thukha-lang");
    const initial: Lang = saved === "en" ? "en" : "my";
    document.documentElement.lang = initial;
    // One-time initial sync, not a render loop.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLangState(initial);
  }, []);

  function setLang(next: Lang) {
    localStorage.setItem("thukha-lang", next);
    document.documentElement.lang = next;
    setLangState(next);
  }

  return (
    <Ctx.Provider value={{ lang, setLang, t: (key, vars) => translate(lang, key, vars) }}>
      {children}
    </Ctx.Provider>
  );
}
