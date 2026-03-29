"use client";

import Link from "next/link";
import { useLocale } from "./_components/providers/LocaleProvider";
import { useAuth } from "./_components/providers/AuthProvider";

const features = [
  {
    key: "feat1" as const,
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
    color: "bg-orange-50 text-accent",
  },
  {
    key: "feat2" as const,
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
    color: "bg-cyan-50 text-accent-cool",
  },
  {
    key: "feat3" as const,
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    color: "bg-amber-50 text-accent-warm",
  },
  {
    key: "feat4" as const,
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    color: "bg-orange-50 text-accent",
  },
] as const;

export default function LandingPage() {
  const { t } = useLocale();
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-bg">
      {/* ── Header ── */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-[#e7e5e4]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="font-semibold text-ink text-lg tracking-tight">ANAM-AI</span>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-ink2">
            <a href="#features" className="hover:text-ink transition-colors">Features</a>
            <a href="#how" className="hover:text-ink transition-colors">How it works</a>
          </nav>

          <div className="flex items-center gap-2">
            {user ? (
              <Link href="/dashboard" className="inline-flex items-center h-9 px-4 rounded-xl bg-accent text-white text-sm font-medium hover:bg-accent-hover transition-colors">
                Dashboard →
              </Link>
            ) : (
              <>
                <Link href="/auth/login" className="h-9 px-4 rounded-xl text-sm font-medium text-ink2 hover:bg-bg2 transition-colors inline-flex items-center">
                  {t.landing.login}
                </Link>
                <Link href="/auth/register" className="h-9 px-4 rounded-xl bg-accent text-white text-sm font-medium hover:bg-accent-hover transition-colors inline-flex items-center">
                  {t.landing.get_started}
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* ── Hero ── */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-20 pb-24 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-50 border border-orange-100 text-accent text-xs font-semibold tracking-wide mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-accent inline-block animate-pulse" />
            AI-POWERED HEALTH PLATFORM
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-ink leading-tight tracking-tight mb-6 whitespace-pre-line">
            {t.landing.hero_title}
          </h1>

          <p className="max-w-xl mx-auto text-lg text-ink2 leading-relaxed mb-10">
            {t.landing.hero_sub}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/auth/register" className="h-12 px-8 rounded-xl bg-accent text-white font-semibold text-base hover:bg-accent-hover transition-colors shadow-sm inline-flex items-center">
              {t.landing.get_started}
            </Link>
            <a href="#how" className="h-12 px-8 rounded-xl border border-[#e7e5e4] text-ink2 font-medium text-base hover:bg-bg2 transition-colors inline-flex items-center gap-2">
              {t.landing.learn_more}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </a>
          </div>

          <p className="mt-8 text-sm text-ink3">{t.landing.trusted}</p>
        </section>

        {/* ── Features ── */}
        <section id="features" className="bg-white border-y border-[#e7e5e4]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20">
            <div className="text-center mb-14">
              <h2 className="text-3xl font-bold text-ink mb-3">{t.landing.features_title}</h2>
              <p className="text-ink2 max-w-lg mx-auto">{t.landing.features_sub}</p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((f) => (
                <div key={f.key} className="rounded-2xl border border-[#e7e5e4] p-6 hover:shadow-md transition-shadow bg-white">
                  <div className={`w-11 h-11 rounded-xl ${f.color} flex items-center justify-center mb-4`}>
                    {f.icon}
                  </div>
                  <h3 className="font-semibold text-ink mb-2">{t.landing[`${f.key}_title`]}</h3>
                  <p className="text-sm text-ink2 leading-relaxed">{t.landing[`${f.key}_desc`]}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── How it works ── */}
        <section id="how" className="max-w-6xl mx-auto px-4 sm:px-6 py-20">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-ink mb-3">{t.landing.how_title}</h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-8 relative">
            {(["step1", "step2", "step3"] as const).map((s, i) => (
              <div key={s} className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-accent text-white font-bold text-lg flex items-center justify-center mb-5 shadow-sm">
                  {i + 1}
                </div>
                <h3 className="font-semibold text-ink mb-2">{t.landing[`${s}_title`]}</h3>
                <p className="text-sm text-ink2 leading-relaxed">{t.landing[`${s}_desc`]}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="bg-ink">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-20 text-center">
            <h2 className="text-3xl font-bold text-white mb-3">{t.landing.cta_title}</h2>
            <p className="text-[#a8a29e] mb-8">{t.landing.cta_sub}</p>
            <Link href="/auth/register" className="inline-flex items-center h-12 px-8 rounded-xl bg-accent text-white font-semibold text-base hover:bg-accent-hover transition-colors">
              {t.landing.cta_btn}
            </Link>
          </div>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-[#e7e5e4] bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-accent flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="text-sm font-medium text-ink2">ANAM-AI</span>
          </div>
          <p className="text-xs text-ink3">© 2026 ANAM-AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
