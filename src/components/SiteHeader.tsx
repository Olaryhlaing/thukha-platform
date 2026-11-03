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

  return (
    <header className="border-b border-thukha-lilac/30">
      {/* English/Dark toggles sit at the right edge on every
         page: full-width header (no max-w-6xl centring), and on
         the stacked mobile header they are self-end (right).
         Auth pages have no nav, so theirs is a single row
         (logo left, toggles right); other pages keep the
         stacked-below-lg layout, so the long logged-in nav
         never gets cramped into a single row on mobile. */}
      <div
        className={
          isAuthPage
            ? "flex w-full flex-row items-center justify-between gap-1 px-2 py-3 sm:gap-2 sm:px-3"
            : "flex w-full flex-col items-center justify-between gap-2 px-3 py-3 lg:flex-row"
        }
      >
        {/* Mobile fit: the logo link is shrink-0 + whitespace-nowrap
            (it used to shrink and wrap "ThuKha / Platform" onto two
            lines when the language toggle switched to the wider
            "English" label), the logo is 32px on mobile, and the
            header padding/gap are tighter on mobile. Desktop
            sizes are unchanged (sm: classes). */}
        <Link href="/" className="flex shrink-0 items-center gap-1 whitespace-nowrap text-sm font-bold sm:gap-2 sm:text-base">
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
          <nav className="flex flex-wrap items-center justify-center gap-3 text-sm font-semibold sm:gap-4">
            <Link href="/create" className="min-h-[44px] flex items-center text-thukha-violet dark:text-thukha-lilac">
              {t("nav.create")}
            </Link>
            <Link href="/brands" className="min-h-[44px] flex items-center text-thukha-violet dark:text-thukha-lilac">
              {t("nav.brands")}
            </Link>
            <Link href="/designs" className="min-h-[44px] flex items-center text-thukha-violet dark:text-thukha-lilac">
              {t("nav.designs")}
            </Link>
            {/* No static Admin link here: AuthNav shows it only to
                logged-in admins (server-side role check), so
                guests and customers never see admin navigation. */}
            <AuthNav />
          </nav>
        )}
        <div className="flex shrink-0 items-center gap-1 self-end sm:gap-2 lg:self-center">
          <LanguageToggle />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
