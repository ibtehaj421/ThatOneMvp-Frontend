"use client";

import { useState } from "react";
import { Input } from "../../_components/ui/Input";
import { Button } from "../../_components/ui/Button";
import { useLocale } from "../../_components/providers/LocaleProvider";

const patients = [
  {
    name: "Sara Ali",
    age: 41,
    condition: "Hypertension",
    risk: "Low",
    next: "Follow-up in 2 weeks",
  },
  {
    name: "Hassan Khan",
    age: 58,
    condition: "Chest pain",
    risk: "High",
    next: "ECG review pending",
  },
  {
    name: "Ayesha Noor",
    age: 32,
    condition: "Post-op wound",
    risk: "Medium",
    next: "Photo upload due",
  },
  {
    name: "Bilal Ahmed",
    age: 27,
    condition: "Medication review",
    risk: "Low",
    next: "Prescription adjustment",
  },
];

export default function DoctorPatientsPage() {
  const { t } = useLocale();
  const [search, setSearch] = useState("");

  const filtered = patients.filter((patient) =>
    patient.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-5">
      <div className="bg-white rounded-2xl border border-[#e7e5e4] p-4 flex flex-col md:flex-row gap-3 md:items-end">
        <div className="flex-1">
          <Input
            label={t.doctor.patient_overview}
            placeholder="Search patients"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button variant="secondary" className="md:w-40">
          New record
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-3">
          {filtered.map((patient) => (
            <div
              key={patient.name}
              className="bg-white rounded-2xl border border-[#e7e5e4] p-4 flex flex-col sm:flex-row sm:items-center gap-4"
            >
              <div className="w-11 h-11 rounded-full bg-accent/10 text-accent font-semibold flex items-center justify-center shrink-0">
                {patient.name
                  .split(" ")
                  .map((part) => part[0])
                  .slice(0, 2)
                  .join("")}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-semibold text-ink">
                    {patient.name}
                  </p>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-bg2 text-ink2">
                    {patient.age} yrs
                  </span>
                  <span
                    className={[
                      "text-[10px] font-semibold px-2 py-0.5 rounded-full",
                      patient.risk === "High"
                        ? "bg-red-50 text-red-700"
                        : patient.risk === "Medium"
                          ? "bg-amber-50 text-amber-700"
                          : "bg-green-50 text-green-700",
                    ].join(" ")}
                  >
                    {patient.risk} risk
                  </span>
                </div>
                <p className="text-xs text-ink3 mt-0.5">{patient.condition}</p>
                <p className="text-xs text-ink3 mt-0.5">{patient.next}</p>
              </div>
              <Button size="sm">Open chart</Button>
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-[#e7e5e4] p-5">
            <p className="text-sm font-semibold text-ink2 mb-3">Risk flags</p>
            <div className="space-y-2">
              <div className="rounded-xl bg-red-50 border border-red-100 px-3 py-2 text-sm text-red-700">
                Hassan Khan: chest discomfort escalation
              </div>
              <div className="rounded-xl bg-amber-50 border border-amber-100 px-3 py-2 text-sm text-amber-700">
                Ayesha Noor: wound photo not uploaded
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-[#e7e5e4] p-5">
            <p className="text-sm font-semibold text-ink2 mb-3">Care actions</p>
            <div className="space-y-2 text-sm text-ink2">
              <div>Issue prescription refills</div>
              <div>Update diagnosis notes</div>
              <div>Schedule telehealth consults</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
