"use client";

import { useState } from "react";
import { useLocale } from "../../_components/providers/LocaleProvider";
import { Button } from "../../_components/ui/Button";

interface Appointment {
  id: string;
  doctor: string;
  specialty: string;
  date: string;
  time: string;
  status: "confirmed" | "pending" | "cancelled";
  avatar: string;
}

const APPOINTMENTS: Appointment[] = [
  { id: "1", doctor: "Dr. Sarah Khan", specialty: "General Physician", date: "Apr 2, 2026", time: "10:00 AM", status: "confirmed", avatar: "SK" },
  { id: "2", doctor: "Dr. Ahmed Malik", specialty: "Cardiologist", date: "Apr 8, 2026", time: "2:30 PM", status: "pending", avatar: "AM" },
  { id: "3", doctor: "Dr. Fatima Noor", specialty: "Dermatologist", date: "Mar 15, 2026", time: "11:00 AM", status: "confirmed", avatar: "FN" },
];

const AVAILABLE_SLOTS = ["9:00 AM", "9:30 AM", "10:00 AM", "11:30 AM", "2:00 PM", "3:00 PM", "4:30 PM"];
const BOOKED_SLOTS = ["10:00 AM", "2:00 PM"];
const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

function statusColor(s: Appointment["status"]) {
  if (s === "confirmed") return "bg-green-50 text-green-700 border border-green-100";
  if (s === "pending") return "bg-amber-50 text-amber-700 border border-amber-100";
  return "bg-red-50 text-red-700 border border-red-100";
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
  // Pad to full grid
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
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [bookedMsg, setBookedMsg] = useState("");
  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming");

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
    setSelectedDay(null);
    setSelectedSlot(null);
  };
  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
    setSelectedDay(null);
    setSelectedSlot(null);
  };

  const handleBook = () => {
    if (!selectedDay || !selectedSlot) return;
    setBookedMsg(`Appointment request sent for ${MONTHS[month]} ${selectedDay} at ${selectedSlot}. You will receive a confirmation shortly.`);
    setSelectedDay(null);
    setSelectedSlot(null);
  };

  const upcoming = APPOINTMENTS.filter((a) => a.status !== "cancelled" && new Date(a.date) >= today);
  const past = APPOINTMENTS.filter((a) => new Date(a.date) < today);
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

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* ── Calendar ── */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="bg-white rounded-2xl border border-[#e7e5e4] p-5">
            {/* Month nav */}
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
                  const booked = BOOKED_SLOTS.includes(slot);
                  const chosen = selectedSlot === slot;
                  return (
                    <button
                      key={slot}
                      onClick={() => !booked && setSelectedSlot(slot)}
                      disabled={booked}
                      className={[
                        "h-9 rounded-xl text-xs font-medium transition-colors",
                        booked ? "bg-bg2 text-ink3 cursor-not-allowed line-through" :
                        chosen ? "bg-accent text-white" :
                        "border border-[#e7e5e4] text-ink2 hover:border-accent hover:text-accent",
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
                  <strong className="text-ink2">{MONTHS[month]} {selectedDay}</strong> at <strong className="text-ink2">{selectedSlot}</strong>
                </p>
                <Button onClick={handleBook} fullWidth>
                  {t.booking.confirm_booking}
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* ── Appointments list ── */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          {/* Tabs */}
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

          {/* Appointment cards */}
          <div className="space-y-3">
            {displayList.length === 0 ? (
              <div className="bg-white rounded-2xl border border-[#e7e5e4] p-8 text-center">
                <p className="text-sm text-ink3">No {activeTab} appointments</p>
              </div>
            ) : (
              displayList.map((appt) => (
                <div key={appt.id} className="bg-white rounded-2xl border border-[#e7e5e4] p-4 flex items-center gap-4">
                  <div className="w-11 h-11 rounded-full bg-accent/10 text-accent font-semibold text-sm flex items-center justify-center shrink-0">
                    {appt.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-ink">{appt.doctor}</p>
                    <p className="text-xs text-ink3">{appt.specialty}</p>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="text-xs text-ink2 flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {appt.date}
                      </span>
                      <span className="text-xs text-ink2 flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {appt.time}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full capitalize ${statusColor(appt.status)}`}>
                      {t.booking[appt.status]}
                    </span>
                    {activeTab === "upcoming" && (
                      <button className="text-[11px] text-red-500 hover:text-red-700 font-medium transition-colors">
                        {t.booking.cancel_appt}
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
