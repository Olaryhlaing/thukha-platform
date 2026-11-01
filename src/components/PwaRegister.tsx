"use client";

import { useEffect } from "react";

/* Register the service worker in production only, so local dev
   never gets a stale cached app. A failed registration is not an
   error for the user — the site works exactly the same without it,
   it just cannot be installed as an app until the next load. */
export default function PwaRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  }, []);
  return null;
}
