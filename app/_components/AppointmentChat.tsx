"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  apiGetAppointmentMessages,
  apiSendAppointmentMessage,
  getAppointmentChatWsUrl,
  type BackendAppointmentMessage,
} from "../_lib/api";

interface AppointmentChatProps {
  appointmentId: number;
  currentUserId: number;
  currentUsername: string;
  className?: string;
}

function SendIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
    </svg>
  );
}

export function AppointmentChat({ appointmentId, currentUserId, currentUsername, className }: AppointmentChatProps) {
  const [messages, setMessages] = useState<BackendAppointmentMessage[]>([]);
  const [input, setInput] = useState("");
  const [connected, setConnected] = useState(false);
  const [sending, setSending] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Load existing messages via HTTP
  useEffect(() => {
    apiGetAppointmentMessages(appointmentId).then((r) => {
      if (r.ok && r.messages) setMessages(r.messages);
    });
  }, [appointmentId]);

  // Connect WebSocket
  useEffect(() => {
    const url = getAppointmentChatWsUrl(appointmentId, currentUserId);
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => setConnected(true);
    ws.onclose = () => setConnected(false);
    ws.onerror = () => setConnected(false);

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data) as BackendAppointmentMessage;
        setMessages((prev) => {
          // Deduplicate by ID
          if (prev.some((m) => m.ID === msg.ID)) return prev;
          return [...prev, msg];
        });
      } catch {
        // ignore malformed frames
      }
    };

    return () => {
      ws.close();
    };
  }, [appointmentId, currentUserId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || sending) return;
    setSending(true);
    setInput("");

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ message: text }));
    } else {
      // HTTP fallback if WS is not connected
      await apiSendAppointmentMessage(appointmentId, text);
      // Re-fetch to show the message
      const r = await apiGetAppointmentMessages(appointmentId);
      if (r.ok && r.messages) setMessages(r.messages);
    }

    setSending(false);
  }, [input, sending, appointmentId]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className={["flex flex-col bg-bg2 rounded-2xl border border-[#e7e5e4] overflow-hidden", className ?? "h-80"].join(" ")}>
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-white border-b border-[#e7e5e4] shrink-0">
        <p className="text-xs font-semibold text-ink2">Appointment Chat</p>
        <span className={[
          "text-[10px] font-medium px-2 py-0.5 rounded-full",
          connected ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700",
        ].join(" ")}>
          {connected ? "Live" : "Offline"}
        </span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2">
        {messages.length === 0 && (
          <p className="text-[11px] text-ink3 text-center py-4">No messages yet. Start the conversation.</p>
        )}
        {messages.map((msg) => {
          const isMe = msg.SenderID === currentUserId;
          const senderName = msg.Sender?.FullName || msg.Sender?.Username || (isMe ? currentUsername : `User #${msg.SenderID}`);
          const time = new Date(msg.CreatedAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

          return (
            <div key={msg.ID} className={`flex gap-2 ${isMe ? "flex-row-reverse" : ""}`}>
              <div className="w-6 h-6 rounded-full bg-accent/20 text-accent flex items-center justify-center shrink-0 text-[10px] font-bold">
                {senderName.slice(0, 1).toUpperCase()}
              </div>
              <div className={`max-w-[75%] flex flex-col gap-0.5 ${isMe ? "items-end" : "items-start"}`}>
                <span className="text-[10px] text-ink3 px-1">{senderName} · {time}</span>
                <div className={[
                  "rounded-xl px-3 py-2 text-xs leading-relaxed",
                  isMe ? "bg-accent text-white rounded-tr-sm" : "bg-white border border-[#e7e5e4] text-ink rounded-tl-sm",
                ].join(" ")}>
                  {msg.Message}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex items-center gap-2 px-3 py-2 bg-white border-t border-[#e7e5e4] shrink-0">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message…"
          rows={1}
          className="flex-1 resize-none bg-bg2 rounded-xl border border-[#e7e5e4] px-3 py-1.5 text-xs text-ink placeholder:text-ink3 outline-none focus:border-accent max-h-20"
          style={{ minHeight: "30px" }}
        />
        <button
          onClick={sendMessage}
          disabled={!input.trim() || sending}
          className="w-8 h-8 rounded-xl bg-accent text-white flex items-center justify-center hover:bg-accent-hover transition-colors disabled:opacity-40 shrink-0"
        >
          <SendIcon />
        </button>
      </div>
    </div>
  );
}
