"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "../_components/providers/AuthProvider";
import { useLocale } from "../_components/providers/LocaleProvider";
import { apiGetAppointments, type BackendAppointment } from "../_lib/api";

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
      <div
        className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center shrink-0`}
      >
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-ink">{value}</p>
        <p className="text-sm text-ink3 mt-0.5">{label}</p>
      </div>
    </Link>
  );
}

function ActionCard({
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
      <div
        className={`w-11 h-11 rounded-xl ${color} flex items-center justify-center group-hover:scale-105 transition-transform`}
      >
        {icon}
      </div>
      <span className="text-xs font-medium text-ink2 text-center">{label}</span>
    </Link>
  );
}

function statusBadgeColor(status: BackendAppointment["Status"]) {
  if (status === "confirmed") return "bg-green-50 text-green-700";
  if (status === "pending") return "bg-amber-50 text-amber-700";
  if (status === "completed") return "bg-blue-50 text-blue-700";
  return "bg-red-50 text-red-700";
}

const consultIcon = (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
  </svg>
);

const labsIcon = (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const rxIcon = (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
  </svg>
);

const noteIcon = (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

export default function DoctorDashboardPage() {
  const { user } = useAuth();
  const { t } = useLocale();
  const [appointments, setAppointments] = useState<BackendAppointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGetAppointments().then((result) => {
      if (result.ok && result.appointments) setAppointments(result.appointments);
      setLoading(false);
    });
  }, []);

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const doctorName = user?.name ?? "Doctor";
  const today = new Date();

  const todayAppts = appointments.filter((a) => {
    const d = new Date(a.StartTime);
    return d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
  });

  const activeToday = todayAppts.filter((a) => a.Status !== "cancelled");
  const waitingNow = todayAppts.filter((a) => a.Status === "pending");
  const upcomingQueue = appointments
    .filter((a) => a.Status !== "cancelled" && new Date(a.StartTime) >= today)
    .sort((a, b) => new Date(a.StartTime).getTime() - new Date(b.StartTime).getTime())
    .slice(0, 4);

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6">
      <div className="pt-2 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl font-bold text-ink">
            {greeting}, {doctorName}
          </h2>
          <p className="text-sm text-ink3 mt-1">
            {t.doctor.greeting} ·{" "}
            {today.toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-50 border border-orange-100 text-accent text-xs font-semibold tracking-wide">
          <span className="w-1.5 h-1.5 rounded-full bg-accent inline-block animate-pulse" />
          {t.doctor.on_duty}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          label={t.doctor.todays_queue}
          value={activeToday.length}
          color="bg-orange-50 text-accent"
          href="/doctor-dashboard/appointments"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          }
        />
        <StatCard
          label={t.doctor.waiting_room}
          value={waitingNow.length}
          color="bg-cyan-50 text-accent-cool"
          href="/doctor-dashboard/patients"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          }
        />
        <StatCard
          label={t.doctor.due_followups}
          value={appointments.filter((a) => a.Status === "completed").length}
          color="bg-amber-50 text-accent-warm"
          href="/doctor-dashboard/reports"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          }
        />
        <StatCard
          label={t.doctor.unread_messages}
          value={appointments.filter((a) => a.Status === "pending").length}
          color="bg-cyan-50 text-accent-cool"
          href="/doctor-dashboard/messages"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          }
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-[#e7e5e4] p-5">
          <div className="flex items-center justify-between gap-3 mb-4">
            <p className="text-sm font-semibold text-ink2">{t.doctor.todays_queue}</p>
            <Link href="/doctor-dashboard/appointments" className="text-xs text-accent font-medium hover:underline">
              View all
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center gap-1 py-8">
              {[0,1,2].map((i) => <span key={i} className="w-2 h-2 rounded-full bg-ink3 animate-bounce" style={{ animationDelay: `${i*150}ms` }} />)}
            </div>
          ) : upcomingQueue.length === 0 ? (
            <p className="text-sm text-ink3 text-center py-8">No upcoming appointments</p>
          ) : (
            <div className="space-y-3">
              {upcomingQueue.map((appt) => {
                const start = new Date(appt.StartTime);
                const timeStr = start.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
                const orgName = appt.Organization?.Name ?? `Organization #${appt.OrganizationID}`;
                const patientLabel = appt.Patient?.Username ?? `Patient #${appt.PatientID}`;
                const initials = patientLabel.slice(0, 2).toUpperCase();
                return (
                  <div key={appt.ID} className="rounded-2xl border border-[#e7e5e4] p-4 flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="w-11 h-11 rounded-full bg-accent/10 text-accent font-semibold flex items-center justify-center shrink-0">
                      {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-semibold text-ink">{patientLabel}</p>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusBadgeColor(appt.Status)}`}>
                          {appt.Status}
                        </span>
                      </div>
                      <p className="text-xs text-ink3 mt-0.5">{orgName}</p>
                      {appt.Notes && <p className="text-xs text-ink3 mt-0.5">{appt.Notes}</p>}
                    </div>
                    <span className="text-xs font-medium text-ink3 shrink-0">{timeStr}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-[#e7e5e4] p-5">
          <p className="text-sm font-semibold text-ink2 mb-3">{t.doctor.my_schedule}</p>
          {loading ? (
            <div className="flex justify-center gap-1 py-4">
              {[0,1,2].map((i) => <span key={i} className="w-2 h-2 rounded-full bg-ink3 animate-bounce" style={{ animationDelay: `${i*150}ms` }} />)}
            </div>
          ) : todayAppts.length === 0 ? (
            <p className="text-sm text-ink3 text-center py-4">No appointments today</p>
          ) : (
            <div className="space-y-3">
              {todayAppts
                .filter((a) => a.Status !== "cancelled")
                .sort((a, b) => new Date(a.StartTime).getTime() - new Date(b.StartTime).getTime())
                .map((appt) => {
                  const timeStr = new Date(appt.StartTime).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
                  const patientLabel = appt.Patient?.Username ?? `Patient #${appt.PatientID}`;
                  return (
                    <div key={appt.ID} className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-ink">{timeStr}</p>
                        <p className="text-xs text-ink3">{patientLabel}</p>
                      </div>
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${statusBadgeColor(appt.Status)}`}>
                        {appt.Status}
                      </span>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[#e7e5e4] p-5">
        <p className="text-sm font-semibold text-ink2 mb-4">{t.doctor.quick_actions}</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <ActionCard label={t.doctor.start_consult} href="/doctor-dashboard/messages" color="bg-orange-50 text-accent" icon={consultIcon} />
          <ActionCard label={t.doctor.review_labs} href="/doctor-dashboard/reports" color="bg-cyan-50 text-accent-cool" icon={labsIcon} />
          <ActionCard label={t.doctor.issue_rx} href="/doctor-dashboard/patients" color="bg-amber-50 text-accent-warm" icon={rxIcon} />
          <ActionCard label={t.doctor.add_note} href="/doctor-dashboard/appointments" color="bg-orange-50 text-accent" icon={noteIcon} />
        </div>
      </div>
    </div>
  );
}
