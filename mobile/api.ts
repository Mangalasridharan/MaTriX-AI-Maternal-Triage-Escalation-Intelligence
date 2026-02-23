import { Platform } from 'react-native';

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
  submitted_at: string;
}

// 10.0.2.2 is loopback for Android emulator. localhost for web/iOS.
const BASE_URL = Platform.OS === 'android' ? 'http://10.0.2.2:8000' : 'http://localhost:8000';

let token = ''; // Simple in-memory storage for demo purposes

export const setToken = (t: string) => { token = t; };

async function fetchApi(path: string, options: RequestInit = {}) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as any) || {}),
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    let errorMsg = 'API Error';
    try {
      const errData = await res.json();
      errorMsg = errData.detail || errorMsg;
    } catch (e) {}
    throw new Error(errorMsg);
  }

  return res.json();
}

export const apiClient = {
  login: async (username: string, password: string) => {
    const fd = new URLSearchParams();
    fd.append('username', username);
    fd.append('password', password);
    
    const res = await fetch(`${BASE_URL}/api/auth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: fd.toString()
    });
    if (!res.ok) throw new Error('Login failed');
    const data = await res.json();
    setToken(data.access_token);
    return data;
  },

  submitCase: async (payload: CaseSubmission): Promise<CaseResult> => {
    return fetchApi('/api/submit_case', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }
};
