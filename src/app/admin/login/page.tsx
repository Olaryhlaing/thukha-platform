"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useLanguage } from "@/components/LanguageProvider";
import { useRouter } from "next/navigation";

/* No separate admin login page any more: login is unified at
   /login, and the role (admin vs customer) is decided after
   sign-in from the account's profiles.role. This page only
   exists so old /admin/login links and bookmarks do not break —
   it redirects to /login at once. */
export default function AdminLoginPage() {
  const router = useRouter();
  const { t } = useLanguage();

  useEffect(() => {
    router.replace("/login");
  }, [router]);

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-4 px-6 py-10">
      <h1 className="text-3xl font-bold">Login</h1>
      <p className="leading-7 text-thukha-indigo/70 dark:text-white/70">
        {t("adminLogin.redirectNote")}
      </p>
      <Link href="/login" className="font-bold text-thukha-violet dark:text-thukha-lilac">{t("common.goToLogin")}</Link>
    </main>
  );
}
