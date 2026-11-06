"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getSupabase, supabaseConfigured } from "@/lib/supabase/client";
import { useLanguage } from "@/components/LanguageProvider";

export default function AccountPage() {
  const { t, lang } = useLanguage();
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [role, setRole] = useState("");
  const [balance, setBalance] = useState<number | null>(null);
  const [suspended, setSuspended] = useState(false);
  const [loaded, setLoaded] = useState(() => !supabaseConfigured());
  const [confirming, setConfirming] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarMsg, setAvatarMsg] = useState("");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [removingAvatar, setRemovingAvatar] = useState(false);
  const [editMsg, setEditMsg] = useState("");
  const [savingName, setSavingName] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordAgain, setNewPasswordAgain] = useState("");
  const [pwMsg, setPwMsg] = useState("");
  const [savingPw, setSavingPw] = useState(false);
  const [deleting, setDeleting] = useState(false);
  type TokenEvent = { type: string; amount: number; prompt?: string | null; format?: string | null; created_at?: string };
  const [tokenHistory, setTokenHistory] = useState<TokenEvent[]>([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) return;
    supabase.auth.getSession().then(async ({ data }) => {
      const token = data.session?.access_token;
      if (!token) {
        setLoaded(true);
        return;
      }
      try {
        const res = await fetch("/api/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = (await res.json()) as {
          email?: string;
          display_name?: string | null;
          avatar_url?: string | null;
          role?: string;
          suspended?: boolean;
          balance?: number | null;
        };
        if (res.ok) {
          setEmail(json.email ?? null);
          setDisplayName(json.display_name ?? "");
          setAvatarUrl(json.avatar_url ?? null);
          setRole(json.role ?? "");
          setSuspended(json.suspended ?? false);
          setBalance(json.balance ?? null);
          try {
            const hres = await fetch("/api/tokens/history", {
              headers: { Authorization: `Bearer ${token}` },
            });
            const hjson = (await hres.json()) as { events?: TokenEvent[] };
            if (hres.ok) setTokenHistory(hjson.events ?? []);
          } catch {
            // History is extra info — the account page still works.
          }
        }
      } catch {
        // Leave not-logged-in branch below
      }
      setLoaded(true);
    });
  }, []);

  async function saveName() {
    if (!displayName.trim()) {
      setEditMsg(t("account.editNameEmpty"));
      return;
    }
    const supabase = getSupabase();
    const token = (await supabase?.auth.getSession())?.data.session?.access_token;
    if (!token) return;
    setSavingName(true);
    setEditMsg("");
    try {
      const res = await fetch("/api/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ display_name: displayName.trim() }),
      });
      if (!res.ok) {
        setEditMsg(t("account.editFailed"));
      } else {
        // Keep Supabase Auth metadata in sync too (signup name).
        await supabase?.auth.updateUser({ data: { display_name: displayName.trim() } });
        setEditMsg(t("account.editSaved"));
      }
    } catch {
      setEditMsg(t("account.editFailed"));
    }
    setSavingName(false);
  }

  async function savePassword() {
    if (newPassword.length < 8) {
      setPwMsg(t("account.passwordMin"));
      return;
    }
    if (newPassword !== newPasswordAgain) {
      setPwMsg(t("account.passwordMatch"));
      return;
    }
    const supabase = getSupabase();
    if (!supabase) return;
    setSavingPw(true);
    setPwMsg("");
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setSavingPw(false);
    if (error) {
      setPwMsg(t("account.passwordFailed"));
    } else {
      setPwMsg(t("account.passwordSaved"));
      setNewPassword("");
      setNewPasswordAgain("");
    }
  }

  function chooseAvatar(file: File | undefined) {
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setAvatarMsg(t("account.avatarInvalidType"));
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setAvatarMsg(t("account.avatarTooLarge"));
      return;
    }
    if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
    setAvatarMsg("");
  }

  async function uploadAvatar() {
    if (!avatarFile) {
      setAvatarMsg(t("account.avatarNoFile"));
      return;
    }
    const supabase = getSupabase();
    const token = (await supabase?.auth.getSession())?.data.session?.access_token;
    if (!token) return;
    setUploadingAvatar(true);
    setAvatarMsg("");
    try {
      const form = new FormData();
      form.append("avatar", avatarFile);
      const res = await fetch("/api/me/avatar", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });
      const json = (await res.json().catch(() => ({}))) as { avatar_url?: string; error?: string };
      if (!res.ok || !json.avatar_url) {
        setAvatarMsg(json.error ?? t("account.avatarFailed"));
      } else {
        setAvatarUrl(json.avatar_url);
        // Keep the header in sync without a reload: the same
        // client-metadata trick the name save already uses —
        // updateUser fires onAuthStateChange, and AuthNav then
        // re-reads /api/me and shows the new picture.
        await supabase?.auth.updateUser({ data: { avatar_url: json.avatar_url } });
        setAvatarFile(null);
        if (avatarPreview) URL.revokeObjectURL(avatarPreview);
        setAvatarPreview(null);
        setAvatarMsg(t("account.avatarSaved"));
      }
    } catch {
      setAvatarMsg(t("account.avatarFailed"));
    }
    setUploadingAvatar(false);
  }

  async function removeAvatar() {
    const supabase = getSupabase();
    const token = (await supabase?.auth.getSession())?.data.session?.access_token;
    if (!token) return;
    setRemovingAvatar(true);
    setAvatarMsg("");
    try {
      const res = await fetch("/api/me/avatar", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        setAvatarMsg(t("account.avatarFailed"));
      } else {
        setAvatarUrl(null);
        await supabase?.auth.updateUser({ data: { avatar_url: null } });
        setAvatarMsg(t("account.avatarRemoved"));
      }
    } catch {
      setAvatarMsg(t("account.avatarFailed"));
    }
    setRemovingAvatar(false);
  }

  async function deleteAccount() {
    const supabase = getSupabase();
    if (!supabase) return;
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (!token) return;
    setDeleting(true);
    setMessage("");
    try {
      const res = await fetch("/api/account", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        setMessage(t("account.deleteFailed"));
        setDeleting(false);
        return;
      }
      await supabase.auth.signOut();
      setMessage(t("account.deleteDone"));
      setTimeout(() => router.push("/login"), 1500);
    } catch {
      setMessage(t("account.deleteFailed"));
      setDeleting(false);
    }
  }

  if (!loaded) {
    return (
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center gap-4 px-4 py-16">
        <div className="h-10 w-10 animate-spin rounded-full border-3 border-thukha-violet border-t-transparent shadow-lg" />
        <p className="text-sm font-semibold text-thukha-indigo/70 dark:text-white/70">{t("account.loading")}</p>
      </main>
    );
  }

  if (!email) {
    return (
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-12">
        <div className="rounded-3xl border border-thukha-lilac/30 bg-white/70 p-8 text-center shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-thukha-indigo/70">
          <h1 className="text-3xl font-black">{t("account.title")}</h1>
          <p className="mt-3 text-base leading-7 text-thukha-indigo/70 dark:text-white/70">
            {t("account.notLoggedIn")}
          </p>
          <Link
            href="/login"
            className="colorful-btn-gradient shimmer-hover mt-6 inline-flex min-h-[44px] items-center justify-center rounded-full px-6 py-2.5 font-bold text-white shadow-md"
          >
            {t("nav.login")} →
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-4 py-8 sm:px-6 sm:py-12">
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-thukha-violet/30 bg-thukha-violet/10 px-3.5 py-1 text-xs font-bold text-thukha-violet dark:border-thukha-lilac/40 dark:bg-white/10 dark:text-thukha-lilac">
            <span className="pulsing-dot h-2 w-2 rounded-full bg-emerald-400" />
            Verified Account
          </span>
        </div>
        <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
          <span className="colorful-text-gradient">{t("account.title")}</span>
        </h1>
      </div>

      {/* User profile card */}
      <div className="gradient-border-top relative overflow-hidden rounded-3xl border border-thukha-lilac/30 bg-white/75 p-6 shadow-xl backdrop-blur-xl sm:p-8 dark:border-white/10 dark:bg-thukha-indigo/70">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="relative h-16 w-16 shrink-0">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt=""
                  className="h-16 w-16 rounded-2xl object-cover shadow-lg"
                />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-thukha-violet via-pink-500 to-thukha-teal text-2xl font-black text-white shadow-lg">
                  {email.charAt(0).toUpperCase()}
                </div>
              )}
              <span className="pulsing-dot absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full bg-emerald-400 border-2 border-white dark:border-thukha-indigo" />
            </div>
            <div>
              <p className="text-lg font-black text-thukha-indigo sm:text-xl dark:text-white">{displayName || email}</p>
              {displayName && (
                <p className="text-sm text-thukha-indigo/70 dark:text-white/70">{email}</p>
              )}
              <div className="mt-1 flex items-center gap-2">
                <span className="inline-flex items-center rounded-full bg-thukha-violet/15 px-3 py-0.5 text-xs font-bold text-thukha-violet dark:bg-white/10 dark:text-thukha-lilac">
                  Role: {role || "Customer"}
                </span>
                {role === "admin" && (
                  <span className="inline-flex items-center rounded-full bg-amber-500/20 px-2.5 py-0.5 text-xs font-bold text-amber-600 dark:text-amber-300">
                    Admin Access
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Token balance card */}
          <div className="flex flex-col rounded-2xl border border-thukha-violet/20 bg-gradient-to-br from-thukha-violet/10 to-thukha-teal/10 p-4 text-center sm:min-w-[180px]">
            <span className="text-xs font-bold uppercase tracking-wider text-thukha-indigo/60 dark:text-white/60">
              {t("account.balance")}
            </span>
            <span className="mt-1 text-2xl font-black text-thukha-violet dark:text-thukha-lilac">
              {role === "admin" ? "∞ Unlimited" : balance !== null ? `${balance} Tokens` : "—"}
            </span>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between border-t border-thukha-lilac/20 pt-4 text-sm dark:border-white/10">
          <Link
            href="/privacy"
            className="font-semibold text-thukha-violet transition-colors hover:text-thukha-teal hover:underline dark:text-thukha-lilac dark:hover:text-thukha-teal"
          >
            {t("nav.privacy")} →
          </Link>
          <Link
            href="/create"
            className="font-bold text-thukha-violet transition-colors hover:text-thukha-teal hover:underline dark:text-thukha-lilac dark:hover:text-thukha-teal"
          >
            Go to Studio →
          </Link>
        </div>
      </div>

      {/* Edit personal information — customer edits their own
          name and password only. Email / Role / Token balance
          are read-only here (see the note below). */}
      <section className="rounded-3xl border border-thukha-lilac/30 bg-white/75 p-6 shadow-xl backdrop-blur-xl sm:p-8 dark:border-white/10 dark:bg-thukha-indigo/70">
        <h2 className="text-lg font-bold">{t("account.editTitle")}</h2>
        <label className="mt-4 block text-sm font-bold">
          {t("account.editName")}
          <input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            type="text"
            className="mt-1 w-full rounded-xl border border-thukha-lilac/50 bg-white dark:bg-[#1b1c48] px-3 py-3 text-base outline-none focus:border-thukha-violet focus:ring-2 focus:ring-thukha-lilac/50"
          />
        </label>
        {editMsg && <p className="mt-2 text-sm font-semibold">{editMsg}</p>}
        <button
          type="button"
          onClick={saveName}
          disabled={savingName}
          className="mt-3 min-h-[44px] rounded-full bg-thukha-violet px-6 py-2.5 font-bold text-white disabled:opacity-50"
        >
          {savingName ? t("account.loading") : t("account.editSave")}
        </button>

        <h3 className="mt-8 text-base font-bold">{t("account.avatarTitle")}</h3>
        <div className="mt-3 flex items-center gap-4">
          {avatarPreview || avatarUrl ? (
            <img
              src={avatarPreview ?? avatarUrl ?? ""}
              alt=""
              className="h-20 w-20 shrink-0 rounded-2xl object-cover shadow-md"
            />
          ) : (
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-thukha-violet/15 text-2xl font-black text-thukha-violet dark:text-thukha-lilac">
              {email.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="flex flex-col gap-2">
            <label className="inline-flex min-h-[44px] cursor-pointer items-center justify-center rounded-full border border-thukha-violet/40 px-5 py-2 text-sm font-bold text-thukha-violet dark:border-thukha-lilac/40 dark:text-thukha-lilac">
              {t("account.avatarChoose")}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(e) => chooseAvatar(e.target.files?.[0])}
              />
            </label>
            {avatarUrl && !avatarPreview && (
              <button
                type="button"
                onClick={removeAvatar}
                disabled={removingAvatar}
                className="min-h-[44px] rounded-full border border-rose-400 px-5 py-2 text-sm font-bold text-rose-600 disabled:opacity-50 dark:text-rose-300"
              >
                {removingAvatar ? t("account.avatarRemoving") : t("account.avatarRemove")}
              </button>
            )}
          </div>
        </div>
        <p className="mt-2 text-sm leading-6 text-thukha-indigo/70 dark:text-white/70">
          {t("account.avatarNote")}
        </p>
        {avatarMsg && <p className="mt-2 text-sm font-semibold">{avatarMsg}</p>}
        {avatarPreview && (
          <button
            type="button"
            onClick={uploadAvatar}
            disabled={uploadingAvatar}
            className="mt-3 min-h-[44px] rounded-full bg-thukha-violet px-6 py-2.5 font-bold text-white disabled:opacity-50"
          >
            {uploadingAvatar ? t("account.avatarUploading") : t("account.avatarUpload")}
          </button>
        )}

        <h3 className="mt-8 text-base font-bold">{t("account.passwordTitle")}</h3>
        <label className="mt-3 block text-sm font-bold">
          {t("account.passwordNew")}
          <input
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            type="password"
            className="mt-1 w-full rounded-xl border border-thukha-lilac/50 bg-white dark:bg-[#1b1c48] px-3 py-3 text-base outline-none focus:border-thukha-violet focus:ring-2 focus:ring-thukha-lilac/50"
          />
        </label>
        <label className="mt-3 block text-sm font-bold">
          {t("account.passwordAgain")}
          <input
            value={newPasswordAgain}
            onChange={(e) => setNewPasswordAgain(e.target.value)}
            type="password"
            className="mt-1 w-full rounded-xl border border-thukha-lilac/50 bg-white dark:bg-[#1b1c48] px-3 py-3 text-base outline-none focus:border-thukha-violet focus:ring-2 focus:ring-thukha-lilac/50"
          />
        </label>
        {pwMsg && <p className="mt-2 text-sm font-semibold">{pwMsg}</p>}
        <button
          type="button"
          onClick={savePassword}
          disabled={savingPw}
          className="mt-3 min-h-[44px] rounded-full bg-thukha-violet px-6 py-2.5 font-bold text-white disabled:opacity-50"
        >
          {savingPw ? t("account.loading") : t("account.passwordSave")}
        </button>
        <p className="mt-4 text-sm leading-6 text-thukha-indigo/70 dark:text-white/70">
          {t("account.readOnlyNote")}
        </p>
      </section>

      {suspended && (
        <p className="rounded-3xl border border-rose-300 bg-rose-50 p-4 text-sm font-bold text-rose-900 dark:border-rose-800 dark:bg-rose-950/80 dark:text-rose-200">
          {t("account.suspendedWarning")}
        </p>
      )}

      {/* Token history (Batch 1): generations spent + admin refills */}
      <section className="rounded-3xl border border-thukha-lilac/30 bg-white/75 p-6 shadow-xl backdrop-blur-xl sm:p-8 dark:border-white/10 dark:bg-thukha-indigo/70">
        <h2 className="text-lg font-bold">{t("account.tokenHistoryTitle")}</h2>
        {role !== "admin" && balance !== null && balance < 20 && (
          <p className="mt-2 rounded-xl bg-amber-50 p-3 text-sm font-semibold text-amber-900 dark:bg-amber-950 dark:text-amber-200">
            {t("account.tokenLowWarning", { balance })}
          </p>
        )}
        <p className="mt-2 text-sm leading-6 text-thukha-indigo/70 dark:text-white/70">{t("account.tokenHistoryNote")}</p>
        {tokenHistory.length === 0 ? (
          <p className="mt-3 text-sm text-thukha-indigo/70 dark:text-white/70">{t("account.tokenHistoryEmpty")}</p>
        ) : (
          <ul className="mt-3 flex flex-col gap-2">
            {tokenHistory.map((ev, i) => (
              <li key={`${ev.created_at}-${i}`} className="flex items-center justify-between gap-3 rounded-xl bg-white/60 p-3 text-sm dark:bg-black/20">
                <div>
                  <p className="font-bold">
                    {ev.type === "refill" ? t("account.tokenHistoryRefill") : t("account.tokenHistorySpent")}
                    {ev.prompt ? <span className="font-normal text-thukha-indigo/70 dark:text-white/70"> — {ev.prompt.slice(0, 60)}</span> : null}
                  </p>
                  {ev.created_at && <p className="text-xs text-thukha-indigo/60 dark:text-white/60">{new Date(ev.created_at).toLocaleString(lang === "my" ? "my-MM" : "en-GB")}</p>}
                </div>
                <span className={`shrink-0 font-black ${ev.amount >= 0 ? "text-teal-600 dark:text-teal-300" : "text-rose-600 dark:text-rose-300"}`}>
                  {ev.amount >= 0 ? `+${ev.amount}` : ev.amount}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Danger zone card */}
      <section className="rounded-3xl border border-rose-300/40 bg-rose-500/10 p-6 backdrop-blur-md sm:p-8 dark:border-rose-900/50 dark:bg-rose-950/40">
        <div className="flex items-center gap-2">
          <span className="text-lg">⚠️</span>
          <h2 className="text-lg font-bold text-rose-900 dark:text-rose-200">
            {t("account.deleteTitle")}
          </h2>
        </div>
        {!confirming ? (
          <button
            type="button"
            onClick={() => setConfirming(true)}
            className="mt-4 min-h-[42px] rounded-xl bg-rose-600 px-5 py-2 text-sm font-bold text-white shadow-md transition-all duration-200 hover:bg-rose-700 hover:shadow-lg active:scale-95"
          >
            {t("account.deleteButton")}
          </button>
        ) : (
          <div className="anim-scale-in mt-4 space-y-4">
            <p className="text-sm leading-6 text-rose-950 dark:text-rose-200">
              {t("account.deleteWarning")}
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={deleteAccount}
                disabled={deleting}
                className="min-h-[42px] rounded-xl bg-rose-600 px-5 py-2 text-sm font-bold text-white shadow-md transition-all hover:bg-rose-700 disabled:opacity-50"
              >
                {deleting ? t("account.deleting") : t("account.deleteConfirm")}
              </button>
              <button
                type="button"
                onClick={() => setConfirming(false)}
                disabled={deleting}
                className="min-h-[42px] rounded-xl border border-rose-600 px-5 py-2 text-sm font-bold text-rose-700 transition-all hover:bg-rose-100 dark:text-rose-300 dark:hover:bg-rose-900/40 disabled:opacity-50"
              >
                {t("account.deleteCancel")}
              </button>
            </div>
          </div>
        )}
        {message && (
          <p className="anim-scale-in mt-4 rounded-xl bg-white/70 p-3 text-sm font-semibold text-rose-900 shadow-sm dark:bg-black/40 dark:text-rose-200">
            {message}
          </p>
        )}
      </section>
    </main>
  );
}
