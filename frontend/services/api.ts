const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

// ── Types ────────────────────────────────────────────────────────

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  salaryMin?: number;
  salaryMax?: number;
  experience?: string;
  employmentType?: string;
  skills: string[];
  source: string;
  jobUrl: string;
  postedAt?: string;
  firstSeenAt: string;
  lastVerifiedAt: string;
  status: string;
  // from relevance scoring
  relevanceScore?: number;
  matchedSkills?: string[];
  missingSkills?: string[];
  explanation?: string;
}

export interface JobSearchCriteria {
  roles: string[];
  locations: string[];
  skills: string[];
  experience?: { min?: number; max?: number };
  employmentType?: string;
  salaryMin?: number;
  companyPreference?: string;
  remotePreference?: boolean;
}

export interface ChatResponse {
  reply: string;
  jobs: Job[];
  criteria: JobSearchCriteria;
  queries: string[];
  stats: { totalFound: number; newJobs: number };
}

export interface AuthResponse {
  user: { id: string; name: string; email: string };
  token: string;
}

// ── Storage helpers ──────────────────────────────────────────────

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("jobpilot_token");
}

export function setToken(token: string): void {
  localStorage.setItem("jobpilot_token", token);
}

export function clearToken(): void {
  localStorage.removeItem("jobpilot_token");
}

// ── Fetch wrapper ────────────────────────────────────────────────

async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(error?.error ?? `Request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

// ── Auth ─────────────────────────────────────────────────────────

export async function register(
  name: string,
  email: string,
  password: string
): Promise<AuthResponse> {
  return apiFetch<AuthResponse>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ name, email, password }),
  });
}

export async function login(
  email: string,
  password: string
): Promise<AuthResponse> {
  return apiFetch<AuthResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

// ── Chat ─────────────────────────────────────────────────────────

export async function sendChatMessage(message: string): Promise<ChatResponse> {
  return apiFetch<ChatResponse>("/api/chat", {
    method: "POST",
    body: JSON.stringify({ message }),
  });
}

export async function getChatHistory(): Promise<{
  messages: Array<{ role: string; content: string }>;
}> {
  return apiFetch("/api/chat/history");
}

export async function resetChat(): Promise<void> {
  await apiFetch("/api/chat/reset", { method: "DELETE" });
}

// ── Jobs ─────────────────────────────────────────────────────────

export async function getJobs(
  page = 1,
  limit = 20
): Promise<{ jobs: Job[]; total: number }> {
  return apiFetch(`/api/jobs?page=${page}&limit=${limit}`);
}

export async function getJob(id: string): Promise<{ job: Job }> {
  return apiFetch(`/api/jobs/${id}`);
}

export async function getSavedJobs(): Promise<{ jobs: Job[] }> {
  return apiFetch("/api/jobs/saved");
}

export async function saveJob(jobId: string): Promise<void> {
  await apiFetch(`/api/jobs/${jobId}/save`, { method: "POST" });
}

export async function unsaveJob(jobId: string): Promise<void> {
  await apiFetch(`/api/jobs/${jobId}/save`, { method: "DELETE" });
}

// ── Search History ───────────────────────────────────────────────

export async function getSearchHistory(): Promise<{
  history: Array<{ id: string; searchQuery: string; createdAt: string }>;
}> {
  return apiFetch("/api/search/history");
}
