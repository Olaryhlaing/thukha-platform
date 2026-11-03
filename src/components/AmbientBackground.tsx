"use client";

/* Global ambient background with colorful, fluid animated aurora meshes
   and subtle high-tech dot grid. Renders fixed behind all page content
   so every page in ThuKha Platform feels vivid, modern, and high-end.
   Respects prefers-reduced-motion. */
export default function AmbientBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden transition-opacity duration-700 select-none"
    >
      {/* Aurora Orb 1: Violet & Fuchsia (top-right) */}
      <div
        className="absolute -top-32 -right-32 h-[480px] w-[480px] rounded-full blur-[110px] sm:h-[650px] sm:w-[650px]
          bg-gradient-to-br from-thukha-violet/25 via-[#a855f7]/20 to-[#ec4899]/15
          dark:from-thukha-violet/30 dark:via-[#7c3aed]/25 dark:to-[#ec4899]/20
          animate-thu-aurora-spin"
        style={{ animationDuration: "35s" }}
      />

      {/* Aurora Orb 2: Teal, Cyan & Blue (bottom-left) */}
      <div
        className="absolute -bottom-40 -left-32 h-[440px] w-[440px] rounded-full blur-[120px] sm:h-[600px] sm:w-[600px]
          bg-gradient-to-tr from-thukha-teal/25 via-thukha-blue/20 to-thukha-lilac/15
          dark:from-thukha-teal/20 dark:via-thukha-blue/25 dark:to-thukha-violet/20
          animate-thu-float"
        style={{ animationDuration: "14s" }}
      />

      {/* Aurora Orb 3: Lilac & Amber warmth (center/floating) */}
      <div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 h-[380px] w-[380px] rounded-full blur-[130px] sm:h-[500px] sm:w-[500px]
          bg-gradient-to-r from-thukha-lilac/15 via-[#f59e0b]/10 to-thukha-violet/15
          dark:from-thukha-lilac/15 dark:via-thukha-violet/20 dark:to-thukha-blue/15
          animate-thu-float-delayed"
        style={{ animationDuration: "18s" }}
      />

      {/* Modern micro-dot overlay for clean professional SaaS depth */}
      <div
        className="absolute inset-0 bg-[radial-gradient(#5946ed_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.035] dark:opacity-[0.06]"
      />
    </div>
  );
}

