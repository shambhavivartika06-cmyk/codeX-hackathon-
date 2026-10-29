export interface UserProfile {
  name: string;
  age: number | string;
  bloodGroup: string;
  allergies: string;
  conditions: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  isDemoData?: boolean;
}

export type MoodType = "great" | "good" | "okay" | "low" | "rough";

export interface WellnessCheckIn {
  id: string;
  timestamp: string; // ISO String
  dateFormatted: string; // e.g. "Oct 28, 2026"
  mood: MoodType;
  energy: number; // 1 to 10
  sleepHours: number; // e.g. 7.5
  discomfortLevel: number; // 0 to 10 (0 = none, 10 = severe)
  notes: string;
  wellnessScore: number; // 0 to 100 calculated transparently
}

export interface Medication {
  id: string;
  name: string;
  dosage: string; // e.g., "500 mg"
  schedule: string; // e.g., "Morning (8:00 AM)"
  notes?: string;
  takenToday: boolean;
  lastMarkedDate?: string; // YYYY-MM-DD
}

export interface ChatMessage {
  id: string;
  sender: "user" | "assistant";
  text: string;
  timestamp: string;
  isEmergencyWarning?: boolean;
  isFallback?: boolean;
}

export interface SymptomInfo {
  id: string;
  name: string;
  category: "General" | "Head & Neck" | "Digestive" | "Respiratory" | "Musculoskeletal";
  description: string;
  homeCare: string[];
  whenToSeeDoctor: string[];
  redFlags: string[]; // Urgent emergency flags
}
