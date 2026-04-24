"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "../_components/providers/AuthProvider";
import { useLocale } from "../_components/providers/LocaleProvider";
import { apiListDocuments, apiGetAppointments, apiGetSessions } from "../_lib/api";

function StatCard({
  label,
  value,
  color,
  icon,
  href,
}: {
  label: string;
  value: string | number;
  color: string;
  icon: React.ReactNode;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="bg-white rounded-2xl border border-[#e7e5e4] p-5 hover:shadow-md transition-shadow flex items-center gap-4"
    >
      <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center shrink-0`}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-ink">{value}</p>
        <p className="text-sm text-ink3 mt-0.5">{label}</p>
      </div>
    </Link>
  );
}

function QuickAction({
  label,
  icon,
  href,
  color,
}: {
  label: string;
  icon: React.ReactNode;
  href: string;
  color: string;
}) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center gap-2.5 p-4 rounded-2xl border border-[#e7e5e4] bg-white hover:shadow-md hover:border-accent/30 transition-all group"
    >
      <div className={`w-11 h-11 rounded-xl ${color} flex items-center justify-center group-hover:scale-105 transition-transform`}>
        {icon}
      </div>
      <span className="text-xs font-medium text-ink2 text-center">{label}</span>
    </Link>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { t } = useLocale();
  const [docCount, setDocCount] = useState<number>(0);
  const [bookingCount, setBookingCount] = useState<number>(0);
  const [sessionCount, setSessionCount] = useState<number>(0);

  useEffect(() => {
    const today = new Date();

    apiListDocuments().then((result) => {
      if (result.ok && result.files) setDocCount(result.files.length);
    });

    apiGetAppointments().then((result) => {
      if (result.ok && result.appointments) {
        const upcoming = result.appointments.filter(
          (a) => a.Status !== "cancelled" && new Date(a.StartTime) >= today
        );
        setBookingCount(upcoming.length);
      }
    });

    apiGetSessions().then((result) => {
      if (result.ok && result.sessions) setSessionCount(result.sessions.length);
    });
  }, []);

  const hour = new Date().getHours();
  const greeting =
    hour < 12
      ? t.dashboard.good_morning
      : hour < 17
      ? t.dashboard.good_afternoon
      : t.dashboard.good_evening;

  const firstName = user?.name.split(" ")[0] ?? "";

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-6">
      {/* Welcome */}
      <div className="pt-2">
        <h2 className="text-2xl font-bold text-ink">
          {greeting}, {firstName} 👋
        </h2>
        <p className="text-sm text-ink3 mt-1">
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label={t.dashboard.upcoming_label}
          value={bookingCount}
          color="bg-cyan-50 text-accent-cool"
          href="/dashboard/booking"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          }
        />
        <StatCard
          label={t.dashboard.messages_label}
          value={sessionCount}
          color="bg-orange-50 text-accent"
          href="/dashboard/chat"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          }
        />
        <StatCard
          label={t.dashboard.docs_label}
          value={docCount}
          color="bg-amber-50 text-accent-warm"
          href="/dashboard/documents"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          }
        />
      </div>

      {/* Quick actions */}
      <div className="bg-white rounded-2xl border border-[#e7e5e4] p-5">
        <p className="text-sm font-semibold text-ink2 mb-4">{t.dashboard.quick_actions}</p>
        <div className="grid grid-cols-3 gap-3">
          <QuickAction
            label={t.dashboard.new_chat}
            href="/dashboard/chat"
            color="bg-orange-50 text-accent"
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            }
          />
          <QuickAction
            label={t.dashboard.book_appt}
            href="/dashboard/booking"
            color="bg-cyan-50 text-accent-cool"
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            }
          />
          <QuickAction
            label={t.dashboard.upload_doc}
            href="/dashboard/documents"
            color="bg-amber-50 text-accent-warm"
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
            }
          />
        </div>
      </div>
    </div>
  );
}
