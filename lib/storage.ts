import { UserProfile, Medication, WellnessCheckIn } from "./types";
import { DEMO_PROFILE, INITIAL_MEDICATIONS, INITIAL_CHECKINS } from "../data/mockData";

const PROFILE_KEY = "carebuddy_profile_v1";
const MEDICATIONS_KEY = "carebuddy_medications_v1";
const CHECKINS_KEY = "carebuddy_checkins_v1";

const isBrowser = typeof window !== "undefined";

function getTodayString(): string {
  return new Date().toISOString().split("T")[0];
}

// ============ PROFILE STORAGE ============
export function getSavedProfile(): UserProfile {
  if (!isBrowser) return DEMO_PROFILE;
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (!raw) return DEMO_PROFILE;
    return JSON.parse(raw);
  } catch (err) {
    console.error("Error reading profile from localStorage:", err);
    return DEMO_PROFILE;
  }
}

export function saveProfile(profile: UserProfile): void {
  if (!isBrowser) return;
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  } catch (err) {
    console.error("Error saving profile to localStorage:", err);
  }
}

// ============ MEDICATIONS STORAGE ============
export function getSavedMedications(): Medication[] {
  if (!isBrowser) return INITIAL_MEDICATIONS;
  try {
    const raw = localStorage.getItem(MEDICATIONS_KEY);
    const today = getTodayString();
    let list: Medication[] = raw ? JSON.parse(raw) : INITIAL_MEDICATIONS;

    // Daily automatic reset check: if a medication was marked taken on a previous day,
    // refresh takenToday to false for the current day while remembering lastMarkedDate
    list = list.map((med) => {
      if (med.lastMarkedDate && med.lastMarkedDate !== today) {
        return { ...med, takenToday: false };
      }
      return med;
    });

    return list;
  } catch (err) {
    console.error("Error reading medications from localStorage:", err);
    return INITIAL_MEDICATIONS;
  }
}

export function saveMedications(medications: Medication[]): void {
  if (!isBrowser) return;
  try {
    localStorage.setItem(MEDICATIONS_KEY, JSON.stringify(medications));
  } catch (err) {
    console.error("Error saving medications to localStorage:", err);
  }
}

// ============ CHECK-INS STORAGE ============
export function getSavedCheckIns(): WellnessCheckIn[] {
  if (!isBrowser) return INITIAL_CHECKINS;
  try {
    const raw = localStorage.getItem(CHECKINS_KEY);
    if (!raw) return INITIAL_CHECKINS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_CHECKINS;
  } catch (err) {
    console.error("Error reading check-ins from localStorage:", err);
    return INITIAL_CHECKINS;
  }
}

export function saveCheckIns(checkIns: WellnessCheckIn[]): void {
  if (!isBrowser) return;
  try {
    localStorage.setItem(CHECKINS_KEY, JSON.stringify(checkIns));
  } catch (err) {
    console.error("Error saving check-ins to localStorage:", err);
  }
}

export function addCheckIn(entry: WellnessCheckIn): WellnessCheckIn[] {
  const current = getSavedCheckIns();
  const updated = [entry, ...current];
  saveCheckIns(updated);
  return updated;
}

export function deleteCheckIn(id: string): WellnessCheckIn[] {
  const current = getSavedCheckIns();
  const updated = current.filter((item) => item.id !== id);
  saveCheckIns(updated);
  return updated;
}

// ============ RESET DEMO DATA ============
export function resetAllToDemo(): void {
  if (!isBrowser) return;
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(DEMO_PROFILE));
    localStorage.setItem(MEDICATIONS_KEY, JSON.stringify(INITIAL_MEDICATIONS));
    localStorage.setItem(CHECKINS_KEY, JSON.stringify(INITIAL_CHECKINS));
  } catch (err) {
    console.error("Error resetting data:", err);
  }
}
