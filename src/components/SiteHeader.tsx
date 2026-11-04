"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { usePathname } from "next/navigation";
import AuthNav, { AdminNavLink } from "@/components/AuthNav";
import ThemeToggle from "@/components/ThemeToggle";
import LanguageToggle from "@/components/LanguageToggle";
import { useLanguage } from "@/components/LanguageProvider";

const AUTH_PAGES = ["/login", "/signup", "/admin/login", "/forgot-password", "/auth/reset-password"];

export default function SiteHeader() {
  const pathname = usePathname();
  const isAuthPage = AUTH_PAGES.includes(pathname ?? "");
  const { t } = useLanguage();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-thukha-lilac/25 bg-white/85 backdrop-blur-md dark:border-white/10 dark:bg-thukha-indigo/85">
      {/* Animated colorful gradient line at the bottom of header */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-thukha-violet via-[#ec4899] via-thukha-teal to-thukha-lilac bg-[length:200%_auto] animate-[thu-gradient-flow_7s_linear_infinite]" />

      <div className="flex w-full flex-wrap items-center justify-between gap-x-2 gap-y-2 px-3 py-2.5 sm:px-5 sm:py-3">
        {/* Brand Logo with interactive colorful hover state */}
        <Link
          href="/"
          className="group order-1 flex shrink-0 items-center gap-2 whitespace-nowrap text-sm font-black tracking-tight transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98] sm:gap-2.5 sm:text-base"
        >
          <div className="relative flex items-center justify-center">
            <div className="absolute -inset-1 rounded-2xl bg-gradient-to-tr from-thukha-violet to-thukha-teal opacity-0 blur transition-opacity duration-300 group-hover:opacity-60" />
            <Image
              src="/thukha-logo.png"
              alt="ThuKha Platform logo"
              width={40}
              height={40}
              className="relative h-8 w-8 rounded-xl bg-white shadow-sm transition-transform duration-300 group-hover:rotate-3 sm:h-9 sm:w-9 dark:bg-[#1b1c48]"
            />
          </div>
          <span className="colorful-brand-gradient">ThuKha Platform</span>
        </Link>

        {!isAuthPage && (
          <nav
            onClick={() => setMenuOpen(false)}
            className={`order-3 w-full flex-col gap-1.5 px-3 pb-3 text-sm font-semibold transition-all duration-300 sm:gap-2 lg:order-2 lg:flex lg:w-auto lg:flex-1 lg:flex-row lg:items-center lg:justify-center lg:gap-3 lg:px-0 lg:pb-0 ${
              menuOpen ? "flex anim-fade-in bg-white/95 dark:bg-thukha-indigo/95 rounded-2xl p-4 shadow-xl border border-thukha-lilac/30 lg:shadow-none lg:border-none lg:p-0" : "hidden"
            }`}
          >
            <Link
              href="/create"
              className="flex min-h-[40px] items-center rounded-xl px-3 py-1.5 text-thukha-violet transition-all duration-200 hover:bg-thukha-violet/10 hover:text-thukha-violet hover:scale-105 active:scale-95 dark:text-thukha-lilac dark:hover:bg-white/10"
            >
              {t("nav.create")}
            </Link>
            <Link
              href="/designs"
              className="flex min-h-[40px] items-center rounded-xl px-3 py-1.5 text-thukha-violet transition-all duration-200 hover:bg-thukha-violet/10 hover:text-thukha-violet hover:scale-105 active:scale-95 dark:text-thukha-lilac dark:hover:bg-white/10"
            >
              {t("nav.designs")}
            </Link>
            <AdminNavLink />
            <div className="lg:hidden">
              <AuthNav />
            </div>
          </nav>
        )}

        <div className="order-2 flex shrink-0 items-center gap-1.5 sm:gap-2 lg:order-3">
          <LanguageToggle />
          <ThemeToggle />
          {/* Desktop only: logged-in pill (and guest links) sit here,
              after the toggles, so the avatar+name pill is the far
              right item on screen. Mobile keeps AuthNav inside the
              hamburger menu above, or the top row would crowd again.
              Auth pages show no AuthNav here, same as the nav. */}
          {!isAuthPage && (
            <div className="hidden lg:flex lg:items-center lg:gap-3">
              <AuthNav />
            </div>
          )}
          {!isAuthPage && (
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              className="flex min-h-[40px] min-w-[40px] items-center justify-center rounded-full border border-thukha-lilac/50 bg-white/50 text-xl font-bold text-thukha-violet transition-all duration-200 hover:border-thukha-violet hover:bg-thukha-violet/10 hover:scale-105 active:scale-95 lg:hidden dark:bg-white/5 dark:text-thukha-lilac dark:hover:bg-white/10"
            >
              {menuOpen ? "✕" : "☰"}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
