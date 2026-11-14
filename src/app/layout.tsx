import type { Metadata, Viewport } from "next";
import { Inter, Noto_Sans_Myanmar, Padauk, Noto_Serif_Myanmar, Playfair_Display } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
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
          <SiteFooter />
        </LanguageProvider>
        <Analytics />
      </body>
    </html>
  );
}
