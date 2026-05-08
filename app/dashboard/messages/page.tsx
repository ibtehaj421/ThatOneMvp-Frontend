"use client";

import { useState, useEffect } from "react";
import {
  apiGetAppointments,
  type BackendAppointment,
} from "../../_lib/api";
import { AppointmentChat } from "../../_components/AppointmentChat";
import { useAuth } from "../../_components/providers/AuthProvider";

const STATUS_STYLE: Record<string, string> = {
  pending:   "bg-amber-100 text-amber-700",
  confirmed: "bg-green-100 text-green-700",
  completed: "bg-blue-100 text-blue-700",
  missed:    "bg-red-100 text-red-700",
  cancelled: "bg-gray-100 text-gray-500",
};

function EmptyChat() {
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center px-6">
        <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-4">
          <svg className="w-7 h-7 text-accent" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        <p className="text-sm font-semibold text-ink">Select a conversation</p>
        <p className="text-xs text-ink3 mt-1 leading-relaxed">
          Pick an appointment from the left to chat with your doctor.
        </p>
      </div>
    </div>
  );
}

export default function PatientMessagesPage() {
  const { user } = useAuth();
  const userId = parseInt(user?.id ?? "0");
  const username = user?.name ?? "";

  const [appointments, setAppointments] = useState<BackendAppointment[]>([]);
  const [selected, setSelected] = useState<BackendAppointment | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGetAppointments().then((apptRes) => {
      if (apptRes.ok && apptRes.appointments) {
        setAppointments(apptRes.appointments.filter((a: BackendAppointment) => a.Status !== "cancelled"));
      }
      setLoading(false);
    });
  }, []);

  const providerName = (appt: BackendAppointment) =>
    appt.Provider?.Username ?? `Doctor #${appt.ProviderID}`;

  const initials = (name: string) =>
    name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase() || "??";

  const dateLabel = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  return (
    <div className="h-full flex overflow-hidden">
      {/* ── Thread list ─────────────────────────────────────────── */}
      <div className="w-72 shrink-0 flex flex-col border-r border-[#e7e5e4] bg-white">
        <div className="px-4 py-3.5 border-b border-[#e7e5e4]">
          <p className="text-sm font-semibold text-ink">Messages</p>
          <p className="text-xs text-ink3 mt-0.5">Per-appointment chats with your doctor</p>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center gap-1 py-10">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="w-2 h-2 rounded-full bg-ink3 animate-bounce"
                  style={{ animationDelay: `${i * 150}ms` }}
                />
              ))}
            </div>
          ) : appointments.length === 0 ? (
            <div className="px-4 py-10 text-center">
              <p className="text-xs text-ink3">No appointments yet. Book one to start chatting.</p>
            </div>
          ) : (
            appointments.map((appt) => {
              const name = providerName(appt);
              const active = selected?.ID === appt.ID;
              return (
                <button
                  key={appt.ID}
                  onClick={() => setSelected(appt)}
                  className={[
                    "w-full flex items-start gap-3 px-4 py-3 text-left transition-colors border-b border-[#e7e5e4]/60",
                    active ? "bg-orange-50" : "hover:bg-bg2",
                  ].join(" ")}
                >
                  <div className="w-9 h-9 rounded-full bg-accent/15 text-accent text-[11px] font-bold flex items-center justify-center shrink-0">
                    {initials(name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <p className="text-xs font-semibold text-ink truncate">{name}</p>
                      <p className="text-[10px] text-ink3 shrink-0">{dateLabel(appt.StartTime)}</p>
                    </div>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className={["text-[10px] font-medium px-1.5 py-0.5 rounded-full", STATUS_STYLE[appt.Status] ?? "bg-gray-100 text-gray-500"].join(" ")}>
                        {appt.Status}
                      </span>
                      {appt.Organization?.Name && (
                        <span className="text-[10px] text-ink3 truncate">{appt.Organization.Name}</span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* ── Chat panel ──────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-bg2">
        {selected && userId > 0 ? (
          <>
            {/* Header */}
            <div className="px-5 py-3 bg-white border-b border-[#e7e5e4] shrink-0">
              <p className="text-sm font-semibold text-ink">{providerName(selected)}</p>
              <p className="text-[11px] text-ink3 mt-0.5">
                {selected.Organization?.Name && `${selected.Organization.Name} · `}
                {new Date(selected.StartTime).toLocaleString("en-US", {
                  weekday: "short", month: "short", day: "numeric",
                  hour: "2-digit", minute: "2-digit",
                })}
                {" · "}
                <span className="capitalize">{selected.Status}</span>
              </p>
            </div>
            {/* Chat fills remaining space */}
            <div className="flex-1 overflow-hidden p-4">
              <AppointmentChat
                key={selected.ID}
                appointmentId={selected.ID}
                currentUserId={userId}
                currentUsername={username}
                className="h-full"
              />
            </div>
          </>
        ) : (
          <EmptyChat />
        )}
      </div>
    </div>
  );
}
