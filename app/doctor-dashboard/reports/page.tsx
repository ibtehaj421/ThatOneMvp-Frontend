"use client";

import { useState } from "react";

const reports = [
  {
    id: 1,
    patient: "Ayesha Noor",
    type: "CBC",
    label: "Complete Blood Count",
    date: "Apr 22, 2025",
    status: "Abnormal",
    statusColor: "bg-red-50 text-red-700",
    summary: "WBC elevated at 11.2 K/µL. Hemoglobin slightly low at 11.8 g/dL.",
    urgent: true,
  },
  {
    id: 2,
    patient: "Hassan Khan",
    type: "ECG",
    label: "Electrocardiogram",
    date: "Apr 21, 2025",
    status: "Review",
    statusColor: "bg-amber-50 text-amber-700",
    summary: "Mild ST changes in leads V3–V5. Correlation with symptoms recommended.",
    urgent: true,
  },
  {
    id: 3,
    patient: "Sara Ali",
    type: "CMP",
    label: "Comprehensive Metabolic Panel",
    date: "Apr 20, 2025",
    status: "Normal",
    statusColor: "bg-green-50 text-green-700",
    summary: "All values within reference range. BUN: 14, Creatinine: 0.9, Glucose: 92.",
    urgent: false,
  },
  {
    id: 4,
    patient: "Bilal Ahmed",
    type: "Rx",
    label: "Prescription Refill Request",
    date: "Apr 19, 2025",
    status: "Pending",
    statusColor: "bg-blue-50 text-blue-700",
    summary: "Metformin 500 mg twice daily — 90-day refill requested.",
    urgent: false,
  },
];

export default function DoctorReportsPage() {
  const [selected, setSelected] = useState<number | null>(null);

  return (
    <div className="relative">
      {/* Gray-out overlay */}
      <div className="absolute inset-0 z-20 bg-white/70 backdrop-blur-[2px] flex flex-col items-center justify-center gap-3 rounded-2xl" style={{ minHeight: 480 }}>
        <div className="bg-white border border-[#e7e5e4] rounded-2xl shadow-sm px-6 py-5 flex flex-col items-center gap-2 max-w-xs text-center">
          <div className="w-10 h-10 rounded-xl bg-[#f5f5f4] flex items-center justify-center">
            <svg className="w-5 h-5 text-ink3" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
          </div>
          <p className="text-sm font-semibold text-ink">Not yet operational</p>
          <p className="text-xs text-ink3 leading-relaxed">Lab reports and document management are under development. Clinical notes for completed appointments are available in the Appointments page.</p>
        </div>
      </div>

      {/* Underlying UI (non-interactive) */}
      <div className="pointer-events-none select-none opacity-40 p-4 sm:p-6 max-w-6xl mx-auto space-y-5">
        <div>
          <p className="text-sm font-semibold text-ink2">Documents & Reports</p>
          <p className="text-xs text-ink3 mt-1">Lab results, imaging, and patient-submitted documents.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Report list */}
          <div className="lg:col-span-2 space-y-3">
            {reports.map((r) => (
              <div
                key={r.id}
                onClick={() => setSelected(r.id === selected ? null : r.id)}
                className="bg-white rounded-2xl border border-[#e7e5e4] p-4 flex flex-col sm:flex-row sm:items-center gap-4 cursor-pointer hover:border-accent/40 transition-colors"
              >
                <div className="w-11 h-11 rounded-xl bg-accent/10 text-accent font-bold text-sm flex items-center justify-center shrink-0">
                  {r.type}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold text-ink">{r.patient}</p>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${r.statusColor}`}>
                      {r.status}
                    </span>
                    {r.urgent && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-700">Urgent</span>
                    )}
                  </div>
                  <p className="text-xs text-ink3 mt-0.5">{r.label} · {r.date}</p>
                  {selected === r.id && (
                    <p className="text-xs text-ink mt-2 leading-relaxed">{r.summary}</p>
                  )}
                </div>
                <button className="h-8 px-3 rounded-xl border border-[#e7e5e4] text-xs font-medium text-ink2 hover:border-accent hover:text-accent transition-colors shrink-0">
                  {selected === r.id ? "Close" : "View"}
                </button>
              </div>
            ))}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-[#e7e5e4] p-5">
              <p className="text-sm font-semibold text-ink2 mb-3">Urgent Cases</p>
              <div className="space-y-2">
                {reports.filter((r) => r.urgent).map((r) => (
                  <div key={r.id} className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-red-400 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-ink truncate">{r.patient}</p>
                      <p className="text-[10px] text-ink3">{r.label}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-[#e7e5e4] p-5">
              <p className="text-sm font-semibold text-ink2 mb-3">Actions</p>
              <div className="space-y-2">
                <button className="w-full h-9 rounded-xl bg-accent text-white text-xs font-medium hover:bg-accent-hover transition-colors">
                  Approve refills
                </button>
                <button className="w-full h-9 rounded-xl border border-[#e7e5e4] text-xs font-medium text-ink2 hover:border-accent hover:text-accent transition-colors">
                  Request lab resubmission
                </button>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-[#e7e5e4] p-5">
              <p className="text-sm font-semibold text-ink2 mb-3">Summary</p>
              <div className="space-y-2 text-sm text-ink2">
                <div className="flex items-center justify-between">
                  <span>Total reports</span>
                  <strong>{reports.length}</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span>Urgent</span>
                  <strong className="text-red-600">{reports.filter(r => r.urgent).length}</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span>Pending review</span>
                  <strong className="text-amber-600">{reports.filter(r => r.status === "Pending" || r.status === "Review").length}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
