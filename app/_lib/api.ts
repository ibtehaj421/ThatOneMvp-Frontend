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

// ── Organizations & Providers ────────────────────────────────────────────────

// No json tags on Go model → PascalCase field names in responses
export interface BackendOrganization {
  ID: number;
  Name: string;
  Latitude: number;
  Longitude: number;
  CustomerSupportEmail: string;
  OwnerEmail: string;
  CreatedAt: string;
}

// GetNearbyOrganizations — pass lat/lng/radius for distance filter, or omit for all.
export async function apiGetOrganizations(params?: {
  lat?: number; lng?: number; radius?: number;
}): Promise<{ ok: boolean; organizations?: BackendOrganization[]; error?: string }> {
  try {
    const qs = params?.lat != null && params?.lng != null && params?.radius != null
      ? `?lat=${params.lat}&lng=${params.lng}&radius=${params.radius}`
      : "";
    const res = await apiFetch(`/organizations${qs}`);
    if (!res.ok) return { ok: false, error: "Failed to fetch clinics." };
    const data = await res.json() as { organizations: BackendOrganization[] };
    return { ok: true, organizations: data.organizations ?? [] };
  } catch {
    return { ok: false, error: "Cannot reach server." };
  }
}

// RegisterOrganization body binds to models.Organization — Go JSON is case-insensitive
// so PascalCase keys are used for safety.
export async function apiRegisterOrganization(data: {
  Name: string;
  CustomerSupportEmail?: string;
  Latitude?: number;
  Longitude?: number;
}): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await apiFetch("/organizations", {
      method: "POST",
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const d = await res.json().catch(() => ({})) as { error?: string };
      return { ok: false, error: d.error ?? "Failed to register clinic." };
    }
    return { ok: true };
  } catch {
    return { ok: false, error: "Cannot reach server." };
  }
}

// Provider response uses explicit json tags in the handler struct (PascalCase)
export interface BackendProvider {
  ID: number;
  Username: string;
  Email: string;
}

export async function apiGetProviders(): Promise<{
  ok: boolean; providers?: BackendProvider[]; error?: string;
}> {
  try {
    const res = await apiFetch("/providers");
    if (!res.ok) return { ok: false, error: "Failed to fetch providers." };
    const data = await res.json() as { providers: BackendProvider[] };
    return { ok: true, providers: data.providers ?? [] };
  } catch {
    return { ok: false, error: "Cannot reach server." };
  }
}

// ── Bookings ─────────────────────────────────────────────────────────────────

// Go Appointment model (no json tags → PascalCase in responses)
export interface BackendAppointment {
  ID: number;
  PatientID: number;
  ProviderID: number;
  OrganizationID: number;
  StartTime: string;
  EndTime: string;
  Status: "pending" | "confirmed" | "cancelled" | "completed";
  Notes: string;
  CreatedAt: string;
  UpdatedAt: string;
  Organization?: { ID: number; Name: string };
  Patient?: { ID: number; Username: string; Email: string };
}

