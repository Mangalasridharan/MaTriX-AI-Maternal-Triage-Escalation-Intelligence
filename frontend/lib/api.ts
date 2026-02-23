import axios, { AxiosInstance } from "axios";

/* ─── TypeScript Interfaces ───────────────────────────────────────── */
export interface Vitals {
  systolic: number;
  diastolic: number;
  heart_rate?: number;
  proteinuria?: string;
}

export interface CaseSubmission {
  name: string;
  age: number;
  gestational_age_weeks: number;
  notes?: string;
  vitals: Vitals;
  symptoms: string[];
}

export interface RiskResult {
  risk_level: "low" | "moderate" | "high" | "severe";
  risk_score: number;
  confidence: number;
  reasoning: string;
  immediate_actions: string[];
}

export interface GuidelineResult {
  stabilization_plan: string;
  monitoring_instructions: string;
  medication_guidance: string;
  guideline_sources?: string;
}

export interface ExecutivePlan {
  executive_summary: string;
  referral_priority: string;
  time_to_transfer_hours: number;
  care_plan: string;
  in_transit_care?: string;
  receiving_facility_requirements?: string;
  justification: string;
}

export interface CaseResult {
  visit_id: string;
  patient_name: string;
  risk_output: RiskResult;
  guideline_output: GuidelineResult;
  escalated: boolean;
  escalation_reason?: string;
  executive_output?: ExecutivePlan;
  cloud_connected: boolean;
  mode: string;
  submitted_at: string;
}

export interface HistoryItem {
  visit_id: string;
  patient_name: string;
  submitted_at: string;
  risk_level: string;
  risk_score: number;
  escalated: boolean;
}

export interface BpPoint {
  timestamp: string;
  systolic: number;
  diastolic: number;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

/* ─── Axios Instance ─────────────────────────────────────────────── */
const BASE = (typeof window !== "undefined" && localStorage.getItem("matrix_edge_url"))
  || process.env.NEXT_PUBLIC_API_URL
  || "http://localhost:8000";

const http: AxiosInstance = axios.create({ baseURL: BASE });

/* JWT interceptor — attach token on every request */
http.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("matrix_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/* Redirect on 401 */
http.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("matrix_token");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

/* ─── API Client ─────────────────────────────────────────────────── */
export const apiClient = {
  /** Auth */
  login: async (username: string, password: string): Promise<TokenResponse> => {
    const fd = new URLSearchParams({ username, password });
    const { data } = await http.post<TokenResponse>("/api/auth/token", fd,
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } });
    return data;
  },

  signup: async (username: string, password: string, clinic_name: string) => {
    const { data } = await http.post("/api/auth/signup", { username, password, clinic_name });
    return data;
  },

  /** Triage */
  submitCase: async (payload: CaseSubmission): Promise<CaseResult> => {
    const { data } = await http.post<CaseResult>("/api/submit_case", payload);
    return data;
  },

  getCase: async (visitId: string): Promise<CaseResult> => {
    const { data } = await http.get<CaseResult>(`/api/case/${visitId}`);
    return data;
  },

  /** History */
  getHistory: async (skip = 0, limit = 50): Promise<HistoryItem[]> => {
    const { data } = await http.get<HistoryItem[]>("/api/history", { params: { skip, limit } });
    return data;
  },

  /** BP trend */
  getBpHistory: async (patientId: string): Promise<BpPoint[]> => {
    const { data } = await http.get<BpPoint[]>(`/api/bp_history/${patientId}`);
    return data;
  },
  /** Vision */
  analyzeVision: async (imageData: string, prompt?: string) => {
    const { data } = await http.post("/api/triage/vision", { image_data: imageData, prompt });
    return data;
  },
};
