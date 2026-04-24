"use client";

import { useState, useEffect } from "react";
import { useLocale } from "../../_components/providers/LocaleProvider";
import {
  apiGetAppointments,
  apiGetAppointmentContext,
  apiUpdateAppointmentNotes,
  type BackendAppointment,
  type AppointmentContext,
} from "../../_lib/api";

function statusColor(status: BackendAppointment["Status"]) {
  if (status === "confirmed") return "bg-green-50 text-green-700";
  if (status === "pending") return "bg-amber-50 text-amber-700";
  if (status === "completed") return "bg-blue-50 text-blue-700";
  return "bg-red-50 text-red-700";
}

function ContextModal({
  apptId,
  onClose,
  onSaved,
}: {
  apptId: number;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [ctx, setCtx] = useState<AppointmentContext | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<BackendAppointment["Status"]>("confirmed");
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");

  useEffect(() => {
    apiGetAppointmentContext(apptId).then((r) => {
      if (r.ok && r.context) {
        setCtx(r.context);
        setNotes(r.context.appointment_details.doctor_notes ?? "");
        setStatus(r.context.appointment_details.status);
      } else {
        setError(r.error ?? "Failed to load context.");
      }
      setLoading(false);
    });
  }, [apptId]);

  const handleSave = async () => {
    setSaving(true);
    setSaveMsg("");
    const result = await apiUpdateAppointmentNotes(apptId, notes, status);
    setSaving(false);
    if (result.ok) {
      setSaveMsg("Saved.");
      onSaved();
    } else {
      setSaveMsg(result.error ?? "Failed to save.");
    }
  };

  const intake = ctx?.ai_intake_history;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#e7e5e4] shrink-0">
          <div>
            <p className="text-sm font-semibold text-ink">Patient Context</p>
            {ctx && (
              <p className="text-xs text-ink3 mt-0.5">
                {ctx.patient_demographics.username} · Appointment #{apptId}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-ink3 hover:bg-bg2 transition-colors text-lg leading-none"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          {loading ? (
            <div className="flex justify-center gap-1 py-12">
              {[0, 1, 2].map((i) => (
                <span key={i} className="w-2 h-2 rounded-full bg-ink3 animate-bounce" style={{ animationDelay: `${i * 150}ms` }} />
              ))}
            </div>
          ) : error ? (
            <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          ) : ctx && (
            <>
              {/* Demographics */}
              <section>
                <p className="text-xs font-semibold text-ink3 uppercase tracking-wider mb-2">Patient</p>
                <div className="bg-bg2 rounded-xl px-4 py-3 space-y-1 text-sm">
                  <p><span className="font-medium text-ink2">Name:</span> {ctx.patient_demographics.username}</p>
                  <p><span className="font-medium text-ink2">Email:</span> {ctx.patient_demographics.email}</p>
                  <p>
                    <span className="font-medium text-ink2">Appointment:</span>{" "}
                    {new Date(ctx.appointment_details.start_time).toLocaleString("en-US", {
                      dateStyle: "medium", timeStyle: "short",
                    })}
                  </p>
                </div>
              </section>

              {/* AI Intake History */}
              {intake && (
                <section>
                  <p className="text-xs font-semibold text-ink3 uppercase tracking-wider mb-2">AI Intake History</p>
                  <div className="space-y-3">
                    {intake.chief_complaint && (
                      <div className="bg-bg2 rounded-xl px-4 py-3">
                        <p className="text-xs font-semibold text-ink2 mb-1">Chief Complaint</p>
                        <p className="text-sm text-ink">{intake.chief_complaint}</p>
                      </div>
                    )}

                    {(intake.positive_symptoms?.length ?? 0) > 0 && (
                      <div className="bg-bg2 rounded-xl px-4 py-3">
                        <p className="text-xs font-semibold text-ink2 mb-2">Positive Symptoms</p>
                        <ul className="space-y-2">
                          {(intake.positive_symptoms ?? []).map((s, i) => (
                            <li key={i} className="text-sm text-ink">
                              <span className="font-medium">{s.value}</span>
                              {(s.onset || s.severity || s.duration) && (
                                <span className="text-ink3 ml-1">
                                  {[s.onset && `Onset: ${s.onset}`, s.severity && `Severity: ${s.severity}`, s.duration && `Duration: ${s.duration}`].filter(Boolean).join(" · ")}
                                </span>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {(intake.negative_symptoms?.length ?? 0) > 0 && (
                      <div className="bg-bg2 rounded-xl px-4 py-3">
                        <p className="text-xs font-semibold text-ink2 mb-2">Negative Symptoms (denied)</p>
                        <p className="text-sm text-ink">{(intake.negative_symptoms ?? []).map((s) => s.value).join(", ")}</p>
                      </div>
                    )}

                    {(intake.patient_medical_history?.length ?? 0) > 0 && (
                      <div className="bg-bg2 rounded-xl px-4 py-3">
                        <p className="text-xs font-semibold text-ink2 mb-1">Past Medical History</p>
                        <ul className="list-disc list-inside text-sm text-ink space-y-0.5">
                          {(intake.patient_medical_history ?? []).map((h, i) => <li key={i}>{h}</li>)}
                        </ul>
                      </div>
                    )}

                    {(intake.medications?.length ?? 0) > 0 && (
                      <div className="bg-bg2 rounded-xl px-4 py-3">
                        <p className="text-xs font-semibold text-ink2 mb-1">Medications</p>
                        <ul className="list-disc list-inside text-sm text-ink space-y-0.5">
                          {(intake.medications ?? []).map((m, i) => <li key={i}>{m}</li>)}
                        </ul>
                      </div>
                    )}

                    {(intake.family_medical_history?.length ?? 0) > 0 && (
                      <div className="bg-bg2 rounded-xl px-4 py-3">
                        <p className="text-xs font-semibold text-ink2 mb-1">Family History</p>
                        <ul className="list-disc list-inside text-sm text-ink space-y-0.5">
                          {(intake.family_medical_history ?? []).map((h, i) => <li key={i}>{h}</li>)}
                        </ul>
                      </div>
                    )}

                    {Object.keys(intake.habits ?? {}).length > 0 && (
                      <div className="bg-bg2 rounded-xl px-4 py-3">
                        <p className="text-xs font-semibold text-ink2 mb-1">Habits</p>
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(intake.habits ?? {}).map(([k, v]) => (
                            <span key={k} className="text-xs px-2 py-0.5 rounded-full bg-white border border-[#e7e5e4] text-ink2">
                              {k}: {String(v)}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {intake.basic_information?.concerns_and_expectations && (
                      <div className="bg-bg2 rounded-xl px-4 py-3">
                        <p className="text-xs font-semibold text-ink2 mb-1">Patient Concerns (ICE)</p>
                        <p className="text-sm text-ink">{String(intake.basic_information.concerns_and_expectations)}</p>
                      </div>
                    )}

                    {!intake.chief_complaint && (intake.positive_symptoms?.length ?? 0) === 0 && (
                      <p className="text-sm text-ink3 text-center py-2">No AI intake data available for this patient yet.</p>
                    )}
                  </div>
                </section>
              )}

              {/* Doctor Notes */}
              <section>
                <p className="text-xs font-semibold text-ink3 uppercase tracking-wider mb-2">Clinical Notes</p>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-ink2 block mb-1">Status</label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as BackendAppointment["Status"])}
                      className="w-full h-10 rounded-xl border border-[#e7e5e4] bg-bg2 px-3 text-sm text-ink outline-none focus:border-accent"
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-ink2 block mb-1">Notes</label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Enter clinical notes…"
                      rows={4}
                      className="w-full rounded-xl border border-[#e7e5e4] bg-bg2 px-3 py-2.5 text-sm text-ink placeholder:text-ink3 outline-none focus:border-accent resize-none"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="h-9 px-5 rounded-xl bg-accent text-white text-sm font-medium hover:bg-accent-hover transition-colors disabled:opacity-40"
                    >
                      {saving ? "Saving…" : "Save Notes"}
                    </button>
                    {saveMsg && (
                      <span className={`text-sm ${saveMsg === "Saved." ? "text-green-600" : "text-red-600"}`}>
                        {saveMsg}
                      </span>
                    )}
                  </div>
                </div>
              </section>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function DoctorAppointmentsPage() {
  const { t } = useLocale();
  const [filter, setFilter] = useState<"today" | "week" | "month">("today");
  const [appointments, setAppointments] = useState<BackendAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [openApptId, setOpenApptId] = useState<number | null>(null);

  const fetchAppointments = async () => {
    const result = await apiGetAppointments();
    if (result.ok && result.appointments) setAppointments(result.appointments);
    setLoading(false);
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const now = new Date();

  const filtered = appointments.filter((a) => {
    if (a.Status === "cancelled") return false;
    const d = new Date(a.StartTime);
    if (filter === "today") {
      return d.getDate() === now.getDate() && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }
    if (filter === "week") {
      const weekAhead = new Date(now);
      weekAhead.setDate(now.getDate() + 7);
      return d >= now && d <= weekAhead;
    }
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });

  const waiting = appointments.filter((a) => a.Status === "pending");
  const seen = appointments.filter((a) => a.Status === "completed");

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <p className="text-sm font-semibold text-ink2">{t.doctor.appointments}</p>
          <p className="text-xs text-ink3 mt-1">Manage your consultation blocks, queues, and follow-ups.</p>
        </div>
        <div className="flex gap-2 bg-bg2 p-1 rounded-xl">
          {(["today", "week", "month"] as const).map((item) => (
            <button
              key={item}
              onClick={() => setFilter(item)}
              className={[
                "h-8 px-3 rounded-lg text-xs font-medium transition-colors",
                filter === item ? "bg-white text-ink shadow-sm" : "text-ink3 hover:text-ink2",
              ].join(" ")}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-3">
          {loading ? (
            <div className="bg-white rounded-2xl border border-[#e7e5e4] p-8 flex justify-center gap-1">
              {[0, 1, 2].map((i) => <span key={i} className="w-2 h-2 rounded-full bg-ink3 animate-bounce" style={{ animationDelay: `${i * 150}ms` }} />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-white rounded-2xl border border-[#e7e5e4] p-8 text-center">
              <p className="text-sm text-ink3">No appointments for this period</p>
            </div>
          ) : (
            filtered
              .sort((a, b) => new Date(a.StartTime).getTime() - new Date(b.StartTime).getTime())
              .map((appt) => {
                const start = new Date(appt.StartTime);
                const timeStr = start.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
                const patientLabel = appt.Patient?.Username ?? `Patient #${appt.PatientID}`;
                const orgName = appt.Organization?.Name ?? `Organization #${appt.OrganizationID}`;
                const initials = patientLabel.slice(0, 2).toUpperCase();
                return (
                  <div
                    key={appt.ID}
                    className="bg-white rounded-2xl border border-[#e7e5e4] p-4 flex flex-col sm:flex-row sm:items-center gap-4"
                  >
                    <div className="w-11 h-11 rounded-full bg-accent/10 text-accent font-semibold flex items-center justify-center shrink-0">
                      {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-semibold text-ink">{patientLabel}</p>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusColor(appt.Status)}`}>
                          {appt.Status}
                        </span>
                      </div>
                      <p className="text-xs text-ink3 mt-0.5">{orgName}</p>
                      {appt.Notes && <p className="text-xs text-ink3 mt-0.5 italic">{appt.Notes}</p>}
                    </div>
                    <div className="flex items-center gap-2 sm:justify-end shrink-0">
                      <span className="text-xs text-ink3">{timeStr}</span>
                      <button
                        onClick={() => setOpenApptId(appt.ID)}
                        className="h-8 px-3 rounded-xl bg-accent text-white text-xs font-medium hover:bg-accent-hover transition-colors"
                      >
                        Open
                      </button>
                    </div>
                  </div>
                );
              })
          )}
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-[#e7e5e4] p-5">
            <p className="text-sm font-semibold text-ink2 mb-3">Queue summary</p>
            <div className="space-y-2 text-sm text-ink2">
              <div className="flex items-center justify-between">
                <span>Waiting now</span>
                <strong>{waiting.length}</strong>
              </div>
              <div className="flex items-center justify-between">
                <span>Seen / completed</span>
                <strong>{seen.length}</strong>
              </div>
              <div className="flex items-center justify-between">
                <span>Total</span>
                <strong>{appointments.filter((a) => a.Status !== "cancelled").length}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      {openApptId !== null && (
        <ContextModal
          apptId={openApptId}
          onClose={() => setOpenApptId(null)}
          onSaved={() => {
            fetchAppointments();
          }}
        />
      )}
    </div>
  );
}
