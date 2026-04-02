"use client";

import { useState, useEffect } from "react";
import { useLocale } from "../../_components/providers/LocaleProvider";
import { useAuth } from "../../_components/providers/AuthProvider";
import { Button } from "../../_components/ui/Button";
import {
  apiCreateBooking,
  apiGetAppointments,
  apiGetProfile,
  type BackendAppointment,
} from "../../_lib/api";

const AVAILABLE_SLOTS = ["9:00 AM", "9:30 AM", "10:00 AM", "11:30 AM", "2:00 PM", "3:00 PM", "4:30 PM"];
const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

// Hardcoded for MVP — no provider/org selection UI yet
const MVP_ORGANIZATION_ID = 1;
const MVP_PROVIDER_ID = 1;

function statusColor(s: BackendAppointment["Status"]) {
  if (s === "confirmed")  return "bg-green-50 text-green-700 border border-green-100";
  if (s === "pending")    return "bg-amber-50 text-amber-700 border border-amber-100";
  if (s === "completed")  return "bg-blue-50 text-blue-700 border border-blue-100";
  return "bg-red-50 text-red-700 border border-red-100"; // cancelled
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
          const isToday =
            day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
          const isSelected = day === selected;
          const isPast = new Date(year, month, day) < new Date(today.getFullYear(), today.getMonth(), today.getDate());
          return (
            <button
              key={i}
              onClick={() => !isPast && onSelect(day)}
              disabled={isPast}
              className={[
                "h-9 w-full rounded-lg text-sm font-medium transition-colors",
                isPast ? "text-ink3/40 cursor-not-allowed" :
                isSelected ? "bg-accent text-white" :
                isToday ? "border-2 border-accent text-accent" :
                "text-ink2 hover:bg-orange-50 hover:text-accent",
              ].join(" ")}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function BookingPage() {
  const { t } = useLocale();
  const { user } = useAuth();
  const today = new Date();

  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [bookedMsg, setBookedMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming");
  const [appointments, setAppointments] = useState<BackendAppointment[]>([]);
  const [loadingAppts, setLoadingAppts] = useState(true);
  const [booking, setBooking] = useState(false);
  const [patientId, setPatientId] = useState<number | null>(null);

  // Fetch the backend numeric user ID (needed for CreateBooking patient_id)
  useEffect(() => {
    apiGetProfile().then((r) => {
      if (r.ok && r.profile) setPatientId(r.profile.ID);
    });
  }, []);

  const fetchAppointments = async () => {
    setLoadingAppts(true);
    const result = await apiGetAppointments();
    if (result.ok && result.appointments) setAppointments(result.appointments);
    setLoadingAppts(false);
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
    setSelectedDay(null); setSelectedSlot(null);
  };
  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
    setSelectedDay(null); setSelectedSlot(null);
  };

  const handleBook = async () => {
    if (!selectedDay || !selectedSlot || patientId == null) return;
    setErrorMsg("");

    const [timePart, meridiem] = selectedSlot.split(" ");
    const [rawHour, rawMin] = timePart.split(":").map(Number);
    let hour = rawHour;
    if (meridiem === "PM" && hour !== 12) hour += 12;
    if (meridiem === "AM" && hour === 12) hour = 0;
    const start = new Date(year, month, selectedDay, hour, rawMin ?? 0);

    setBooking(true);
    const result = await apiCreateBooking(
      patientId,
      MVP_ORGANIZATION_ID,
      MVP_PROVIDER_ID,
      start.toISOString(),
    );
    setBooking(false);

    if (!result.ok) {
      setErrorMsg(result.error ?? "Booking failed. Please try again.");
      return;
    }

    setBookedMsg(`Appointment request sent for ${MONTHS[month]} ${selectedDay} at ${selectedSlot}. You will receive a confirmation shortly.`);
    setSelectedDay(null);
    setSelectedSlot(null);
    fetchAppointments(); // refresh list from backend
  };

  const upcoming = appointments.filter(
    (a) => a.Status !== "cancelled" && new Date(a.StartTime) >= today
  );
  const past = appointments.filter(
    (a) => a.Status === "cancelled" || new Date(a.StartTime) < today
  );
  const displayList = activeTab === "upcoming" ? upcoming : past;

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto">
      {bookedMsg && (
        <div className="mb-4 rounded-xl bg-green-50 border border-green-100 px-4 py-3 flex items-start gap-3">
          <svg className="w-5 h-5 text-green-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm text-green-800">{bookedMsg}</p>
          <button onClick={() => setBookedMsg("")} className="ml-auto text-green-600 hover:text-green-800">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
      {errorMsg && (
        <div className="mb-4 rounded-xl bg-red-50 border border-red-100 px-4 py-3">
          <p className="text-sm text-red-700">{errorMsg}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* ── Calendar ── */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="bg-white rounded-2xl border border-[#e7e5e4] p-5">
            <div className="flex items-center justify-between mb-4">
              <button onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-bg2 text-ink3 hover:text-ink transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <span className="text-sm font-semibold text-ink">{MONTHS[month]} {year}</span>
              <button onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-bg2 text-ink3 hover:text-ink transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
            <Calendar year={year} month={month} selected={selectedDay} onSelect={setSelectedDay} />
          </div>

          {/* Slot picker */}
          <div className="bg-white rounded-2xl border border-[#e7e5e4] p-5">
            <p className="text-sm font-semibold text-ink2 mb-3">
              {selectedDay
                ? `${t.booking.available_slots} — ${MONTHS[month]} ${selectedDay}`
                : t.booking.select_date}
            </p>
            {selectedDay ? (
              <div className="grid grid-cols-3 gap-2">
                {AVAILABLE_SLOTS.map((slot) => {
                  const chosen = selectedSlot === slot;
                  return (
                    <button
                      key={slot}
                      onClick={() => setSelectedSlot(slot)}
                      className={[
                        "h-9 rounded-xl text-xs font-medium transition-colors",
                        chosen
                          ? "bg-accent text-white"
                          : "border border-[#e7e5e4] text-ink2 hover:border-accent hover:text-accent",
                      ].join(" ")}
                    >
                      {slot}
                    </button>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-ink3 text-center py-4">← Select a date on the calendar</p>
            )}

            {selectedDay && selectedSlot && (
              <div className="mt-4 pt-4 border-t border-[#f5f5f4]">
                <p className="text-xs text-ink3 mb-3">
                  <strong className="text-ink2">{MONTHS[month]} {selectedDay}</strong> at{" "}
                  <strong className="text-ink2">{selectedSlot}</strong>
                </p>
                <Button onClick={handleBook} fullWidth disabled={booking || patientId == null}>
                  {booking ? "Booking…" : t.booking.confirm_booking}
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* ── Appointments list ── */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          <div className="flex rounded-xl bg-bg2 p-1 gap-1">
            {(["upcoming", "past"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={[
                  "flex-1 h-8 rounded-lg text-sm font-medium transition-colors",
                  activeTab === tab ? "bg-white text-ink shadow-sm" : "text-ink3 hover:text-ink2",
                ].join(" ")}
              >
                {t.booking[tab]}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {loadingAppts ? (
              <div className="bg-white rounded-2xl border border-[#e7e5e4] p-8 flex justify-center gap-1">
                {[0,1,2].map((i) => (
                  <span key={i} className="w-2 h-2 rounded-full bg-ink3 animate-bounce" style={{ animationDelay: `${i * 150}ms` }} />
                ))}
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
                    <div className="w-11 h-11 rounded-full bg-accent/10 text-accent font-semibold text-sm flex items-center justify-center shrink-0">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-ink">Appointment</p>
                      <p className="text-xs text-ink3">{orgName}</p>
                      <div className="flex items-center gap-3 mt-1.5">
                        <span className="text-xs text-ink2 flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {dateStr}
                        </span>
                        <span className="text-xs text-ink2 flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {timeStr}
                        </span>
                      </div>
                      {appt.Notes && (
                        <p className="text-xs text-ink3 mt-1 truncate">{appt.Notes}</p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full capitalize ${statusColor(appt.Status)}`}>
                        {appt.Status}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
