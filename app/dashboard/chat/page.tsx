"use client";

import { useState, useRef, useEffect } from "react";
import { useLocale } from "../../_components/providers/LocaleProvider";
import { useAuth } from "../../_components/providers/AuthProvider";
import { apiStartSession, apiSendMessage, apiExportSession, apiGetSessions, apiGetSessionHistory, SessionSummary } from "../../_lib/api";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  time: string;
}


const INITIAL_GREETING = "How are we feeling today?";

function formatTime() {
  return new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

function SendIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
    </svg>
  );
}
function PlusIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
    </svg>
  );
}

export default function ChatPage() {
  const { t } = useLocale();
  const { user } = useAuth();
  const [activeConv, setActiveConv] = useState<number | null>(null);
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [modal, setModal] = useState<{ open: boolean; loading: boolean; text: string; seq: number | null }>({
    open: false, loading: false, text: "", seq: null,
  });
  const [messages, setMessages] = useState<Message[]>([]);
  const [sessionSeq, setSessionSeq] = useState<number | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    fetchSessions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, thinking]);

  const fetchSessions = async () => {
    const result = await apiGetSessions();
    if (result.ok && result.sessions) setSessions(result.sessions);
  };

  const loadSession = async (s: SessionSummary) => {
    if (activeConv === s.session_seq) return; // already viewing it
    setThinking(true);
    setMessages([]);
    setActiveConv(s.session_seq);
    setSessionSeq(s.session_seq);
    setIsComplete(s.status === "completed");

    const result = await apiGetSessionHistory(s.session_seq);
    if (result.ok && result.history) {
      const mapped = result.history.map((m, i) => ({
        id: m.data.id ?? `h${i}`,
        role: m.type === "human" ? "user" as const : "assistant" as const,
        content: m.data.content,
        time: "",
      }));
      setMessages(mapped);
    }
    setThinking(false);
  };

  const startNewSession = async () => {
    setMessages([]);
    setSessionSeq(null);
    setIsComplete(false);
    setThinking(true);

    const result = await apiStartSession();
    const seq = result.ok && result.session_seq != null ? result.session_seq : null;
    setSessionSeq(seq);
    setActiveConv(seq);
    setThinking(false);

    // The frontend always initiates with this greeting — the model does not send one.
    setMessages([{
      id: `m${Date.now()}`,
      role: "assistant",
      content: INITIAL_GREETING,
      time: formatTime(),
    }]);

    // Refresh sidebar to show the new session
    fetchSessions();
  };

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || thinking || isComplete || isViewingPast) return;

    const userMsg: Message = {
      id: `m${Date.now()}`,
      role: "user",
      content: text,
      time: formatTime(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setThinking(true);

    let reply = "";
    let complete = false;

    if (sessionSeq != null) {
      const result = await apiSendMessage(sessionSeq, text);
      reply = result.ok && result.reply
        ? result.reply
        : "I'm having trouble connecting right now. Please try again shortly.";
      complete = result.ok ? (result.is_complete ?? false) : false;
    } else {
      reply = "Session could not be started. Please refresh and try again.";
    }

    const aiMsg: Message = {
      id: `m${Date.now() + 1}`,
      role: "assistant",
      content: reply,
      time: formatTime(),
    };
    setMessages((prev) => [...prev, aiMsg]);
    setThinking(false);

    if (complete) {
      setIsComplete(true);
      fetchSessions(); // refresh sidebar status to "completed"
    }
  };

  const openSummaryModal = async (seq: number) => {
    setModal({ open: true, loading: true, text: "", seq });
    const result = await apiExportSession(seq);
    setModal({ open: true, loading: false, text: result.text ?? "Failed to load summary.", seq });
  };

  const closeModal = () => setModal({ open: false, loading: false, text: "", seq: null });

  const downloadSummary = () => {
    if (!modal.text || modal.seq == null) return;
    const blob = new Blob([modal.text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `intake-history-session-${modal.seq}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // True when viewing a past session that is not the one currently being chatted
  const isViewingPast = activeConv !== sessionSeq;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const initials = user?.name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase() ?? "?";

  return (
    <div className="flex h-full">
      {/* ── Session list ── */}
      <aside className="hidden md:flex w-64 flex-col border-r border-[#e7e5e4] bg-white shrink-0">
        <div className="p-3 border-b border-[#e7e5e4]">
          <button
            onClick={startNewSession}
            disabled={thinking}
            className="w-full flex items-center justify-center gap-2 h-9 rounded-xl bg-accent text-white text-sm font-medium hover:bg-accent-hover transition-colors disabled:opacity-50"
          >
            <PlusIcon />
            {t.chat.new_chat}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-2">
          <p className="px-3 py-1.5 text-[11px] font-semibold text-ink3 uppercase tracking-wider">Sessions</p>
          {sessions.length === 0 ? (
            <p className="px-3 py-4 text-xs text-ink3 text-center">No sessions yet</p>
          ) : (
            sessions.map((s) => (
              <div
                key={s.session_seq}
                onClick={() => loadSession(s)}
                className={[
                  "mx-1 mb-1 rounded-xl px-3 py-2.5 transition-colors cursor-pointer",
                  activeConv === s.session_seq ? "bg-orange-50" : "hover:bg-bg2",
                ].join(" ")}
                style={{ width: "calc(100% - 8px)" }}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className={`text-sm font-medium truncate ${activeConv === s.session_seq ? "text-accent" : "text-ink"}`}>
                    Session #{s.session_seq}
                  </p>
                  <span className={[
                    "text-[10px] font-medium px-1.5 py-0.5 rounded-full shrink-0",
                    s.status === "completed"
                      ? "bg-green-100 text-green-700"
                      : "bg-amber-100 text-amber-700",
                  ].join(" ")}>
                    {s.status === "completed" ? "Done" : "Active"}
                  </span>
                </div>
                <p className="text-[10px] text-ink3 mt-0.5">
                  {new Date(s.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </p>
                {s.status === "completed" && (
                  <button
                    onClick={(e) => { e.stopPropagation(); openSummaryModal(s.session_seq); }}
                    className="mt-1.5 text-[11px] font-medium text-accent hover:underline"
                  >
                    View Summary →
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </aside>

      {/* ── Chat window ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Chat header */}
        <div className="h-14 px-4 border-b border-[#e7e5e4] bg-white flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-ink">{t.chat.ai_name}</p>
            <p className="text-xs text-green-500 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
              Online
            </p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {messages.length === 0 && !thinking && (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-8">
              <p className="text-sm font-medium text-ink">No session selected</p>
              <p className="text-xs text-ink3">Start a new conversation or select a past session from the sidebar.</p>
            </div>
          )}
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
            >
              {/* Avatar */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === "assistant" ? "bg-accent" : "bg-ink2"}`}>
                {msg.role === "assistant" ? (
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <span className="text-xs font-semibold text-white">{initials}</span>
                )}
              </div>

              {/* Bubble */}
              <div className={`max-w-[75%] ${msg.role === "user" ? "items-end" : "items-start"} flex flex-col gap-1`}>
                <div
                  className={[
                    "rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-line",
                    msg.role === "assistant"
                      ? "bg-white border border-[#e7e5e4] text-ink rounded-tl-sm"
                      : "bg-accent text-white rounded-tr-sm",
                  ].join(" ")}
                >
                  {msg.content}
                </div>
                <span className="text-[10px] text-ink3 px-1">{msg.time}</span>
              </div>
            </div>
          ))}

          {/* Thinking indicator */}
          {thinking && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center shrink-0">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="bg-white border border-[#e7e5e4] rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="w-2 h-2 rounded-full bg-ink3 animate-bounce"
                    style={{ animationDelay: `${i * 150}ms` }}
                  />
                ))}
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Disclaimer */}
        <div className="px-4 py-2 bg-amber-50 border-t border-amber-100">
          <p className="text-[11px] text-amber-700 text-center">{t.chat.disclaimer}</p>
        </div>

        {/* Session complete banner */}
        {isComplete && (
          <div className="px-4 py-2 bg-green-50 border-t border-green-100 flex items-center justify-between gap-3">
            <p className="text-[12px] text-green-700">History taking complete. Your intake summary is ready.</p>
            <button
              onClick={() => sessionSeq != null && openSummaryModal(sessionSeq)}
              className="text-[12px] font-medium text-green-800 underline underline-offset-2 hover:text-green-600 shrink-0"
            >
              View Summary
            </button>
          </div>
        )}

        {/* Input area */}
        <div className="p-3 border-t border-[#e7e5e4] bg-white">
          <div className="flex items-end gap-2 bg-bg2 rounded-2xl border border-[#e7e5e4] px-3 py-2">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isComplete || isViewingPast ? "Read-only — start a new conversation to chat." : t.chat.placeholder}
              rows={1}
              disabled={isComplete || isViewingPast}
              className="flex-1 resize-none bg-transparent text-sm text-ink placeholder:text-ink3 outline-none max-h-32 leading-relaxed disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ minHeight: "24px" }}
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || thinking || isComplete || isViewingPast}
              className="h-8 w-8 rounded-xl bg-accent text-white flex items-center justify-center hover:bg-accent-hover transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
            >
              <SendIcon />
            </button>
          </div>
        </div>
      </div>

      {/* ── Clinical Summary Modal ── */}
      {modal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[85vh] flex flex-col">
            {/* Modal header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#e7e5e4] shrink-0">
              <div>
                <p className="text-sm font-semibold text-ink">Clinical Intake Summary</p>
                {modal.seq != null && (
                  <p className="text-[11px] text-ink3">Session #{modal.seq}</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={downloadSummary}
                  disabled={modal.loading}
                  className="text-[12px] font-medium px-3 py-1.5 rounded-lg bg-accent text-white hover:bg-accent-hover transition-colors disabled:opacity-40"
                >
                  Download .txt
                </button>
                <button
                  onClick={closeModal}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-ink3 hover:bg-bg2 transition-colors text-lg leading-none"
                >
                  ×
                </button>
              </div>
            </div>

            {/* Modal body */}
            <div className="flex-1 overflow-y-auto px-5 py-4">
              {modal.loading ? (
                <div className="flex items-center justify-center h-32 gap-2">
                  {[0, 1, 2].map((i) => (
                    <span key={i} className="w-2 h-2 rounded-full bg-ink3 animate-bounce" style={{ animationDelay: `${i * 150}ms` }} />
                  ))}
                </div>
              ) : (
                <pre className="text-xs text-ink font-mono whitespace-pre-wrap leading-relaxed">{modal.text}</pre>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
