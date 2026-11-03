"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import AuthNav from "@/components/AuthNav";
import ThemeToggle from "@/components/ThemeToggle";
import LanguageToggle from "@/components/LanguageToggle";
import { useLanguage } from "@/components/LanguageProvider";

/* Site header. On auth pages (/login, /signup, /admin/login,
   /forgot-password, /auth/reset-password) the navigation is
   hidden entirely — only the logo stays — so the login/signup
   pages are clean and do not repeat Create / Brands / Designs /
   Login / Signup / CTA links above the form itself. The theme
   toggle is NOT part of that nav, so light/dark can be switched
   on every page, including auth pages. Every other page keeps
   the full navigation. */
const AUTH_PAGES = ["/login", "/signup", "/admin/login", "/forgot-password", "/auth/reset-password"];

export default function SiteHeader() {
  const pathname = usePathname();
  const isAuthPage = AUTH_PAGES.includes(pathname ?? "");
  const { t } = useLanguage();

  /* Header stays pinned at the top while scrolling, on every
     page and every device (sticky top-0). It needs its own
     background, otherwise page content would show through it
     once it sticks: white in Light mode, Midnight Indigo in
     Dark mode — the same colours as the page body, so it
     looks unchanged when at the top. */
  return (
    <header className="sticky top-0 z-50 border-b border-thukha-lilac/30 bg-white dark:bg-thukha-indigo">
      {/* Mobile: 2 rows only. Row 1 (order-1 logo + order-2 toggles)
          is a single row; row 2 (order-3 nav) is one horizontally
          scrollable row, never wrapped. Desktop (lg): the same
          three blocks reorder into one row — logo left, nav
          centred (flex-1), toggles right — so the desktop
          layout from c28345d is preserved. Auth pages hide the
          nav, so they stay a single row on every screen. */}
      <div className="flex w-full flex-wrap items-center justify-between gap-x-2 gap-y-2 px-2 py-2 sm:px-3 sm:py-3">
        {/* Mobile fit: the logo link is shrink-0 + whitespace-nowrap
            (it used to shrink and wrap "ThuKha / Platform" onto two
            lines when the language toggle switched to the wider
            "English" label), the logo is 32px on mobile, and the
            header padding/gap are tighter on mobile. Desktop
            sizes are unchanged (sm: classes). */}
        <Link href="/" className="order-1 flex shrink-0 items-center gap-1 whitespace-nowrap text-sm font-bold sm:gap-2 sm:text-base">
          <Image
            src="/thukha-logo.png"
            alt="ThuKha Platform logo"
            width={40}
            height={40}
            className="h-8 w-8 rounded-xl bg-white sm:h-10 sm:w-10 dark:bg-[#1b1c48]"
          />
          ThuKha Platform
        </Link>
        {!isAuthPage && (
          <nav className="order-3 flex w-full items-center gap-3 overflow-x-auto whitespace-nowrap px-1 pb-1 text-sm font-semibold sm:gap-4 lg:order-2 lg:w-auto lg:flex-1 lg:justify-center lg:overflow-visible lg:px-0 lg:pb-0">
            <Link href="/create" className="min-h-[44px] flex shrink-0 items-center text-thukha-violet dark:text-thukha-lilac">
              {t("nav.create")}
            </Link>
            <Link href="/brands" className="min-h-[44px] flex shrink-0 items-center text-thukha-violet dark:text-thukha-lilac">
              {t("nav.brands")}
            </Link>
            <Link href="/designs" className="min-h-[44px] flex shrink-0 items-center text-thukha-violet dark:text-thukha-lilac">
              {t("nav.designs")}
            </Link>
            {/* No static Admin link here: AuthNav shows it only to
                logged-in admins (server-side role check), so
                guests and customers never see admin navigation. */}
            <AuthNav />
          </nav>
        )}
        <div className="order-2 flex shrink-0 items-center gap-1 sm:gap-2 lg:order-3">
          <LanguageToggle />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
