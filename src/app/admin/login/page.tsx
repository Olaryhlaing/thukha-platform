"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useLanguage } from "@/components/LanguageProvider";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const { t } = useLanguage();

  useEffect(() => {
    router.replace("/login");
  }, [router]);

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-16">
      <div className="flex flex-col items-center gap-4 rounded-3xl border border-thukha-lilac/30 bg-white/75 p-8 text-center shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-thukha-indigo/70">
        <div className="h-10 w-10 animate-spin rounded-full border-3 border-thukha-violet border-t-transparent shadow-lg" />
        <h1 className="text-2xl font-black">
          <span className="colorful-text-gradient">Login</span>
        </h1>
        <p className="text-sm leading-6 text-thukha-indigo/70 dark:text-white/70">
          {t("adminLogin.redirectNote")}
        </p>
        <Link
          href="/login"
          className="colorful-btn-gradient shimmer-hover inline-flex min-h-[42px] items-center justify-center rounded-full px-6 py-2 text-sm font-bold text-white shadow-md"
        >
          {t("common.goToLogin")} →
        </Link>
      </div>
    </main>
  );
}
