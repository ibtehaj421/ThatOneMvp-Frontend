"use client";

import { Button } from "../../_components/ui/Button";
import { useLocale } from "../../_components/providers/LocaleProvider";

const reports = [
  {
    title: "CBC - Ayesha Noor",
    status: "Needs review",
    detail: "Mild inflammatory marker elevation",
  },
  {
    title: "ECG - Hassan Khan",
    status: "Urgent",
    detail: "No acute findings, needs clinical correlation",
  },
  {
    title: "CMP - Sara Ali",
    status: "Reviewed",
    detail: "Stable renal and liver function",
  },
  {
    title: "Prescription refill - Bilal Ahmed",
    status: "Pending",
    detail: "Metformin refill awaiting approval",
  },
];

export default function DoctorReportsPage() {
  const { t } = useLocale();

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-5">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-3">
          {reports.map((report) => (
            <div
              key={report.title}
              className="bg-white rounded-2xl border border-[#e7e5e4] p-4 flex flex-col sm:flex-row sm:items-center gap-4"
            >
              <div className="w-11 h-11 rounded-xl bg-amber-50 text-accent-warm flex items-center justify-center shrink-0">
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
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-semibold text-ink">
                    {report.title}
                  </p>
                  <span
                    className={[
                      "text-[10px] font-semibold px-2 py-0.5 rounded-full",
                      report.status === "Urgent"
                        ? "bg-red-50 text-red-700"
                        : report.status === "Reviewed"
                          ? "bg-green-50 text-green-700"
                          : report.status === "Pending"
                            ? "bg-bg2 text-ink2"
                            : "bg-amber-50 text-amber-700",
                    ].join(" ")}
                  >
                    {report.status}
                  </span>
                </div>
                <p className="text-xs text-ink3 mt-0.5">{report.detail}</p>
              </div>
              <Button size="sm" variant="secondary">
                Open
              </Button>
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-[#e7e5e4] p-5">
            <p className="text-sm font-semibold text-ink2 mb-3">
              {t.doctor.urgent_cases}
            </p>
            <div className="space-y-2 text-sm text-ink2">
              <div>Chest pain ECG from Hassan Khan</div>
              <div>Abnormal CBC for Ayesha Noor</div>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-[#e7e5e4] p-5">
            <p className="text-sm font-semibold text-ink2 mb-3">Actions</p>
            <div className="space-y-2">
              <Button fullWidth>Approve refills</Button>
              <Button fullWidth variant="secondary">
                Request lab resubmission
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
