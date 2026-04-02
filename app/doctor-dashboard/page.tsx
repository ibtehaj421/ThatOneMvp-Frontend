"use client";

import Link from "next/link";
import { useAuth } from "../_components/providers/AuthProvider";
import { useLocale } from "../_components/providers/LocaleProvider";

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

const queue = [
  {
    name: "Sara Ali",
    time: "09:20",
    reason: "Follow-up for BP management",
    flag: "Low risk",
    action: "Start consult",
  },
  {
    name: "Hassan Khan",
    time: "09:40",
    reason: "Persistent chest discomfort",
    flag: "Urgent",
    action: "Open chart",
  },
  {
    name: "Ayesha Noor",
    time: "10:10",
    reason: "Post-op wound review",
    flag: "Medium risk",
    action: "Review labs",
  },
  {
    name: "Bilal Ahmed",
    time: "10:35",
    reason: "Medication side effects",
    flag: "Low risk",
    action: "Add note",
  },
];

const alerts = [
  "2 abnormal lab results need review",
  "1 refill request awaiting approval",
  "3 patient follow-ups are due today",
];

const schedule = [
  { slot: "09:00", patient: "Morning consult block", status: "Full" },
  { slot: "11:30", patient: "Review slot", status: "Available" },
  { slot: "14:00", patient: "Telehealth block", status: "2 sessions" },
  { slot: "16:30", patient: "Wrap-up / notes", status: "Open" },
];

const consultIcon = (
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
      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
    />
  </svg>
);

const labsIcon = (
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
      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
    />
  </svg>
);

const rxIcon = (
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
      d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
    />
  </svg>
);

const noteIcon = (
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
      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
    />
  </svg>
);

export default function DoctorDashboardPage() {
  const { user } = useAuth();
  const { t } = useLocale();
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const doctorName = user?.name ?? "Doctor";

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6">
      <div className="pt-2 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl font-bold text-ink">
            {greeting}, {doctorName}
          </h2>
          <p className="text-sm text-ink3 mt-1">
            {t.doctor.greeting} ·{" "}
            {new Date().toLocaleDateString("en-US", {
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
          value={12}
          color="bg-orange-50 text-accent"
          href="/doctor-dashboard/appointments"
          icon={
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.8}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          }
        />
        <StatCard
          label={t.doctor.waiting_room}
          value={4}
          color="bg-cyan-50 text-accent-cool"
          href="/doctor-dashboard/patients"
          icon={
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.8}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          }
        />
        <StatCard
          label={t.doctor.due_followups}
          value={6}
          color="bg-amber-50 text-accent-warm"
          href="/doctor-dashboard/reports"
          icon={
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.8}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          }
        />
        <StatCard
          label={t.doctor.unread_messages}
          value={3}
          color="bg-cyan-50 text-accent-cool"
          href="/doctor-dashboard/messages"
          icon={
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.8}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          }
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-[#e7e5e4] p-5">
          <div className="flex items-center justify-between gap-3 mb-4">
            <p className="text-sm font-semibold text-ink2">
              {t.doctor.todays_queue}
            </p>
            <Link
              href="/doctor-dashboard/appointments"
              className="text-xs text-accent font-medium hover:underline"
            >
              View all
            </Link>
          </div>

          <div className="space-y-3">
            {queue.map((item) => (
              <div
                key={item.name}
                className="rounded-2xl border border-[#e7e5e4] p-4 flex flex-col sm:flex-row sm:items-center gap-4"
              >
                <div className="w-11 h-11 rounded-full bg-accent/10 text-accent font-semibold flex items-center justify-center shrink-0">
                  {item.name
                    .split(" ")
                    .map((part) => part[0])
                    .slice(0, 2)
                    .join("")}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold text-ink">
                      {item.name}
                    </p>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-bg2 text-ink2">
                      {item.flag}
                    </span>
                  </div>
                  <p className="text-xs text-ink3 mt-0.5">{item.reason}</p>
                </div>
                <div className="flex items-center gap-3 sm:justify-end">
                  <span className="text-xs font-medium text-ink3">
                    {item.time}
                  </span>
                  <button className="h-9 px-4 rounded-xl bg-accent text-white text-sm font-medium hover:bg-accent-hover transition-colors">
                    {item.action}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-[#e7e5e4] p-5">
            <p className="text-sm font-semibold text-ink2 mb-3">
              Urgent alerts
            </p>
            <div className="space-y-2.5">
              {alerts.map((alert) => (
                <div
                  key={alert}
                  className="rounded-xl bg-orange-50 border border-orange-100 px-3 py-2.5 text-sm text-ink2"
                >
                  {alert}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-[#e7e5e4] p-5">
            <p className="text-sm font-semibold text-ink2 mb-3">
              {t.doctor.my_schedule}
            </p>
            <div className="space-y-3">
              {schedule.map((slot) => (
                <div
                  key={slot.slot}
                  className="flex items-center justify-between gap-3"
                >
                  <div>
                    <p className="text-sm font-medium text-ink">{slot.slot}</p>
                    <p className="text-xs text-ink3">{slot.patient}</p>
                  </div>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-bg2 text-ink2">
                    {slot.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[#e7e5e4] p-5">
        <p className="text-sm font-semibold text-ink2 mb-4">
          {t.doctor.quick_actions}
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <ActionCard
            label={t.doctor.start_consult}
            href="/doctor-dashboard/messages"
            color="bg-orange-50 text-accent"
            icon={consultIcon}
          />
          <ActionCard
            label={t.doctor.review_labs}
            href="/doctor-dashboard/reports"
            color="bg-cyan-50 text-accent-cool"
            icon={labsIcon}
          />
          <ActionCard
            label={t.doctor.issue_rx}
            href="/doctor-dashboard/patients"
            color="bg-amber-50 text-accent-warm"
            icon={rxIcon}
          />
          <ActionCard
            label={t.doctor.add_note}
            href="/doctor-dashboard/appointments"
            color="bg-orange-50 text-accent"
            icon={noteIcon}
          />
        </div>
      </div>
    </div>
  );
}
