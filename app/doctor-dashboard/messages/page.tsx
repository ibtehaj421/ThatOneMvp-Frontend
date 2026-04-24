"use client";

import { useState } from "react";

const threads = [
  {
    id: 1,
    name: "Sara Ali",
    avatar: "SA",
    lastMessage: "Thank you doctor, I'll follow the prescription.",
    time: "10:32 AM",
    unread: 2,
    online: true,
  },
  {
    id: 2,
    name: "Hassan Khan",
    avatar: "HK",
    lastMessage: "Should I continue the same dosage?",
    time: "Yesterday",
    unread: 0,
    online: false,
  },
  {
    id: 3,
    name: "Ayesha Noor",
    avatar: "AN",
    lastMessage: "My follow-up appointment is confirmed.",
    time: "Mon",
    unread: 0,
    online: false,
  },
];

const initialMessages = [
  { id: 1, sender: "patient", text: "Hello Doctor, my blood pressure has been high lately.", time: "10:15 AM" },
  { id: 2, sender: "doctor", text: "How high are we talking? Have you been monitoring it at home?", time: "10:18 AM" },
  { id: 3, sender: "patient", text: "Around 145/95 in the mornings. I have been checking twice daily.", time: "10:22 AM" },
  { id: 4, sender: "doctor", text: "That's elevated. Let's adjust your medication and schedule a follow-up next week.", time: "10:28 AM" },
  { id: 5, sender: "patient", text: "Thank you doctor, I'll follow the prescription.", time: "10:32 AM" },
];

export default function DoctorMessagesPage() {
  const [selectedThread, setSelectedThread] = useState(threads[0]);
  const [input, setInput] = useState("");

  return (
    <div className="relative h-full">
      {/* Gray-out overlay */}
      <div className="absolute inset-0 z-20 bg-white/70 backdrop-blur-[2px] flex flex-col items-center justify-center gap-3 rounded-2xl">
        <div className="bg-white border border-[#e7e5e4] rounded-2xl shadow-sm px-6 py-5 flex flex-col items-center gap-2 max-w-xs text-center">
          <div className="w-10 h-10 rounded-xl bg-[#f5f5f4] flex items-center justify-center">
            <svg className="w-5 h-5 text-ink3" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
          </div>
          <p className="text-sm font-semibold text-ink">Not yet operational</p>
          <p className="text-xs text-ink3 leading-relaxed">Direct doctor–patient messaging is under development. Patient communications currently happen through AI intake sessions.</p>
        </div>
      </div>

      {/* Underlying UI (non-interactive) */}
      <div className="pointer-events-none select-none h-full flex overflow-hidden rounded-2xl border border-[#e7e5e4] bg-white opacity-40" style={{ minHeight: 480 }}>
        {/* Thread list */}
        <div className="w-64 shrink-0 border-r border-[#e7e5e4] flex flex-col">
          <div className="px-4 py-3 border-b border-[#e7e5e4]">
            <p className="text-sm font-semibold text-ink">Messages</p>
          </div>
          <div className="flex-1 overflow-y-auto">
            {threads.map((t) => (
              <button
                key={t.id}
                onClick={() => setSelectedThread(t)}
                className={[
                  "w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-bg2 transition-colors",
                  selectedThread.id === t.id ? "bg-bg2" : "",
                ].join(" ")}
              >
                <div className="relative shrink-0">
                  <div className="w-9 h-9 rounded-full bg-accent/10 text-accent text-xs font-bold flex items-center justify-center">
                    {t.avatar}
                  </div>
                  {t.online && (
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-green-400 border-2 border-white" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-ink truncate">{t.name}</p>
                    <p className="text-[10px] text-ink3 shrink-0 ml-1">{t.time}</p>
                  </div>
                  <p className="text-[11px] text-ink3 truncate mt-0.5">{t.lastMessage}</p>
                </div>
                {t.unread > 0 && (
                  <span className="shrink-0 w-4 h-4 rounded-full bg-accent text-white text-[9px] font-bold flex items-center justify-center">
                    {t.unread}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Chat area */}
        <div className="flex-1 flex flex-col">
          <div className="flex items-center gap-3 px-5 py-3 border-b border-[#e7e5e4] shrink-0">
            <div className="w-8 h-8 rounded-full bg-accent/10 text-accent text-xs font-bold flex items-center justify-center">
              {selectedThread.avatar}
            </div>
            <div>
              <p className="text-sm font-semibold text-ink">{selectedThread.name}</p>
              <p className="text-[10px] text-ink3">{selectedThread.online ? "Online" : "Offline"}</p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
            {initialMessages.map((m) => (
              <div key={m.id} className={`flex ${m.sender === "doctor" ? "justify-end" : "justify-start"}`}>
                <div className={[
                  "max-w-[70%] rounded-2xl px-4 py-2.5 text-sm",
                  m.sender === "doctor"
                    ? "bg-accent text-white rounded-br-sm"
                    : "bg-bg2 text-ink rounded-bl-sm",
                ].join(" ")}>
                  <p>{m.text}</p>
                  <p className={`text-[10px] mt-1 ${m.sender === "doctor" ? "text-white/70" : "text-ink3"}`}>{m.time}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="px-4 py-3 border-t border-[#e7e5e4] flex items-center gap-2 shrink-0">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message…"
              className="flex-1 h-10 rounded-xl border border-[#e7e5e4] bg-bg2 px-3 text-sm text-ink placeholder:text-ink3 outline-none"
            />
            <button className="h-10 px-4 rounded-xl bg-accent text-white text-sm font-medium">Send</button>
          </div>
        </div>
      </div>
    </div>
  );
}