// CreateBooking — body uses snake_case json tags defined in the handler struct.
export async function apiCreateBooking(
  patientId: number,
  organizationId: number,
  providerId: number,
  startTime: string,
): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await apiFetch("/bookings", {
      method: "POST",
      body: JSON.stringify({
        patient_id: patientId,
        provider_id: providerId,
        organization_id: organizationId,
        start_time: startTime,
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

// GetAppointments — returns all appointments for the logged-in user (filtered by role server-side).
export async function apiGetAppointments(): Promise<{
  ok: boolean;
  appointments?: BackendAppointment[];
  error?: string;
}> {
  try {
    const res = await apiFetch("/appointments");
    if (!res.ok) return { ok: false, error: "Failed to load appointments." };
    const data = await res.json() as { appointments: BackendAppointment[] };
    return { ok: true, appointments: data.appointments ?? [] };
  } catch {
    return { ok: false, error: "Cannot reach server." };
  }
}

// ── AI Chat ──────────────────────────────────────────────────────────────────

export interface SessionSummary {
  session_seq: number;
  status: "in_progress" | "completed";
  created_at: string;
  updated_at: string;
}

interface LangChainMessage {
  type: "ai" | "human";
  data: { content: string; id?: string };
}

export async function apiGetSessionHistory(sessionSeq: number): Promise<{
  ok: boolean;
  history?: LangChainMessage[];
  error?: string;
}> {
  try {
    const res = await apiFetch(`/chat/sessions/${sessionSeq}/history`);
    if (!res.ok) return { ok: false, error: "Failed to load history." };
    const data = await res.json() as { session_seq: string; history: LangChainMessage[] };
    return { ok: true, history: data.history ?? [] };
  } catch {
    return { ok: false, error: "Cannot reach server." };
  }
}

export async function apiGetSessions(): Promise<{
  ok: boolean;
  sessions?: SessionSummary[];
  error?: string;
}> {
  try {
    const res = await apiFetch("/chat/sessions");
    if (!res.ok) return { ok: false, error: "Failed to load sessions." };
    const data = await res.json() as { sessions: SessionSummary[] };
    return { ok: true, sessions: data.sessions ?? [] };
  } catch {
    return { ok: false, error: "Cannot reach server." };
  }
}

// Calls Go backend POST /chat/start — requires JWT (handled by apiFetch).
// Returns the numeric session_seq assigned by the backend.
export async function apiStartSession(): Promise<{
  ok: boolean;
  session_seq?: number;
  error?: string;
}> {
  try {
    const res = await apiFetch("/chat/start", { method: "POST" });
    if (!res.ok) return { ok: false, error: "Could not start session." };
    const data = await res.json() as { session_seq: number };
    return { ok: true, session_seq: data.session_seq };
  } catch {
    return { ok: false, error: "Cannot reach server." };
  }
}

// Calls Go backend POST /chat/message — requires JWT.
// session_seq is the number returned by apiStartSession.
export async function apiSendMessage(
  sessionSeq: number,
  message: string
): Promise<{ ok: boolean; reply?: string; is_complete?: boolean; error?: string }> {
  try {
    const res = await apiFetch("/chat/message", {
      method: "POST",
      body: JSON.stringify({ session_seq: sessionSeq, message }),
    });
    if (!res.ok) return { ok: false, error: "Could not reach server." };
    const data = await res.json() as { reply: string; is_complete: boolean };
    return { ok: true, reply: data.reply, is_complete: data.is_complete };
  } catch {
    return { ok: false, error: "Cannot reach server." };
  }
}

// Calls Go backend GET /chat/export/:session_seq — returns plain-text clinical summary.
export async function apiExportSession(
  sessionSeq: number
): Promise<{ ok: boolean; text?: string; error?: string }> {
  try {
    const res = await apiFetch(`/chat/export/${sessionSeq}`);
    if (!res.ok) return { ok: false, error: "Could not export session." };
    const text = await res.text();
    return { ok: true, text };
  } catch {
    return { ok: false, error: "Cannot reach server." };
  }
}

// ── Provider-only routes ─────────────────────────────────────────────────────

// GET /my-organizations — returns clinics owned by the logged-in doctor.
export async function apiGetMyOrganizations(): Promise<{
  ok: boolean; organizations?: BackendOrganization[]; error?: string;
}> {
  try {
    const res = await apiFetch("/my-organizations");
    if (!res.ok) return { ok: false, error: "Failed to fetch your organizations." };
    const data = await res.json() as { organizations: BackendOrganization[] };
    return { ok: true, organizations: data.organizations ?? [] };
  } catch {
    return { ok: false, error: "Cannot reach server." };
  }
}

// GET /organizations/:org_id/appointments — master schedule for a specific clinic.
export async function apiGetOrgAppointments(orgId: number): Promise<{
  ok: boolean;
  organization_id?: string;
  appointments?: BackendAppointment[];
  error?: string;
}> {
  try {
    const res = await apiFetch(`/organizations/${orgId}/appointments`);
    if (!res.ok) return { ok: false, error: "Failed to fetch clinic appointments." };
    const data = await res.json() as { organization_id: string; appointments: BackendAppointment[] };
    return { ok: true, organization_id: data.organization_id, appointments: data.appointments ?? [] };
  } catch {
    return { ok: false, error: "Cannot reach server." };
  }
}

// Structured CMAS intake data returned by the AI session.
// Field names use snake_case because CMASState in Go has explicit json tags.
export interface SymptomSlot {
  value: string;
  onset?: string;
  duration?: string;
  severity?: string;
  location?: string;
  progression?: string;
  frequency?: string;
}

export interface AppointmentContext {
  appointment_details: {
    appointment_id: number;
    status: BackendAppointment["Status"];
    start_time: string;
    doctor_notes: string;
  };
  patient_demographics: {
    patient_id: number;
    username: string;
    email: string;
  };
  ai_intake_history: {
    chief_complaint: string;
    positive_symptoms: SymptomSlot[];
    negative_symptoms: SymptomSlot[];
    patient_medical_history: string[];
    family_medical_history: string[];
    medications: string[];
    habits: Record<string, unknown>;
    basic_information: Record<string, unknown>;
  };
}

// GET /appointments/:appointment_id/context — patient demographics + AI intake for the doctor.
export async function apiGetAppointmentContext(appointmentId: number): Promise<{
  ok: boolean; context?: AppointmentContext; error?: string;
}> {
  try {
    const res = await apiFetch(`/appointments/${appointmentId}/context`);
    if (!res.ok) return { ok: false, error: "Failed to fetch patient context." };
    const data = await res.json() as AppointmentContext;
    return { ok: true, context: data };
  } catch {
    return { ok: false, error: "Cannot reach server." };
  }
}

// PUT /appointments/:appointment_id/notes — save doctor's notes and optionally update status.
export async function apiUpdateAppointmentNotes(
  appointmentId: number,
  notes: string,
  status?: string,
): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await apiFetch(`/appointments/${appointmentId}/notes`, {
      method: "PUT",
      body: JSON.stringify({ notes, ...(status ? { status } : {}) }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({})) as { error?: string };
      return { ok: false, error: data.error ?? "Failed to update notes." };
    }
    return { ok: true };
  } catch {
    return { ok: false, error: "Cannot reach server." };
  }
}
