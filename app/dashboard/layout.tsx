"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../_components/providers/AuthProvider";
import { Sidebar } from "../_components/Sidebar";
import { TopBar } from "../_components/TopBar";
import { useLocale } from "../_components/providers/LocaleProvider";
import { usePathname } from "next/navigation";

function getPageTitle(pathname: string, t: ReturnType<typeof useLocale>["t"]) {
  if (pathname === "/dashboard") return t.dashboard.overview;
  if (pathname.startsWith("/dashboard/chat")) return t.chat.title;
  if (pathname.startsWith("/dashboard/booking")) return t.booking.title;
  if (pathname.startsWith("/dashboard/documents")) return t.documents.title;
  if (pathname.startsWith("/dashboard/family")) return t.family.title;
  if (pathname.startsWith("/dashboard/settings")) return t.settings.title;
  return "ANAM-AI";
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const { t } = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/auth/login");
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center animate-pulse">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
            </svg>
          </div>
          <p className="text-sm text-ink3">Loading…</p>
        </div>
      </div>
    );
  }

  const pageTitle = getPageTitle(pathname, t);

  return (
    <div className="h-screen flex overflow-hidden bg-bg">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar
          onMenuClick={() => setSidebarOpen((o) => !o)}
          title={pageTitle}
        />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
