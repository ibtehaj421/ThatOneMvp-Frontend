"use client";

import { useState, useEffect } from "react";
import {
  apiGetMyOrganizations,
  apiGetOrgAppointments,
  apiMarkAppointmentMissed,
  apiUpdateAppointmentNotes,
  type BackendAppointment,
  type BackendOrganization,
} from "../../_lib/api";

// ── Time grid config ──────────────────────────────────────────────────────────
const HOUR_START = 8;
const HOUR_END = 20;
const SLOT_MINS = 30;
const TOTAL_SLOTS = ((HOUR_END - HOUR_START) * 60) / SLOT_MINS;

function slotLabel(index: number): string {
  const totalMins = HOUR_START * 60 + index * SLOT_MINS;
  const h = Math.floor(totalMins / 60);
  const m = totalMins % 60;
  const ampm = h < 12 ? "AM" : "PM";
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${h12}:${m.toString().padStart(2, "0")} ${ampm}`;
}

function getWeekDates(anchor: Date): Date[] {
  const monday = new Date(anchor);
  monday.setDate(anchor.getDate() - ((anchor.getDay() + 6) % 7));
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function appointmentSlotIndex(appt: BackendAppointment): number {
  const d = new Date(appt.StartTime);
  const totalMins = d.getHours() * 60 + d.getMinutes();
  return Math.floor((totalMins - HOUR_START * 60) / SLOT_MINS);
}

function statusStyle(status: BackendAppointment["Status"]): string {
  if (status === "confirmed")  return "bg-green-50 border-green-300 text-green-800";
  if (status === "pending")    return "bg-amber-50 border-amber-300 text-amber-800";
  if (status === "completed")  return "bg-blue-50 border-blue-300 text-blue-800";
  if (status === "missed")     return "bg-red-50 border-red-300 text-red-800";
  return "bg-gray-50 border-gray-300 text-gray-600";
}

// ── Cell detail popover ───────────────────────────────────────────────────────
function ApptPopover({
  appt,
  onClose,
  onMissed,
  onSaved,
}: {
  appt: BackendAppointment;
  onClose: () => void;
  onMissed: (id: number) => void;
  onSaved: () => void;
}) {
  const [notes, setNotes] = useState(appt.Notes ?? "");
  const [status, setStatus] = useState(appt.Status);
  const [saving, setSaving] = useState(false);
  const [marking, setMarking] = useState(false);
  const [msg, setMsg] = useState("");

  const handleSave = async () => {
    setSaving(true);
    const r = await apiUpdateAppointmentNotes(appt.ID, notes, status);
    setSaving(false);
    setMsg(r.ok ? "Saved." : r.error ?? "Failed.");
    if (r.ok) onSaved();
  };

  const handleMissed = async () => {
    setMarking(true);
    const r = await apiMarkAppointmentMissed(appt.ID);
    setMarking(false);
    if (r.ok) onMissed(appt.ID);
    else setMsg(r.error ?? "Failed.");
  };

  const patientName = appt.Patient?.FullName || appt.Patient?.Username || `Patient #${appt.PatientID}`;
  const start = new Date(appt.StartTime);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-md p-5 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-sm font-semibold text-ink">{patientName}</p>
            <p className="text-xs text-ink3 mt-0.5">
              {start.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}{" "}
              at {start.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
            </p>
            {appt.Patient?.IdentificationNumber && (
              <p className="text-xs text-ink3">CNIC: {appt.Patient.IdentificationNumber}</p>
            )}
            {appt.Patient?.Location && (
              <p className="text-xs text-ink3">Location: {appt.Patient.Location}</p>
            )}
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-lg text-ink3 hover:bg-bg2 flex items-center justify-center text-lg leading-none">
            ×
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-ink2 block mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as BackendAppointment["Status"])}
              className="w-full h-9 rounded-xl border border-[#e7e5e4] bg-bg2 px-3 text-sm text-ink outline-none focus:border-accent"
            >
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-ink2 block mb-1">Clinical Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Enter notes…"
              rows={3}
              className="w-full rounded-xl border border-[#e7e5e4] bg-bg2 px-3 py-2 text-sm text-ink placeholder:text-ink3 outline-none focus:border-accent resize-none"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleSave}
            disabled={saving}
            className="h-9 px-4 rounded-xl bg-accent text-white text-xs font-medium hover:bg-accent-hover transition-colors disabled:opacity-40"
          >
            {saving ? "Saving…" : "Save"}
          </button>
          {appt.Status !== "missed" && appt.Status !== "completed" && (
            <button
              onClick={handleMissed}
              disabled={marking}
              className="h-9 px-4 rounded-xl bg-red-500 text-white text-xs font-medium hover:bg-red-600 transition-colors disabled:opacity-40"
            >
              {marking ? "Marking…" : "Mark Missed"}
            </button>
          )}
          {msg && (
            <span className={`text-xs ${msg === "Saved." ? "text-green-600" : "text-red-600"}`}>{msg}</span>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function SchedulePage() {
  const [orgs, setOrgs] = useState<BackendOrganization[]>([]);
  const [selectedOrg, setSelectedOrg] = useState<BackendOrganization | null>(null);
  const [appointments, setAppointments] = useState<BackendAppointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [weekAnchor, setWeekAnchor] = useState(new Date());
  const [selectedAppt, setSelectedAppt] = useState<BackendAppointment | null>(null);

  // Load doctor's clinics on mount
  useEffect(() => {
    apiGetMyOrganizations().then((r) => {
      if (r.ok && r.organizations && r.organizations.length > 0) {
        setOrgs(r.organizations);
        setSelectedOrg(r.organizations[0]);
      }
    });
  }, []);

  // Load appointments when clinic or week changes
  useEffect(() => {
    if (!selectedOrg) return;
    setLoading(true);
    apiGetOrgAppointments(selectedOrg.ID).then((r) => {
      if (r.ok && r.appointments) setAppointments(r.appointments);
      setLoading(false);
    });
  }, [selectedOrg]);

  const weekDates = getWeekDates(weekAnchor);

  const prevWeek = () => {
    const d = new Date(weekAnchor);
    d.setDate(d.getDate() - 7);
    setWeekAnchor(d);
  };
  const nextWeek = () => {
    const d = new Date(weekAnchor);
    d.setDate(d.getDate() + 7);
    setWeekAnchor(d);
  };

  // Index appointments into a grid: { "dayIndex-slotIndex": appointment[] }
  const grid: Record<string, BackendAppointment[]> = {};
  appointments.forEach((appt) => {
    const d = new Date(appt.StartTime);
    const dayIdx = weekDates.findIndex(
      (wd) =>
        wd.getFullYear() === d.getFullYear() &&
        wd.getMonth() === d.getMonth() &&
        wd.getDate() === d.getDate(),
    );
    if (dayIdx === -1) return;
    const slotIdx = appointmentSlotIndex(appt);
    if (slotIdx < 0 || slotIdx >= TOTAL_SLOTS) return;
    const key = `${dayIdx}-${slotIdx}`;
    if (!grid[key]) grid[key] = [];
    grid[key].push(appt);
  });

  // Summary stats
  const totalWeek = appointments.filter((a) => {
    const d = new Date(a.StartTime);
    return d >= weekDates[0] && d <= weekDates[6];
  });
  const missed = totalWeek.filter((a) => a.Status === "missed");
  const pending = totalWeek.filter((a) => a.Status === "pending");
  const confirmed = totalWeek.filter((a) => a.Status === "confirmed");

  return (
    <div className="p-4 sm:p-6 max-w-full space-y-4">
      {/* Top bar */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-lg font-semibold text-ink">Weekly Schedule</h1>
          <p className="text-xs text-ink3 mt-0.5">
            {MONTHS[weekDates[0].getMonth()]} {weekDates[0].getDate()} — {MONTHS[weekDates[6].getMonth()]} {weekDates[6].getDate()}, {weekDates[6].getFullYear()}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Clinic selector */}
          {orgs.length > 1 && (
            <select
              value={selectedOrg?.ID ?? ""}
              onChange={(e) => {
                const org = orgs.find((o) => o.ID === Number(e.target.value));
                if (org) setSelectedOrg(org);
              }}
              className="h-9 rounded-xl border border-[#e7e5e4] bg-white px-3 text-sm text-ink outline-none focus:border-accent"
            >
              {orgs.map((o) => (
                <option key={o.ID} value={o.ID}>{o.Name}</option>
              ))}
            </select>
          )}

          {/* Week nav */}
          <div className="flex items-center gap-1 bg-white border border-[#e7e5e4] rounded-xl p-1">
            <button onClick={prevWeek} className="p-1.5 rounded-lg hover:bg-bg2 text-ink3 hover:text-ink transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={() => setWeekAnchor(new Date())}
              className="text-xs font-medium px-2 py-1 rounded-lg hover:bg-bg2 text-ink2 transition-colors"
            >
              Today
            </button>
            <button onClick={nextWeek} className="p-1.5 rounded-lg hover:bg-bg2 text-ink3 hover:text-ink transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "This Week", value: totalWeek.length, color: "text-ink" },
          { label: "Pending",   value: pending.length,   color: "text-amber-600" },
          { label: "Confirmed", value: confirmed.length,  color: "text-green-600" },
          { label: "Missed",    value: missed.length,     color: "text-red-600" },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white rounded-2xl border border-[#e7e5e4] px-4 py-3">
            <p className="text-xs text-ink3">{label}</p>
            <p className={`text-2xl font-bold mt-0.5 ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 flex-wrap text-[11px] font-medium">
        {[
          { label: "Pending",   cls: "bg-amber-50 border-amber-300 text-amber-800" },
          { label: "Confirmed", cls: "bg-green-50 border-green-300 text-green-800" },
          { label: "Completed", cls: "bg-blue-50 border-blue-300 text-blue-800" },
          { label: "Missed",    cls: "bg-red-50 border-red-300 text-red-800" },
          { label: "Cancelled", cls: "bg-gray-50 border-gray-300 text-gray-600" },
        ].map(({ label, cls }) => (
          <span key={label} className={`border rounded-lg px-2 py-0.5 ${cls}`}>{label}</span>
        ))}
      </div>

      {/* Schedule grid */}
      {!selectedOrg ? (
        <div className="bg-white rounded-2xl border border-[#e7e5e4] p-10 text-center">
          <p className="text-sm text-ink3">Register a clinic first to see your schedule.</p>
        </div>
      ) : loading ? (
        <div className="bg-white rounded-2xl border border-[#e7e5e4] p-10 flex justify-center gap-1">
          {[0, 1, 2].map((i) => (
            <span key={i} className="w-2 h-2 rounded-full bg-ink3 animate-bounce" style={{ animationDelay: `${i * 150}ms` }} />
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-[#e7e5e4] bg-white">
          <table className="w-full min-w-[700px] border-collapse text-xs">
            <thead>
              <tr className="bg-bg2">
                {/* Time column header */}
                <th className="w-20 py-2 px-2 text-left text-ink3 font-semibold border-b border-[#e7e5e4] sticky left-0 bg-bg2 z-10">
                  Time
                </th>
                {weekDates.map((date, di) => {
                  const isToday =
                    date.toDateString() === new Date().toDateString();
                  return (
                    <th
                      key={di}
                      className={[
                        "py-2 px-1 text-center font-semibold border-b border-[#e7e5e4] min-w-[100px]",
                        isToday ? "text-accent bg-orange-50" : "text-ink2",
                      ].join(" ")}
                    >
                      <div>{DAY_LABELS[di]}</div>
                      <div className={`text-[10px] font-normal mt-0.5 ${isToday ? "text-accent" : "text-ink3"}`}>
                        {MONTHS[date.getMonth()]} {date.getDate()}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: TOTAL_SLOTS }, (_, slotIdx) => (
                <tr
                  key={slotIdx}
                  className={slotIdx % 2 === 0 ? "bg-white" : "bg-bg2/30"}
                >
                  {/* Time label */}
                  <td className="py-1 px-2 text-ink3 border-b border-[#e7e5e4]/60 whitespace-nowrap sticky left-0 bg-inherit z-10 font-medium">
                    {slotLabel(slotIdx)}
                  </td>

                  {weekDates.map((_, dayIdx) => {
                    const cell = grid[`${dayIdx}-${slotIdx}`] ?? [];
                    return (
                      <td
                        key={dayIdx}
                        className="py-0.5 px-1 border-b border-l border-[#e7e5e4]/60 align-top"
                      >
                        {cell.map((appt) => {
                          const name =
                            appt.Patient?.FullName ||
                            appt.Patient?.Username ||
                            `#${appt.PatientID}`;
                          return (
                            <button
                              key={appt.ID}
                              onClick={() => setSelectedAppt(appt)}
                              className={[
                                "w-full text-left rounded-lg border px-1.5 py-1 mb-0.5 transition-opacity hover:opacity-80",
                                statusStyle(appt.Status),
                              ].join(" ")}
                            >
                              <p className="font-semibold truncate">{name}</p>
                              <p className="text-[10px] opacity-80 capitalize">{appt.Status}</p>
                            </button>
                          );
                        })}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Appointment detail popover */}
      {selectedAppt && (
        <ApptPopover
          appt={selectedAppt}
          onClose={() => setSelectedAppt(null)}
          onMissed={(id) => {
            setAppointments((prev) =>
              prev.map((a) => (a.ID === id ? { ...a, Status: "missed" } : a))
            );
            setSelectedAppt(null);
          }}
          onSaved={() => {
            // Re-fetch to get updated data
            if (selectedOrg) {
              apiGetOrgAppointments(selectedOrg.ID).then((r) => {
                if (r.ok && r.appointments) setAppointments(r.appointments);
              });
            }
            setSelectedAppt(null);
          }}
        />
      )}
    </div>
  );
}
