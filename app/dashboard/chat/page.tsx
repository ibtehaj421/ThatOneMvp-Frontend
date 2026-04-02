"use client";

import { useState, useRef, useEffect } from "react";
import { useLocale } from "../../_components/providers/LocaleProvider";
import { useAuth } from "../../_components/providers/AuthProvider";
import { apiStartSession, apiSendMessage } from "../../_lib/api";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  time: string;
}

interface Conversation {
  id: string;
  title: string;
  preview: string;
  timestamp: string;
  unread: number;
}

const FALLBACK_GREETING =
  "Hello! I'm your ANAM-AI health assistant. I can help you understand symptoms, explain medications, or answer general health questions. How can I help you today?\n\n⚠️ Remember: I provide general information only. Always consult a qualified healthcare provider for medical advice.";

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
  const [activeConv, setActiveConv] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Start a session on first load
  useEffect(() => {
    startNewSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, thinking]);

  const startNewSession = async () => {
    const convId = `conv-${Date.now()}`;
    setActiveConv(convId);
    setMessages([]);
    setSessionId(null);
    setThinking(true);

    const result = await apiStartSession();
    const greeting = result.ok && result.greeting ? result.greeting : FALLBACK_GREETING;
    const sid = result.ok && result.session_id ? result.session_id : null;
    setSessionId(sid);

    const greetMsg: Message = {
      id: `m${Date.now()}`,
      role: "assistant",
      content: greeting,
      time: formatTime(),
    };
    setMessages([greetMsg]);
    setThinking(false);

    const newConv: Conversation = {
      id: convId,
      title: "New Conversation",
      preview: greeting.slice(0, 50) + "…",
      timestamp: formatTime(),
      unread: 0,
    };
    setConversations((prev) => [newConv, ...prev]);
  };

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || thinking) return;

    const userMsg: Message = {
      id: `m${Date.now()}`,
      role: "user",
      content: text,
      time: formatTime(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setThinking(true);

    // Update conversation preview
    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeConv
          ? { ...c, title: text.slice(0, 40) || c.title, preview: text.slice(0, 50), timestamp: formatTime() }
          : c
      )
    );

    let reply = "";
    if (sessionId) {
      const result = await apiSendMessage(sessionId, text);
      reply = result.ok && result.reply
        ? result.reply
        : "I'm having trouble connecting right now. Please try again shortly.";
    } else {
      reply = "The AI service is currently unavailable. Please ensure the AI service is running and try again.";
    }

    const aiMsg: Message = {
      id: `m${Date.now() + 1}`,
      role: "assistant",
      content: reply,
      time: formatTime(),
    };
    setMessages((prev) => [...prev, aiMsg]);
    setThinking(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const initials = user?.name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase() ?? "?";

  return (
    <div className="flex h-full">
      {/* ── Conversation list ── */}
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
          <p className="px-3 py-1.5 text-[11px] font-semibold text-ink3 uppercase tracking-wider">{t.chat.today}</p>
          {conversations.length === 0 ? (
            <p className="px-3 py-4 text-xs text-ink3 text-center">No conversations yet</p>
          ) : (
            conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setActiveConv(conv.id)}
                className={[
                  "w-full text-left px-3 py-3 mx-1 rounded-xl transition-colors",
                  activeConv === conv.id ? "bg-orange-50" : "hover:bg-bg2",
                ].join(" ")}
                style={{ width: "calc(100% - 8px)" }}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className={`text-sm font-medium truncate ${activeConv === conv.id ? "text-accent" : "text-ink"}`}>
                    {conv.title}
                  </p>
                  <div className="flex items-center gap-1 shrink-0">
                    <span className="text-[10px] text-ink3">{conv.timestamp}</span>
                    {conv.unread > 0 && (
                      <span className="w-4 h-4 rounded-full bg-accent text-white text-[9px] flex items-center justify-center font-bold">
                        {conv.unread}
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-xs text-ink3 truncate mt-0.5">{conv.preview}</p>
              </button>
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

        {/* Input area */}
        <div className="p-3 border-t border-[#e7e5e4] bg-white">
          <div className="flex items-end gap-2 bg-bg2 rounded-2xl border border-[#e7e5e4] px-3 py-2">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t.chat.placeholder}
              rows={1}
              className="flex-1 resize-none bg-transparent text-sm text-ink placeholder:text-ink3 outline-none max-h-32 leading-relaxed"
              style={{ minHeight: "24px" }}
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || thinking}
              className="h-8 w-8 rounded-xl bg-accent text-white flex items-center justify-center hover:bg-accent-hover transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
            >
              <SendIcon />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
