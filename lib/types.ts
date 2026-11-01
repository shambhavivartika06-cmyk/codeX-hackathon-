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

// ============ TRIAGE TYPES ============

/** A sample doctor entry from data/doctors.json */
export interface Doctor {
  name: string;
  specialty: string;
  clinic: string;
  area: string;
  phone: string;      // always "Sample - not real"
  distance: string;   // e.g. "1.2 km"
}

/** Patient context sent from the browser to the triage API */
export interface TriageRecord {
  allergies: string[];       // e.g. ["penicillin", "pollen"]
  medications: string[];     // e.g. ["Metformin 500mg", "Aspirin"]
  recentVisits: string[];    // e.g. ["GP – Oct 2026"]
}

/** What the browser sends to POST /api/triage */
export interface TriageRequest {
  area: string;              // body zone label, e.g. "Chest"
  symptoms: string;          // free-text description
  pain: number;              // 1–10
  duration: string;          // e.g. "1-2 days"
  record: TriageRecord;      // pulled from localStorage
}

/** What the API returns (Gemini fills this as JSON) */
export interface TriageResult {
  emergency: boolean;
  emergencyReason?: string;           // only set when emergency = true
  possibleCauses: string[];           // layman-friendly list
  urgency: "home" | "soon" | "now";  // home-care / see soon / go now
  immediateSteps: string[];           // actionable self-care tips
  doctorType: string;                 // e.g. "General Practitioner"
  confidence: "low" | "medium" | "high";
  personalNote: string;               // references allergies / meds
  followUpQuestion: string;           // one question to ask the doctor
}

// ============ SNAP & STRUCTURE TYPES ============
export type ConfidenceLevel = "clear" | "ambiguous" | "missing";

export interface ExtractedMedicationItem {
  name: string;
  dosage: string;
  frequency: string;
  instructions: string;
  confidence: ConfidenceLevel;
  confidenceNote?: string;
}

export interface ExtractedLabTestItem {
  testName: string;
  value: string;
  unit: string;
  referenceRange: string;
  flag: "normal" | "abnormal" | "unclear";
  confidence: ConfidenceLevel;
  confidenceNote?: string;
}

export interface ExtractedDocumentData {
  documentType: "prescription" | "lab_report" | "other";
  facilityOrDoctor: string;
  documentDate: string;
  patientName: string;
  medications?: ExtractedMedicationItem[];
  labTests?: ExtractedLabTestItem[];
  warningsOrNotes: string[];
  rawTextSummary: string;
  hasAmbiguities: boolean;
}

export interface SavedExtractedRecord {
  id: string;
  createdAt: string;
  title: string;
  documentType: "prescription" | "lab_report" | "other";
  thumbnailUrl?: string;
  data: ExtractedDocumentData;
  addedToMedications?: boolean;
  attachedToSummary?: boolean;
}
