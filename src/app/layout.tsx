import type { Metadata } from "next";
import { Inter, Noto_Sans_Myanmar } from "next/font/google";
import Link from "next/link";
import Image from "next/image";
import AuthNav from "@/components/AuthNav";
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
        <header className="border-b border-thukha-lilac/30">
          <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-2 px-4 py-3 sm:flex-row sm:px-6">
            <Link href="/" className="flex items-center gap-2 text-base font-bold">
              <Image
                src="/thukha-logo.png"
                alt="ThuKha Platform logo"
                width={40}
                height={40}
                className="rounded-xl bg-white"
              />
              ThuKha Platform
            </Link>
            <nav className="flex flex-wrap items-center justify-center gap-3 text-sm font-semibold sm:gap-4">
              <Link href="/templates" className="min-h-[44px] flex items-center text-thukha-violet">
                Templates
              </Link>
              <Link href="/create" className="min-h-[44px] flex items-center text-thukha-violet">
                Create
              </Link>
              <Link href="/brands" className="min-h-[44px] flex items-center text-thukha-violet">
                Brands
              </Link>
              <Link href="/designs" className="min-h-[44px] flex items-center text-thukha-violet">
                Designs
              </Link>
              {/* No static Admin link here: AuthNav shows it only to
                  logged-in admins (server-side role check), so
                  guests and customers never see admin navigation. */}
              <AuthNav />
              <Link
                href="/create"
                className="flex min-h-[44px] items-center rounded-full bg-thukha-violet px-4 py-2 text-white hover:bg-thukha-lilac"
              >
                စတင်ဖန်တီးပါ
              </Link>
            </nav>
          </div>
        </header>
        <div className="flex flex-1 flex-col">{children}</div>
        <footer className="border-t border-thukha-lilac/30 py-6 text-center text-sm text-thukha-indigo/60">
          ThuKha Platform
        </footer>
      </body>
    </html>
  );
}
