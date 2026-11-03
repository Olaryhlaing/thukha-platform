import type { Metadata, Viewport } from "next";
import { Inter, Noto_Sans_Myanmar, Padauk, Noto_Serif_Myanmar, Playfair_Display } from "next/font/google";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import PwaRegister from "@/components/PwaRegister";
import LanguageProvider from "@/components/LanguageProvider";
import AmbientBackground from "@/components/AmbientBackground";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const myanmar = Noto_Sans_Myanmar({
  variable: "--font-myanmar",
  subsets: ["myanmar"],
  weight: ["400", "600", "700"],
});
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
  icons: {
    icon: [
      { url: "/favicon.ico", type: "image/x-icon" },
      { url: "/icon.png", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="my"
      className={`${inter.variable} ${myanmar.variable} ${padauk.variable} ${serifMyanmar.variable} ${playfair.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-white dark:bg-thukha-indigo text-thukha-indigo dark:text-[#f6f7fb]">
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('thukha-theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.classList.add('dark')}var l=localStorage.getItem('thukha-lang');document.documentElement.lang=(l==='en'?'en':'my')}catch(e){}})();`,
          }}
        />
        <PwaRegister />
        <AmbientBackground />
        <LanguageProvider>
          <SiteHeader />
          <div className="relative z-10 flex flex-1 flex-col pb-24">{children}</div>
          {/* Fixed footer: glassmorphic with colorful animated gradient accent border */}
          <footer className="fixed bottom-0 left-0 right-0 z-50 border-t border-thukha-lilac/30 bg-white/90 py-4.5 text-center text-sm text-thukha-indigo/70 backdrop-blur-md dark:border-white/10 dark:bg-thukha-indigo/90 dark:text-white/70">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-thukha-violet via-pink-500 via-thukha-teal to-thukha-lilac bg-[length:200%_auto] animate-[thu-gradient-flow_6s_ease_infinite]" />
            <div className="mx-auto flex flex-wrap items-center justify-center gap-2 px-4 sm:gap-3">
              <span className="inline-flex items-center gap-1.5 font-medium">
                <span className="pulsing-dot h-2 w-2 rounded-full bg-emerald-400" />
                <span>ThuKha Platform</span>
              </span>
              <span className="text-thukha-lilac/60">·</span>
              <Link
                href="/privacy"
                className="font-semibold text-thukha-violet transition-all duration-200 hover:text-thukha-blue hover:underline dark:text-thukha-lilac dark:hover:text-thukha-teal"
              >
                Privacy — ကိုယ်ရေးအချက်အလက် မူဝါဒ
              </Link>
            </div>
          </footer>
        </LanguageProvider>
      </body>
    </html>
  );
}
