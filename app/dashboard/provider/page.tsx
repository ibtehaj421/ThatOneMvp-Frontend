"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "../../_components/providers/AuthProvider";
import { getLocalBookings, type LocalBooking } from "../../_lib/api";

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

function statusColor(status: LocalBooking["status"]) {
  if (status === "confirmed") return "bg-green-50 text-green-700 border border-green-100";
  if (status === "pending") return "bg-amber-50 text-amber-700 border border-amber-100";
  return "bg-red-50 text-red-700 border border-red-100";
}

export default function ProviderDashboardPage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<LocalBooking[]>([]);

  useEffect(() => {
    setBookings(getLocalBookings());
  }, []);

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const firstName = user?.name.split(" ")[0] ?? "";

  const pendingBookings = bookings.filter((b) => b.status === "pending");
  const confirmedBookings = bookings.filter((b) => b.status === "confirmed");
  const upcomingBookings = bookings
    .filter((b) => b.status !== "cancelled" && new Date(b.startTime) >= new Date())
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
    .slice(0, 5);

  const handleConfirm = (id: string) => {
    const all = getLocalBookings().map((b) =>
      b.id === id ? { ...b, status: "confirmed" as const } : b
    );
    localStorage.setItem("anam-bookings", JSON.stringify(all));
    setBookings(all);
  };

  const handleCancel = (id: string) => {
    const all = getLocalBookings().map((b) =>
      b.id === id ? { ...b, status: "cancelled" as const } : b
    );
    localStorage.setItem("anam-bookings", JSON.stringify(all));
    setBookings(all);
  };

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-6">
      {/* Welcome */}
      <div className="pt-2">
        <h2 className="text-2xl font-bold text-ink">
          {greeting}, Dr. {firstName}
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
          label="Total Appointments"
          value={bookings.filter((b) => b.status !== "cancelled").length}
          color="bg-cyan-50 text-accent-cool"
          href="/dashboard/provider/patients"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          }
        />
        <StatCard
          label="Pending Requests"
          value={pendingBookings.length}
          color="bg-amber-50 text-accent-warm"
          href="/dashboard/provider/patients"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatCard
          label="Confirmed Today"
          value={confirmedBookings.filter((b) => {
            const d = new Date(b.startTime);
            const t = new Date();
            return d.getDate() === t.getDate() && d.getMonth() === t.getMonth() && d.getFullYear() === t.getFullYear();
          }).length}
          color="bg-green-50 text-green-600"
          href="/dashboard/provider/patients"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
      </div>

      {/* Quick actions */}
      <div className="bg-white rounded-2xl border border-[#e7e5e4] p-5">
        <p className="text-sm font-semibold text-ink2 mb-4">Quick Actions</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "View Patients", href: "/dashboard/provider/patients", color: "bg-cyan-50 text-accent-cool" },
            { label: "Manage Bookings", href: "/dashboard/booking", color: "bg-orange-50 text-accent" },
            { label: "Documents", href: "/dashboard/documents", color: "bg-amber-50 text-accent-warm" },
            { label: "AI Chat", href: "/dashboard/chat", color: "bg-purple-50 text-purple-600" },
          ].map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="flex flex-col items-center gap-2 p-4 rounded-2xl border border-[#e7e5e4] hover:shadow-md hover:border-accent/30 transition-all"
            >
              <div className={`w-10 h-10 rounded-xl ${action.color} flex items-center justify-center`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 9l3 3m0 0l-3 3m3-3H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-xs font-medium text-ink2 text-center">{action.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Upcoming appointments */}
      <div className="bg-white rounded-2xl border border-[#e7e5e4] p-5">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-semibold text-ink2">Upcoming Appointments</p>
          <Link href="/dashboard/provider/patients" className="text-xs text-accent hover:underline">View all</Link>
        </div>
        {upcomingBookings.length === 0 ? (
          <p className="text-sm text-ink3 text-center py-6">No upcoming appointments</p>
        ) : (
          <div className="space-y-3">
            {upcomingBookings.map((appt) => {
              const start = new Date(appt.startTime);
              const dateStr = start.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
              const timeStr = start.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
              return (
                <div key={appt.id} className="flex items-center gap-4 py-3 border-b border-[#f5f5f4] last:border-0">
                  <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-ink">Patient Appointment</p>
                    <p className="text-xs text-ink3">{dateStr} · {timeStr}</p>
                  </div>
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full capitalize ${statusColor(appt.status)}`}>
                    {appt.status}
                  </span>
                  {appt.status === "pending" && (
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => handleConfirm(appt.id)}
                        className="h-7 px-2.5 rounded-lg bg-green-50 text-green-700 text-xs font-medium hover:bg-green-100 transition-colors"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => handleCancel(appt.id)}
                        className="h-7 px-2.5 rounded-lg bg-red-50 text-red-600 text-xs font-medium hover:bg-red-100 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
