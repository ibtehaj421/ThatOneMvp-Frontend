"use client";

import { useState } from "react";
import { Button } from "../../_components/ui/Button";
import { useLocale } from "../../_components/providers/LocaleProvider";

const appointments = [
  {
    patient: "Sara Ali",
    time: "09:20",
    type: "Follow-up",
    status: "Confirmed",
    note: "Blood pressure review",
  },
  {
    patient: "Hassan Khan",
    time: "09:40",
    type: "Urgent",
    status: "Waiting",
    note: "Chest discomfort",
  },
  {
    patient: "Ayesha Noor",
    time: "10:10",
    type: "Post-op",
    status: "In progress",
    note: "Wound check",
  },
  {
    patient: "Bilal Ahmed",
    time: "10:35",
    type: "Consult",
    status: "Scheduled",
    note: "Medication side effects",
  },
];

export default function DoctorAppointmentsPage() {
  const { t } = useLocale();
  const [filter, setFilter] = useState<"today" | "week" | "month">("today");

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <p className="text-sm font-semibold text-ink2">
            {t.doctor.appointments}
          </p>
          <p className="text-xs text-ink3 mt-1">
            Manage your consultation blocks, queues, and follow-ups.
          </p>
        </div>
        <div className="flex gap-2 bg-bg2 p-1 rounded-xl">
          {(["today", "week", "month"] as const).map((item) => (
            <button
              key={item}
              onClick={() => setFilter(item)}
              className={[
                "h-8 px-3 rounded-lg text-xs font-medium transition-colors",
                filter === item
                  ? "bg-white text-ink shadow-sm"
                  : "text-ink3 hover:text-ink2",
              ].join(" ")}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-3">
          {appointments.map((appt) => (
            <div
              key={appt.patient}
              className="bg-white rounded-2xl border border-[#e7e5e4] p-4 flex flex-col sm:flex-row sm:items-center gap-4"
            >
              <div className="w-11 h-11 rounded-full bg-accent/10 text-accent font-semibold flex items-center justify-center shrink-0">
                {appt.patient
                  .split(" ")
                  .map((part) => part[0])
                  .slice(0, 2)
                  .join("")}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-semibold text-ink">
                    {appt.patient}
                  </p>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-bg2 text-ink2">
                    {appt.type}
                  </span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-orange-50 text-accent">
                    {appt.status}
                  </span>
                </div>
                <p className="text-xs text-ink3 mt-0.5">{appt.note}</p>
              </div>
              <div className="flex items-center gap-2 sm:justify-end">
                <span className="text-xs text-ink3">{appt.time}</span>
                <Button size="sm">Open</Button>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-[#e7e5e4] p-5">
            <p className="text-sm font-semibold text-ink2 mb-3">
              Queue summary
            </p>
            <div className="space-y-2 text-sm text-ink2">
              <div className="flex items-center justify-between">
                <span>Waiting now</span>
                <strong>4</strong>
              </div>
              <div className="flex items-center justify-between">
                <span>Seen today</span>
                <strong>12</strong>
              </div>
              <div className="flex items-center justify-between">
                <span>No-show risk</span>
                <strong className="text-amber-600">2</strong>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-[#e7e5e4] p-5">
            <p className="text-sm font-semibold text-ink2 mb-3">Next steps</p>
            <ul className="space-y-2 text-sm text-ink2">
              <li>Review Ayesha Noor post-op images</li>
              <li>Approve Bilal Ahmed medication plan</li>
              <li>Update Sara Ali follow-up note</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
