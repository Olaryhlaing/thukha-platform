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
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-2 px-4 py-3 sm:flex-row sm:px-6">
        <Link href="/" className="flex items-center gap-2 text-base font-bold">
          <Image
            src="/thukha-logo.png"
            alt="ThuKha Platform logo"
            width={40}
            height={40}
            className="rounded-xl bg-white dark:bg-[#1b1c48]"
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
            <Link
              href="/create"
              className="flex min-h-[44px] items-center rounded-full bg-thukha-violet px-4 py-2 text-white hover:bg-thukha-lilac"
            >
              {t("nav.start")}
            </Link>
          </nav>
        )}
        <div className="flex items-center gap-2">
          <LanguageToggle />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
