"use client";

import { useState } from "react";
import { Button } from "../../_components/ui/Button";
import { useLocale } from "../../_components/providers/LocaleProvider";

const threads = [
  {
    name: "Sara Ali",
    preview: "My blood pressure is stable today.",
    time: "09:05",
    unread: 0,
  },
  {
    name: "Hassan Khan",
    preview: "Should I come in sooner?",
    time: "09:17",
    unread: 2,
  },
  {
    name: "Ayesha Noor",
    preview: "The wound photo is uploaded.",
    time: "09:41",
    unread: 0,
  },
];

const messages = [
  {
    side: "patient",
    text: "My blood pressure has been 128/82 this week.",
    time: "09:05",
  },
  {
    side: "doctor",
    text: "That looks much better. Keep the medication schedule unchanged and continue daily readings.",
    time: "09:06",
  },
  { side: "patient", text: "Should I book another follow-up?", time: "09:07" },
  {
    side: "doctor",
    text: "Yes, a follow-up in two weeks is enough unless symptoms change sooner.",
    time: "09:08",
  },
];

export default function DoctorMessagesPage() {
  const { t } = useLocale();
  const [activeThread, setActiveThread] = useState(0);
  const thread = threads[activeThread];

  return (
    <div className="flex h-full">
      <aside className="hidden md:flex w-72 flex-col border-r border-[#e7e5e4] bg-white shrink-0">
        <div className="p-3 border-b border-[#e7e5e4]">
          <div className="text-xs font-semibold uppercase tracking-wider text-ink3">
            Inbox
          </div>
        </div>
        <div className="flex-1 overflow-y-auto py-2">
          {threads.map((item, index) => (
            <button
              key={item.name}
              onClick={() => setActiveThread(index)}
              className={[
                "w-full text-left px-3 py-3 mx-1 rounded-xl transition-colors",
                activeThread === index ? "bg-orange-50" : "hover:bg-bg2",
              ].join(" ")}
              style={{ width: "calc(100% - 8px)" }}
            >
              <div className="flex items-start justify-between gap-2">
                <p
                  className={`text-sm font-medium truncate ${activeThread === index ? "text-accent" : "text-ink"}`}
                >
                  {item.name}
                </p>
                <span className="text-[10px] text-ink3 shrink-0">
                  {item.time}
                </span>
              </div>
              <p className="text-xs text-ink3 truncate mt-0.5">
                {item.preview}
              </p>
              {item.unread > 0 && (
                <span className="mt-2 inline-flex items-center justify-center min-w-5 h-5 rounded-full bg-accent text-white text-[10px] font-bold">
                  {item.unread}
                </span>
              )}
            </button>
          ))}
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <div className="h-14 px-4 border-b border-[#e7e5e4] bg-white flex items-center justify-between gap-3 shrink-0">
          <div>
            <p className="text-sm font-semibold text-ink">{thread.name}</p>
            <p className="text-xs text-green-500 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
              Patient active
            </p>
          </div>
          <Button size="sm" variant="secondary">
            Template reply
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-bg">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex gap-3 ${message.side === "doctor" ? "flex-row-reverse" : ""}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${message.side === "doctor" ? "bg-accent" : "bg-ink2"}`}
              >
                <span className="text-xs font-semibold text-white">
                  {message.side === "doctor" ? "D" : "P"}
                </span>
              </div>
              <div
                className={`max-w-[75%] ${message.side === "doctor" ? "items-end" : "items-start"} flex flex-col gap-1`}
              >
                <div
                  className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${message.side === "doctor" ? "bg-accent text-white rounded-tr-sm" : "bg-white border border-[#e7e5e4] text-ink rounded-tl-sm"}`}
                >
                  {message.text}
                </div>
                <span className="text-[10px] text-ink3 px-1">
                  {message.time}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="p-3 border-t border-[#e7e5e4] bg-white">
          <div className="flex items-end gap-2 bg-bg2 rounded-2xl border border-[#e7e5e4] px-3 py-2">
            <textarea
              rows={1}
              placeholder={t.doctor.add_note}
              className="flex-1 resize-none bg-transparent text-sm text-ink placeholder:text-ink3 outline-none max-h-32 leading-relaxed"
              style={{ minHeight: "24px" }}
            />
            <Button size="sm">Send</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
