import type { Metadata } from "next";
import { Inter, Noto_Sans_Myanmar } from "next/font/google";
import SiteHeader from "@/components/SiteHeader";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const myanmar = Noto_Sans_Myanmar({
  variable: "--font-myanmar",
  subsets: ["myanmar"],
  weight: ["400", "600", "700"],
});

export const metadata: Metadata = {
  title: "ThuKha Platform — သင့်လုပ်ငန်းကို AI နဲ့ တိုးတက်စေမယ်",
  description:
    "ThuKha Platform: Myanmar businesses' AI marketing workspace. Brief, AI background, editable Burmese text, your original logo, Facebook-ready export.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="my"
      className={`${inter.variable} ${myanmar.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-white text-thukha-indigo">
        <SiteHeader />
        <div className="flex flex-1 flex-col">{children}</div>
        <footer className="border-t border-thukha-lilac/30 py-6 text-center text-sm text-thukha-indigo/60">
          ThuKha Platform
        </footer>
      </body>
    </html>
  );
}
