"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getLocalBookings, type LocalBooking } from "../../../_lib/api";

type FilterStatus = "all" | "pending" | "confirmed" | "cancelled";

function statusColor(status: LocalBooking["status"]) {
  if (status === "confirmed") return "bg-green-50 text-green-700 border border-green-100";
  if (status === "pending") return "bg-amber-50 text-amber-700 border border-amber-100";
  return "bg-red-50 text-red-700 border border-red-100";
}

export default function PatientsPage() {
  const [bookings, setBookings] = useState<LocalBooking[]>([]);
  const [filter, setFilter] = useState<FilterStatus>("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    setBookings(getLocalBookings());
  }, []);

  const filtered = bookings.filter((b) => {
    const matchStatus = filter === "all" || b.status === filter;
    const start = new Date(b.startTime);
    const dateStr = start.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    const matchSearch =
      search === "" ||
      dateStr.toLowerCase().includes(search.toLowerCase()) ||
      b.status.includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const updateStatus = (id: string, status: LocalBooking["status"]) => {
    const all = getLocalBookings().map((b) =>
      b.id === id ? { ...b, status } : b
    );
    localStorage.setItem("anam-bookings", JSON.stringify(all));
    setBookings(all);
  };

  const counts = {
    all: bookings.length,
    pending: bookings.filter((b) => b.status === "pending").length,
    confirmed: bookings.filter((b) => b.status === "confirmed").length,
    cancelled: bookings.filter((b) => b.status === "cancelled").length,
  };

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard/provider"
          className="text-ink3 hover:text-ink transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div>
          <h2 className="text-xl font-bold text-ink">Patient Appointments</h2>
          <p className="text-sm text-ink3">{counts.all} total · {counts.pending} pending</p>
        </div>
      </div>

      {/* Filters + search */}
      <div className="bg-white rounded-2xl border border-[#e7e5e4] p-4 flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="search"
            placeholder="Search by date or status…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-9 pl-9 pr-3 rounded-xl border border-[#e7e5e4] bg-bg2 text-sm text-ink placeholder:text-ink3 outline-none focus:border-accent transition-colors"
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {(["all", "pending", "confirmed", "cancelled"] as FilterStatus[]).map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={[
                "px-3 py-1.5 rounded-xl text-xs font-medium capitalize transition-colors",
                filter === s ? "bg-accent text-white" : "border border-[#e7e5e4] text-ink3 hover:bg-bg2 hover:text-ink2",
              ].join(" ")}
            >
              {s} ({counts[s]})
            </button>
          ))}
        </div>
      </div>

      {/* Bookings table */}
      <div className="bg-white rounded-2xl border border-[#e7e5e4] overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center">
            <svg className="w-12 h-12 text-ink3/30 mx-auto mb-3" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-sm text-ink3">No appointments found</p>
          </div>
        ) : (
          <div className="divide-y divide-[#f5f5f4]">
            {/* Table header */}
            <div className="grid grid-cols-12 px-4 py-2.5 bg-bg2">
              <div className="col-span-1 text-[11px] font-semibold text-ink3 uppercase tracking-wider">#</div>
              <div className="col-span-3 text-[11px] font-semibold text-ink3 uppercase tracking-wider">Date</div>
              <div className="col-span-2 text-[11px] font-semibold text-ink3 uppercase tracking-wider">Time</div>
              <div className="col-span-2 text-[11px] font-semibold text-ink3 uppercase tracking-wider">Duration</div>
              <div className="col-span-2 text-[11px] font-semibold text-ink3 uppercase tracking-wider">Status</div>
              <div className="col-span-2 text-[11px] font-semibold text-ink3 uppercase tracking-wider text-right">Actions</div>
            </div>
            {filtered.map((appt, idx) => {
              const start = new Date(appt.startTime);
              const end = new Date(appt.endTime);
              const dateStr = start.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
              const timeStr = start.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
              const durationMin = Math.round((end.getTime() - start.getTime()) / 60000);
              return (
                <div key={appt.id} className="grid grid-cols-12 px-4 py-3.5 items-center hover:bg-bg2/50 transition-colors">
                  <div className="col-span-1 text-sm text-ink3">{idx + 1}</div>
                  <div className="col-span-3">
                    <p className="text-sm font-medium text-ink">{dateStr}</p>
                  </div>
                  <div className="col-span-2 text-sm text-ink2">{timeStr}</div>
                  <div className="col-span-2 text-sm text-ink2">{durationMin} min</div>
                  <div className="col-span-2">
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full capitalize ${statusColor(appt.status)}`}>
                      {appt.status}
                    </span>
                  </div>
                  <div className="col-span-2 flex gap-1.5 justify-end">
                    {appt.status === "pending" && (
                      <>
                        <button
                          onClick={() => updateStatus(appt.id, "confirmed")}
                          className="h-7 px-2 rounded-lg bg-green-50 text-green-700 text-xs font-medium hover:bg-green-100 transition-colors"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => updateStatus(appt.id, "cancelled")}
                          className="h-7 px-2 rounded-lg bg-red-50 text-red-600 text-xs font-medium hover:bg-red-100 transition-colors"
                        >
                          Cancel
                        </button>
                      </>
                    )}
                    {appt.status === "confirmed" && (
                      <button
                        onClick={() => updateStatus(appt.id, "cancelled")}
                        className="h-7 px-2 rounded-lg bg-red-50 text-red-600 text-xs font-medium hover:bg-red-100 transition-colors"
                      >
                        Cancel
                      </button>
                    )}
                    {appt.status === "cancelled" && (
                      <button
                        onClick={() => updateStatus(appt.id, "pending")}
                        className="h-7 px-2 rounded-lg border border-[#e7e5e4] text-ink3 text-xs font-medium hover:bg-bg2 transition-colors"
                      >
                        Restore
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Provider tools: Documents + Chat access */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          href="/dashboard/documents"
          className="bg-white rounded-2xl border border-[#e7e5e4] p-5 hover:shadow-md transition-shadow flex items-center gap-4"
        >
          <div className="w-11 h-11 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 text-accent-warm" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-ink">Patient Documents</p>
            <p className="text-xs text-ink3 mt-0.5">View and manage uploaded patient files</p>
          </div>
        </Link>
        <Link
          href="/dashboard/chat"
          className="bg-white rounded-2xl border border-[#e7e5e4] p-5 hover:shadow-md transition-shadow flex items-center gap-4"
        >
          <div className="w-11 h-11 rounded-xl bg-orange-50 flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-ink">AI Health Assistant</p>
            <p className="text-xs text-ink3 mt-0.5">Chat with ANAM AI for clinical support</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
