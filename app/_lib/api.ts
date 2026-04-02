// All requests go through Next.js's built-in proxy (see next.config.ts rewrites)
// so there are no CORS issues at all.
const API_BASE = "/api";
const TOKEN_KEY = "anam-token";

// ── Token helpers ────────────────────────────────────────────────────────────

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function storeToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

// ── Internal fetch wrapper ───────────────────────────────────────────────────

async function apiFetch(
  path: string,
  options: RequestInit = {}
): Promise<Response> {
  const headers: Record<string, string> = {};

  // Don't set Content-Type for FormData — the browser must set it with the
  // multipart boundary automatically.
  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  const token = getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;

  // Allow callers to override headers
  if (options.headers) {
    Object.assign(headers, options.headers as Record<string, string>);
  }

  return fetch(`${API_BASE}${path}`, { ...options, headers });
}

// ── Types ────────────────────────────────────────────────────────────────────

// The Go User model has no json tags so fields are serialised with their
// exact Go names (PascalCase).
export interface BackendProfile {
  ID: number;
  Username: string;
  Email: string;
  Role: string;
  CreatedAt: string;
}

// ── Auth ─────────────────────────────────────────────────────────────────────

export async function apiRegister(
  username: string,
  email: string,
  password: string,
  role?: string
): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await apiFetch("/register", {
      method: "POST",
      body: JSON.stringify({ username, email, password, role }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({})) as { error?: string };
      return { ok: false, error: data.error ?? "Registration failed." };
    }
    return { ok: true };
  } catch {
    return { ok: false, error: "Cannot reach server." };
  }
}

export async function apiLogin(
  email: string,
  password: string
): Promise<{ ok: boolean; token?: string; role?: string; error?: string }> {
  try {
    const res = await apiFetch("/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({})) as { error?: string };
      return {
        ok: false,
        error: data.error ?? "Invalid email or password.",
      };
    }
    const data = await res.json() as { token: string; role: string };
    storeToken(data.token);
    return { ok: true, token: data.token, role: data.role };
  } catch {
    return { ok: false, error: "Cannot reach server." };
  }
}

export async function apiLogout(): Promise<void> {
  try {
    await apiFetch("/logout", { method: "POST" });
  } catch {
    // ignore — we always clear the token regardless
  }
  clearToken();
}

export async function apiGetProfile(): Promise<{
  ok: boolean;
  profile?: BackendProfile;
  error?: string;
}> {
  try {
    const res = await apiFetch("/profile");
    if (!res.ok) return { ok: false, error: "Unauthorized." };
    const data = await res.json() as { profile: BackendProfile };
    return { ok: true, profile: data.profile };
  } catch {
    return { ok: false, error: "Cannot reach server." };
  }
}

// ── Documents ────────────────────────────────────────────────────────────────

export async function apiUploadDocument(
  file: File
): Promise<{ ok: boolean; error?: string }> {
  const form = new FormData();
  form.append("document", file);
  try {
    const res = await apiFetch("/documents/upload", {
      method: "POST",
      body: form,
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({})) as { error?: string };
      return { ok: false, error: data.error ?? "Upload failed." };
    }
    return { ok: true };
  } catch {
    return { ok: false, error: "Cannot reach server." };
  }
}

// Returns the list of filenames stored for the current user.
export async function apiListDocuments(): Promise<{
  ok: boolean;
  files?: string[];
  error?: string;
}> {
  try {
    const res = await apiFetch("/documents");
    if (!res.ok) return { ok: false, error: "Failed to load documents." };
    const data = await res.json() as { documents: string[] | null };
    return { ok: true, files: data.documents ?? [] };
  } catch {
    return { ok: false, error: "Cannot reach server." };
  }
}

// ── Local booking store (no GET /bookings endpoint in backend) ───────────────

const BOOKINGS_KEY = "anam-bookings";

export interface LocalBooking {
  id: string;
  organizationId: number;
  startTime: string;
  endTime: string;
  notes: string;
  status: "pending" | "confirmed" | "cancelled";
  createdAt: string;
}

export function getLocalBookings(): LocalBooking[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(BOOKINGS_KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function saveLocalBooking(
  booking: Omit<LocalBooking, "id" | "createdAt">
): LocalBooking {
  const newBooking: LocalBooking = {
    ...booking,
    id: `b${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  const all = getLocalBookings();
  all.unshift(newBooking);
  localStorage.setItem(BOOKINGS_KEY, JSON.stringify(all));
  return newBooking;
}

export function cancelLocalBooking(id: string): void {
  const all = getLocalBookings().map((b) =>
    b.id === id ? { ...b, status: "cancelled" as const } : b
  );
  localStorage.setItem(BOOKINGS_KEY, JSON.stringify(all));
}

// ── Bookings ─────────────────────────────────────────────────────────────────

// The Go Appointment struct has no json tags so the body keys must be PascalCase.
export async function apiCreateBooking(
  organizationId: number,
  startTime: string,
  endTime: string,
  notes?: string
): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await apiFetch("/bookings", {
      method: "POST",
      body: JSON.stringify({
        OrganizationID: organizationId,
        StartTime: startTime,
        EndTime: endTime,
        Notes: notes ?? "",
      }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({})) as { error?: string };
      return { ok: false, error: data.error ?? "Booking failed." };
    }
    return { ok: true };
  } catch {
    return { ok: false, error: "Cannot reach server." };
  }
}

// ── AI Service ───────────────────────────────────────────────────────────────

export async function apiStartSession(): Promise<{
  ok: boolean;
  session_id?: string;
  greeting?: string;
  error?: string;
}> {
  try {
    const res = await fetch("/api/ai/session/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) return { ok: false, error: "Could not start AI session." };
    const data = await res.json() as { session_id: string; greeting: string };
    return { ok: true, session_id: data.session_id, greeting: data.greeting };
  } catch {
    return { ok: false, error: "AI service unavailable." };
  }
}

export async function apiSendMessage(
  sessionId: string,
  message: string
): Promise<{ ok: boolean; reply?: string; cmas?: unknown; error?: string }> {
  try {
    const res = await fetch("/api/ai/session/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session_id: sessionId, message }),
    });
    if (!res.ok) return { ok: false, error: "Could not reach AI service." };
    const data = await res.json() as { reply: string; cmas?: unknown };
    return { ok: true, reply: data.reply, cmas: data.cmas };
  } catch {
    return { ok: false, error: "AI service unavailable." };
  }
}

export async function apiExportSession(
  sessionId: string
): Promise<{ ok: boolean; soap_note?: string; error?: string }> {
  try {
    const res = await fetch(
      `/api/ai/session/export?session_id=${encodeURIComponent(sessionId)}`
    );
    if (!res.ok) return { ok: false, error: "Could not export session." };
    const data = await res.json() as { soap_note: string };
    return { ok: true, soap_note: data.soap_note };
  } catch {
    return { ok: false, error: "AI service unavailable." };
  }
}
