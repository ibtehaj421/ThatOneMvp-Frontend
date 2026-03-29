"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "./providers/AuthProvider";
import { useLocale } from "./providers/LocaleProvider";

interface NavItem {
  href: string;
  labelKey: keyof ReturnType<typeof useLocale>["t"]["nav"];
  icon: React.ReactNode;
}

function GridIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  );
}
function ChatIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  );
}
function CalendarIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
}
function DocumentIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
}
function UsersIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}
function GearIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065zM15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}
function LogoutIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
  );
}

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { logout, user } = useAuth();
  const { t } = useLocale();

  const navItems: NavItem[] = [
    { href: "/dashboard", labelKey: "overview", icon: <GridIcon /> },
    { href: "/dashboard/chat", labelKey: "chat", icon: <ChatIcon /> },
    { href: "/dashboard/booking", labelKey: "booking", icon: <CalendarIcon /> },
    { href: "/dashboard/documents", labelKey: "documents", icon: <DocumentIcon /> },
    { href: "/dashboard/family", labelKey: "family", icon: <UsersIcon /> },
    { href: "/dashboard/settings", labelKey: "settings", icon: <GearIcon /> },
  ];

  const isActive = (href: string) =>
    href === "/dashboard"
      ? pathname === "/dashboard"
      : pathname.startsWith(href);

  const initials = user?.name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() ?? "?";

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-20 bg-black/30 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={[
          "fixed top-0 left-0 z-30 h-full w-60 flex flex-col bg-white border-r border-[#e7e5e4]",
          "transition-transform duration-300 ease-in-out",
          "lg:static lg:translate-x-0 lg:z-auto",
          open ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-5 h-16 border-b border-[#e7e5e4] shrink-0">
          <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center shrink-0">
            <svg className="w-4.5 h-4.5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
            </svg>
          </div>
          <span className="font-semibold text-ink tracking-tight">ANAM-AI</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={[
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors duration-150",
                isActive(item.href)
                  ? "bg-orange-50 text-accent"
                  : "text-ink2 hover:bg-bg2 hover:text-ink",
              ].join(" ")}
            >
              <span
                className={isActive(item.href) ? "text-accent" : "text-ink3"}
              >
                {item.icon}
              </span>
              {t.nav[item.labelKey]}
            </Link>
          ))}
        </nav>

        {/* User footer */}
        <div className="shrink-0 border-t border-[#e7e5e4] p-3">
          <div className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-bg2 transition-colors">
            <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center shrink-0">
              <span className="text-xs font-semibold text-white">{initials}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-ink truncate">{user?.name}</p>
              <p className="text-xs text-ink3 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="mt-1 w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-ink3 hover:text-red-600 hover:bg-red-50 transition-colors duration-150"
          >
            <LogoutIcon />
            {t.nav.logout}
          </button>
        </div>
      </aside>
    </>
  );
}
