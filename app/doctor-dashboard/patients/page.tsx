"use client";

import { useState, useEffect } from "react";
import { apiGetAppointments, type BackendAppointment } from "../../_lib/api";

interface PatientSummary {
  id: number;
  username: string;
  email: string;
  appointmentCount: number;
  lastAppointment: string;
  latestStatus: BackendAppointment["Status"];
}

function initials(name: string) {
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

function statusColor(status: BackendAppointment["Status"]) {
  if (status === "completed") return "bg-green-50 text-green-700";
  if (status === "confirmed") return "bg-blue-50 text-blue-700";
  if (status === "pending") return "bg-amber-50 text-amber-700";
  return "bg-red-50 text-red-700";
}

export default function DoctorPatientsPage() {
  const [patients, setPatients] = useState<PatientSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    apiGetAppointments().then((result) => {
      if (result.ok && result.appointments) {
        const map = new Map<number, PatientSummary>();
        for (const appt of result.appointments) {
          if (!appt.Patient) continue;
          const existing = map.get(appt.Patient.ID);
          if (!existing) {
            map.set(appt.Patient.ID, {
              id: appt.Patient.ID,
              username: appt.Patient.Username,
              email: appt.Patient.Email,
              appointmentCount: 1,
              lastAppointment: appt.StartTime,
              latestStatus: appt.Status,
            });
          } else {
            existing.appointmentCount += 1;
            if (new Date(appt.StartTime) > new Date(existing.lastAppointment)) {
              existing.lastAppointment = appt.StartTime;
              existing.latestStatus = appt.Status;
            }
          }
        }
        setPatients(Array.from(map.values()));
      }
      setLoading(false);
    });
  }, []);

  const filtered = patients.filter((p) =>
    p.username.toLowerCase().includes(search.toLowerCase()) ||
    p.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-5">
      <div className="bg-white rounded-2xl border border-[#e7e5e4] px-4 py-3 flex flex-col md:flex-row gap-3 md:items-center">
        <div className="flex-1">
          <p className="text-xs font-medium text-ink2 mb-1">Patient Overview</p>
          <input
            placeholder="Search patients…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-9 rounded-xl border border-[#e7e5e4] bg-bg2 px-3 text-sm text-ink placeholder:text-ink3 outline-none focus:border-accent transition-colors"
          />
        </div>
        {!loading && (
          <p className="text-xs text-ink3 shrink-0">{patients.length} patient{patients.length !== 1 ? "s" : ""}</p>
        )}
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl border border-[#e7e5e4] p-8 flex justify-center gap-1">
          {[0, 1, 2].map((i) => (
            <span key={i} className="w-2 h-2 rounded-full bg-ink3 animate-bounce" style={{ animationDelay: `${i * 150}ms` }} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#e7e5e4] p-8 text-center">
          <svg className="w-10 h-10 text-ink3 mx-auto mb-3" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <p className="text-sm font-medium text-ink2">
            {search ? "No patients match your search." : "No patients yet"}
          </p>
          {!search && (
            <p className="text-xs text-ink3 mt-1">Patients will appear here once they book appointments with you.</p>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((p) => (
            <div key={p.id} className="bg-white rounded-2xl border border-[#e7e5e4] p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-accent/10 text-accent text-sm font-bold flex items-center justify-center shrink-0">
                {initials(p.username)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-semibold text-ink">{p.username}</p>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusColor(p.latestStatus)}`}>
                    {p.latestStatus}
                  </span>
                </div>
                <p className="text-xs text-ink3 mt-0.5">{p.email}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-xs font-medium text-ink2">{p.appointmentCount} appt{p.appointmentCount !== 1 ? "s" : ""}</p>
                <p className="text-[10px] text-ink3 mt-0.5">
                  Last: {new Date(p.lastAppointment).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
