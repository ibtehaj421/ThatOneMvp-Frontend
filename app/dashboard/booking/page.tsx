"use client";

import { useState, useEffect } from "react";
import { useLocale } from "../../_components/providers/LocaleProvider";
import { Button } from "../../_components/ui/Button";
import {
  apiCreateBooking,
  apiGetAppointments,
  apiGetOrganizations,
  apiGetProviders,
  apiGetProfile,
  type BackendAppointment,
  type BackendOrganization,
  type BackendProvider,
} from "../../_lib/api";

const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

function statusColor(s: BackendAppointment["Status"]) {
  if (s === "confirmed")  return "bg-green-50 text-green-700 border border-green-100";
  if (s === "pending")    return "bg-amber-50 text-amber-700 border border-amber-100";
  if (s === "completed")  return "bg-blue-50 text-blue-700 border border-blue-100";
  return "bg-red-50 text-red-700 border border-red-100";
}

function MapPinIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function Calendar({
  year, month, selected, onSelect,
}: { year: number; month: number; selected: number | null; onSelect: (d: number) => void }) {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const today = new Date();
  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div>
      <div className="grid grid-cols-7 mb-1">
        {DAYS.map((d) => (
          <div key={d} className="text-center text-[11px] font-semibold text-ink3 py-1">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-0.5">
        {cells.map((day, i) => {
          if (!day) return <div key={i} />;
          const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
          const isSelected = day === selected;
          const isPast = new Date(year, month, day) < new Date(today.getFullYear(), today.getMonth(), today.getDate());
          return (
            <button key={i} onClick={() => !isPast && onSelect(day)} disabled={isPast}
              className={[
                "h-9 w-full rounded-lg text-sm font-medium transition-colors",
                isPast ? "text-ink3/40 cursor-not-allowed" :
                isSelected ? "bg-accent text-white" :
                isToday ? "border-2 border-accent text-accent" :
                "text-ink2 hover:bg-orange-50 hover:text-accent",
              ].join(" ")}
            >{day}</button>
          );
        })}
      </div>
    </div>
  );
}

export default function BookingPage() {
  const { t } = useLocale();
  const today = new Date();

  // Data
  const [orgs, setOrgs] = useState<BackendOrganization[]>([]);
  const [providers, setProviders] = useState<BackendProvider[]>([]);
  const [appointments, setAppointments] = useState<BackendAppointment[]>([]);
  const [patientId, setPatientId] = useState<number | null>(null);

  // Loading
  const [loadingOrgs, setLoadingOrgs] = useState(true);
  const [loadingAppts, setLoadingAppts] = useState(true);

  // Booking flow (step 1=clinic, 2=doctor, 3=datetime)
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedOrg, setSelectedOrg] = useState<BackendOrganization | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<BackendProvider | null>(null);
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  // UI
  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming");
  const [booking, setBooking] = useState(false);
  const [bookedMsg, setBookedMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    apiGetProfile().then((r) => { if (r.ok && r.profile) setPatientId(r.profile.ID); });

    setLoadingOrgs(true);
    Promise.all([apiGetOrganizations(), apiGetProviders()]).then(([orgsRes, provsRes]) => {
      if (orgsRes.ok) setOrgs(orgsRes.organizations ?? []);
      if (provsRes.ok) setProviders(provsRes.providers ?? []);
      setLoadingOrgs(false);
    });

    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    setLoadingAppts(true);
    const r = await apiGetAppointments();
    if (r.ok && r.appointments) setAppointments(r.appointments);
    setLoadingAppts(false);
  };

  // Providers that belong to the selected clinic (matched by OwnerEmail)
  const clinicProviders = selectedOrg
    ? providers.filter((p) => p.Email === selectedOrg.OwnerEmail)
    : [];

  const handleSelectOrg = (org: BackendOrganization) => {
    setSelectedOrg(org);
    setSelectedProvider(null);
    setStep(2);
  };

  const handleSelectProvider = (p: BackendProvider) => {
    setSelectedProvider(p);
    setStep(3);
  };

  const handleBook = async () => {
    if (!selectedDay || !selectedSlot || !selectedOrg || !selectedProvider || patientId == null) return;
    setErrorMsg("");

    const [rawHour, rawMin] = selectedSlot.split(":").map(Number);
    const start = new Date(year, month, selectedDay, rawHour, rawMin ?? 0);

    setBooking(true);
    const result = await apiCreateBooking(patientId, selectedOrg.ID, selectedProvider.ID, start.toISOString());
    setBooking(false);

    if (!result.ok) { setErrorMsg(result.error ?? "Booking failed."); return; }

    setBookedMsg(`Appointment booked at ${selectedOrg.Name} with ${selectedProvider.Username} on ${MONTHS[month]} ${selectedDay} at ${selectedSlot}.`);
    setStep(1);
    setSelectedOrg(null); setSelectedProvider(null);
    setSelectedDay(null); setSelectedSlot(null);
    fetchAppointments();
  };

  const upcoming = appointments.filter((a) => a.Status !== "cancelled" && new Date(a.StartTime) >= today);
  const past = appointments.filter((a) => a.Status === "cancelled" || new Date(a.StartTime) < today);
  const displayList = activeTab === "upcoming" ? upcoming : past;

  // Step label for header
  const stepLabels = ["Choose Clinic", "Choose Doctor", "Select Time"];

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-5">
      {bookedMsg && (
        <div className="rounded-xl bg-green-50 border border-green-100 px-4 py-3 flex items-start gap-3">
          <svg className="w-5 h-5 text-green-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm text-green-800 flex-1">{bookedMsg}</p>
          <button onClick={() => setBookedMsg("")} className="text-green-600 hover:text-green-800">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
      {errorMsg && (
        <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3">
          <p className="text-sm text-red-700">{errorMsg}</p>
        </div>
      )}

      {/* ── Step indicator ── */}
      <div className="bg-white rounded-2xl border border-[#e7e5e4] p-4">
        <div className="flex items-center gap-2">
          {stepLabels.map((label, i) => {
            const n = (i + 1) as 1 | 2 | 3;
            const active = step === n;
            const done = step > n;
            return (
              <div key={n} className="flex items-center gap-2 flex-1">
                <div className={[
                  "w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0",
                  done ? "bg-green-500 text-white" : active ? "bg-accent text-white" : "bg-bg2 text-ink3",
                ].join(" ")}>
                  {done ? "✓" : n}
                </div>
                <span className={`text-xs font-medium ${active ? "text-ink" : "text-ink3"}`}>{label}</span>
                {i < 2 && <div className="flex-1 h-px bg-[#e7e5e4] mx-1" />}
              </div>
            );
          })}
        </div>
        {selectedOrg && (
          <div className="mt-3 pt-3 border-t border-[#f5f5f4] flex flex-wrap gap-3 text-xs text-ink3">
            <span><span className="font-medium text-ink2">Clinic:</span> {selectedOrg.Name}</span>
            {selectedProvider && <span><span className="font-medium text-ink2">Doctor:</span> {selectedProvider.Username}</span>}
          </div>
        )}
      </div>

      {/* ── Step 1: Choose Clinic ── */}
      {step === 1 && (
        <div>
          <p className="text-xs text-ink3 mb-3">Select a clinic to book your appointment at.</p>
          {loadingOrgs ? (
            <div className="bg-white rounded-2xl border border-[#e7e5e4] p-8 flex justify-center gap-1">
              {[0,1,2].map((i) => <span key={i} className="w-2 h-2 rounded-full bg-ink3 animate-bounce" style={{ animationDelay: `${i*150}ms` }} />)}
            </div>
          ) : orgs.length === 0 ? (
            <div className="bg-white rounded-2xl border border-[#e7e5e4] p-8 text-center">
              <p className="text-sm text-ink3">No clinics available yet. Check back later.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {orgs.map((org) => (
                <button
                  key={org.ID}
                  onClick={() => handleSelectOrg(org)}
                  className="bg-white rounded-2xl border border-[#e7e5e4] p-4 text-left hover:border-accent hover:shadow-sm transition-all group"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center shrink-0">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-ink group-hover:text-accent transition-colors">{org.Name}</p>
                      {org.CustomerSupportEmail && (
                        <p className="text-xs text-ink3 mt-0.5">{org.CustomerSupportEmail}</p>
                      )}
                      {org.Latitude !== 0 && org.Longitude !== 0 ? (
                        <span className="inline-flex items-center gap-1 text-xs text-ink3 mt-1">
                          <MapPinIcon />
                          {org.Latitude.toFixed(4)}, {org.Longitude.toFixed(4)}
                          <a
                            href={`https://maps.google.com/?q=${org.Latitude},${org.Longitude}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-accent underline ml-1"
                          >
                            View map
                          </a>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs text-ink3 mt-1">
                          <MapPinIcon /> Location not set
                        </span>
                      )}
                    </div>
                    <svg className="w-4 h-4 text-ink3 group-hover:text-accent shrink-0 mt-1 transition-colors" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Step 2: Choose Doctor ── */}
      {step === 2 && (
        <div>
          <button onClick={() => setStep(1)} className="flex items-center gap-1 text-xs text-ink3 hover:text-ink mb-3 transition-colors">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back to clinics
          </button>
          <p className="text-xs text-ink3 mb-3">
            {clinicProviders.length > 0
              ? `Select a doctor at ${selectedOrg?.Name}.`
              : `No doctors are currently registered at ${selectedOrg?.Name}.`}
          </p>
          {clinicProviders.length === 0 ? (
            <div className="bg-white rounded-2xl border border-[#e7e5e4] p-8 text-center">
              <p className="text-sm text-ink3">No doctors found for this clinic.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {clinicProviders.map((p) => (
                <button
                  key={p.ID}
                  onClick={() => handleSelectProvider(p)}
                  className="bg-white rounded-2xl border border-[#e7e5e4] p-4 text-left hover:border-accent hover:shadow-sm transition-all group flex items-center gap-3"
                >
                  <div className="w-10 h-10 rounded-full bg-accent/10 text-accent flex items-center justify-center shrink-0 text-sm font-bold">
                    {p.Username.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-ink group-hover:text-accent transition-colors">{p.Username}</p>
                    <p className="text-xs text-ink3 truncate">{p.Email}</p>
                  </div>
                  <svg className="w-4 h-4 text-ink3 group-hover:text-accent shrink-0 transition-colors" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Step 3: Select Date & Time ── */}
      {step === 3 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="flex flex-col gap-4">
            <button onClick={() => setStep(2)} className="flex items-center gap-1 text-xs text-ink3 hover:text-ink transition-colors self-start">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              Back to doctors
            </button>

            {/* Calendar */}
            <div className="bg-white rounded-2xl border border-[#e7e5e4] p-5">
              <div className="flex items-center justify-between mb-4">
                <button onClick={() => { if (month === 0) { setMonth(11); setYear(y => y-1); } else setMonth(m => m-1); setSelectedDay(null); setSelectedSlot(null); }}
                  className="p-1.5 rounded-lg hover:bg-bg2 text-ink3 hover:text-ink transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
                </button>
                <span className="text-sm font-semibold text-ink">{MONTHS[month]} {year}</span>
                <button onClick={() => { if (month === 11) { setMonth(0); setYear(y => y+1); } else setMonth(m => m+1); setSelectedDay(null); setSelectedSlot(null); }}
                  className="p-1.5 rounded-lg hover:bg-bg2 text-ink3 hover:text-ink transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                </button>
              </div>
              <Calendar year={year} month={month} selected={selectedDay} onSelect={setSelectedDay} />
            </div>

            {/* Time input */}
            <div className="bg-white rounded-2xl border border-[#e7e5e4] p-5">
              <p className="text-sm font-semibold text-ink2 mb-3">
                {selectedDay ? `Select Time — ${MONTHS[month]} ${selectedDay}` : "Select a date first"}
              </p>
              {selectedDay ? (
                <input
                  type="time"
                  value={selectedSlot ?? ""}
                  onChange={(e) => setSelectedSlot(e.target.value || null)}
                  className="w-full h-10 rounded-xl border border-[#e7e5e4] px-3 text-sm text-ink focus:outline-none focus:border-accent"
                />
              ) : (
                <p className="text-xs text-ink3 text-center py-4">← Select a date on the calendar</p>
              )}

              {selectedDay && selectedSlot && (
                <div className="mt-4 pt-4 border-t border-[#f5f5f4]">
                  <p className="text-xs text-ink3 mb-3">
                    <strong className="text-ink2">{selectedOrg?.Name}</strong> · <strong className="text-ink2">{selectedProvider?.Username}</strong>
                    <br />{MONTHS[month]} {selectedDay} at <strong className="text-ink2">{selectedSlot}</strong>
                  </p>
                  <Button onClick={handleBook} fullWidth disabled={booking || patientId == null}>
                    {booking ? "Booking…" : t.booking.confirm_booking}
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Appointments list alongside calendar */}
          <AppointmentsList
            loadingAppts={loadingAppts}
            displayList={displayList}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            t={t}
          />
        </div>
      )}

      {/* ── Appointments list (always shown on steps 1 & 2) ── */}
      {step !== 3 && (
        <AppointmentsList
          loadingAppts={loadingAppts}
          displayList={displayList}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          t={t}
        />
      )}
    </div>
  );
}

function AppointmentsList({
  loadingAppts, displayList, activeTab, setActiveTab, t,
}: {
  loadingAppts: boolean;
  displayList: BackendAppointment[];
  activeTab: "upcoming" | "past";
  setActiveTab: (v: "upcoming" | "past") => void;
  t: ReturnType<typeof useLocale>["t"];
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex rounded-xl bg-bg2 p-1 gap-1">
        {(["upcoming", "past"] as const).map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={["flex-1 h-8 rounded-lg text-sm font-medium transition-colors",
              activeTab === tab ? "bg-white text-ink shadow-sm" : "text-ink3 hover:text-ink2",
            ].join(" ")}
          >{t.booking[tab]}</button>
        ))}
      </div>

      <div className="space-y-3">
        {loadingAppts ? (
          <div className="bg-white rounded-2xl border border-[#e7e5e4] p-8 flex justify-center gap-1">
            {[0,1,2].map((i) => <span key={i} className="w-2 h-2 rounded-full bg-ink3 animate-bounce" style={{ animationDelay: `${i*150}ms` }} />)}
          </div>
        ) : displayList.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#e7e5e4] p-8 text-center">
            <p className="text-sm text-ink3">No {activeTab} appointments</p>
          </div>
        ) : (
          displayList.map((appt) => {
            const start = new Date(appt.StartTime);
            const dateStr = start.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
            const timeStr = start.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
            const orgName = appt.Organization?.Name ?? `Organization #${appt.OrganizationID}`;
            return (
              <div key={appt.ID} className="bg-white rounded-2xl border border-[#e7e5e4] p-4 flex items-center gap-4">
                <div className="w-11 h-11 rounded-full bg-accent/10 text-accent flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-ink">{orgName}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-ink3">{dateStr}</span>
                    <span className="text-xs text-ink3">{timeStr}</span>
                  </div>
                  {appt.Notes && <p className="text-xs text-ink3 mt-0.5 truncate">{appt.Notes}</p>}
                </div>
                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full capitalize ${statusColor(appt.Status)}`}>
                  {appt.Status}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
