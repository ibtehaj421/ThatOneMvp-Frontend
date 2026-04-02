"use client";

import { useLocale } from "../../_components/providers/LocaleProvider";

function HamburgerIcon() {
  return (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 6h16M4 12h16M4 18h16"
      />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
      />
    </svg>
  );
}

function GlobeIcon() {
  return (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}

interface TopBarProps {
  onMenuClick: () => void;
  title?: string;
}

export function TopBar({ onMenuClick, title }: TopBarProps) {
  const { locale, setLocale, t } = useLocale();

  const toggleLocale = () => setLocale(locale === "en" ? "ur" : "en");

  return (
    <header className="h-16 flex items-center justify-between px-4 bg-white border-b border-[#e7e5e4] shrink-0 lg:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg text-ink3 hover:bg-bg2 hover:text-ink transition-colors"
          aria-label="Toggle menu"
        >
          <HamburgerIcon />
        </button>
        {title && (
          <h1 className="text-base font-semibold text-ink hidden sm:block">
            {title}
          </h1>
        )}
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={toggleLocale}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-ink2 hover:bg-bg2 hover:text-ink transition-colors"
          title={t.settings.language}
        >
          <GlobeIcon />
          <span className="hidden sm:inline">
            {locale === "en" ? "EN" : "اردو"}
          </span>
        </button>

        <button className="relative p-2 rounded-lg text-ink3 hover:bg-bg2 hover:text-ink transition-colors">
          <BellIcon />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-accent rounded-full" />
        </button>
      </div>
    </header>
  );
}
