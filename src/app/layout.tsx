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

export default function RootLayout({ children }: LayoutProps<"/">) {
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
        <LanguageProvider>
          <SiteHeader />
          <div className="flex flex-1 flex-col pb-24">{children}</div>
          {/* Fixed (not sticky) footer: sticky bottom-0 only shows
              the footer at the end of a long page, while scrolling
              the middle it disappears — that is why the previous
              version looked like it was not working. Fixed keeps
              it at the bottom of the screen on every page, with
              the pb-24 above so it never covers content. */}
          <footer className="fixed bottom-0 left-0 right-0 z-50 border-t border-thukha-lilac/30 bg-white py-6 text-center text-sm text-thukha-indigo/60 dark:bg-thukha-indigo dark:text-white/60">
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
