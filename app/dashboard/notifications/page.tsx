"use client";

import { useState, useEffect } from "react";
import { apiGetNotifications, apiMarkNotificationsRead, type BackendNotification } from "../../_lib/api";

function BellOffIcon() {
  return (
    <svg className="w-10 h-10 text-ink3" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.172 9.172a4 4 0 015.656 0M9 10v.01M15 10v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<BackendNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);

  const fetchNotifications = async () => {
    const r = await apiGetNotifications();
    if (r.ok && r.notifications) setNotifications(r.notifications);
    setLoading(false);
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAllRead = async () => {
    setMarking(true);
    await apiMarkNotificationsRead();
    setMarking(false);
    setNotifications((prev) => prev.map((n) => ({ ...n, IsRead: true })));
    window.dispatchEvent(new CustomEvent("notifications-read"));
  };

  const unreadCount = notifications.filter((n) => !n.IsRead).length;

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-lg font-semibold text-ink">Notifications</h1>
          <p className="text-xs text-ink3 mt-0.5">
            {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}` : "All caught up"}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            disabled={marking}
            className="h-8 px-4 rounded-xl bg-accent text-white text-xs font-medium hover:bg-accent-hover transition-colors disabled:opacity-40"
          >
            {marking ? "Marking…" : "Mark all as read"}
          </button>
        )}
      </div>

      {/* List */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-[#e7e5e4] p-10 flex justify-center gap-1">
          {[0, 1, 2].map((i) => (
            <span key={i} className="w-2 h-2 rounded-full bg-ink3 animate-bounce" style={{ animationDelay: `${i * 150}ms` }} />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#e7e5e4] p-10 flex flex-col items-center gap-3">
          <BellOffIcon />
          <p className="text-sm text-ink3">No notifications yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <div
              key={n.ID}
              className={[
                "bg-white rounded-2xl border px-4 py-3.5 flex items-start gap-3 transition-colors",
                n.IsRead ? "border-[#e7e5e4]" : "border-accent/30 bg-orange-50/40",
              ].join(" ")}
            >
              {/* Dot indicator */}
              <div className="mt-1 shrink-0">
                <span className={[
                  "w-2 h-2 rounded-full block",
                  n.IsRead ? "bg-transparent" : "bg-accent",
                ].join(" ")} />
              </div>

              <div className="flex-1 min-w-0">
                <p className={`text-sm leading-relaxed ${n.IsRead ? "text-ink3" : "text-ink font-medium"}`}>
                  {n.Message}
                </p>
                <p className="text-[11px] text-ink3 mt-1">
                  {new Date(n.CreatedAt).toLocaleString("en-US", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </p>
              </div>

              {!n.IsRead && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-accent text-white shrink-0 mt-0.5">
                  New
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
