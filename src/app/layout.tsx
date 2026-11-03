import type { Metadata, Viewport } from "next";
import { Inter, Noto_Sans_Myanmar, Padauk, Noto_Serif_Myanmar, Playfair_Display } from "next/font/google";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import PwaRegister from "@/components/PwaRegister";
import LanguageProvider from "@/components/LanguageProvider";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const myanmar = Noto_Sans_Myanmar({
  variable: "--font-myanmar",
  subsets: ["myanmar"],
  weight: ["400", "600", "700"],
});
// Overlay-text fonts (see /create font select): Padauk is a
// Myanmar-friendly sans, Noto Serif Myanmar is a Myanmar serif,
// Playfair Display is an English display serif (Burmese letters
// fall back to Noto Sans Myanmar in its stack, so Burmese text
// never breaks when Playfair is chosen).
const padauk = Padauk({
  variable: "--font-padauk",
  subsets: ["latin", "myanmar"],
  weight: ["400", "700"],
});
const serifMyanmar = Noto_Serif_Myanmar({
  variable: "--font-serif-myanmar",
  subsets: ["myanmar"],
  weight: ["400", "700"],
});
const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "ThuKha Platform — သင့်လုပ်ငန်းကို AI နဲ့ တိုးတက်စေမယ်",
  description:
    "ThuKha Platform: Myanmar businesses' AI marketing workspace. Brief, AI background, editable Burmese text, your original logo, Facebook-ready export.",
  // Browser tab icon = ThuKha robot logo, not the Next.js default "N".
  icons: {
    icon: [
      { url: "/favicon.ico", type: "image/x-icon" },
      { url: "/icon.png", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  // PWA: installable app (manifest + icons + service worker).
  // This wires installability only — it does NOT redesign the
  // home page (the 2026-10-30 screenshot-style home redesign
  // stays cancelled; / still redirects to /login).
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "ThuKha",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  themeColor: "#5946ED",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="my"
      className={`${inter.variable} ${myanmar.variable} ${padauk.variable} ${serifMyanmar.variable} ${playfair.variable} h-full antialiased`}
    >
      {/* Dark mode background is Midnight Indigo (#10113D, the
          login hero colour in the user's screenshot), not the
          lighter #1b1c48 surface — that was inconsistent with
          globals.css (.dark --background is already #10113d).
          Surfaces (cards, login form side, inputs) stay #1b1c48
          so they stand out against the indigo background. */}
      <body className="min-h-full flex flex-col bg-white dark:bg-thukha-indigo text-thukha-indigo dark:text-[#f6f7fb]">
        {/* No-flash theme + language script: apply the saved (or
            device) theme and the saved language before first
            paint, so the page never flashes light and then flips
            to dark, or renders in the wrong language. Same keys
            as ThemeToggle ("thukha-theme") and LanguageProvider
            ("thukha-lang"). */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('thukha-theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.classList.add('dark')}var l=localStorage.getItem('thukha-lang');document.documentElement.lang=(l==='en'?'en':'my')}catch(e){}})();`,
          }}
        />
        <PwaRegister />
        <LanguageProvider>
          <SiteHeader />
          <div className="flex flex-1 flex-col">{children}</div>
          <footer className="border-t border-thukha-lilac/30 py-6 text-center text-sm text-thukha-indigo/60 dark:text-white/60">
            ThuKha Platform ·{" "}
            <Link href="/privacy" className="font-bold text-thukha-violet dark:text-thukha-lilac">
              Privacy — ကိုယ်ရေးအချက်အလက် မူဝါဒ
            </Link>
          </footer>
        </LanguageProvider>
      </body>
    </html>
  );
}
