import { MoodType } from "./types";

/**
 * Transparent CareBuddy Wellness Scoring Algorithm:
 * Total: 100 points
 * 1. Mood Component (Max 25 pts)
 *    - Great: 25 | Good: 20 | Okay: 15 | Low: 8 | Rough: 4
 * 2. Energy Component (Max 25 pts)
 *    - Scale 1-10: (energy * 2.5) pts
 * 3. Sleep Component (Max 25 pts)
 *    - 7 to 9 hours (optimal): 25 pts
 *    - 6 or 10 hours: 20 pts
 *    - 5 or 11 hours: 14 pts
 *    - Less than 5 or more than 11: 8 pts
 * 4. Physical Comfort Component (Max 25 pts)
 *    - Discomfort level 0-10: ((10 - discomfort) * 2.5) pts
 */
export function calculateWellnessScore(
  mood: MoodType,
  energy: number,
  sleepHours: number,
  discomfortLevel: number
): {
  total: number;
  breakdown: {
    moodPts: number;
    energyPts: number;
    sleepPts: number;
    comfortPts: number;
  };
  summary: string;
} {
  // 1. Mood points
  const moodMap: Record<MoodType, number> = {
    great: 25,
    good: 20,
    okay: 15,
    low: 8,
    rough: 4,
  };
  const moodPts = moodMap[mood] ?? 15;

  // 2. Energy points (1-10 scaled to 25)
  const clampedEnergy = Math.max(1, Math.min(10, energy));
  const energyPts = Math.round(clampedEnergy * 2.5);

  // 3. Sleep points
  let sleepPts = 8;
  if (sleepHours >= 7 && sleepHours <= 9) {
    sleepPts = 25;
  } else if (sleepHours === 6 || sleepHours === 10) {
    sleepPts = 20;
  } else if (sleepHours === 5 || sleepHours === 11) {
    sleepPts = 14;
  } else {
    sleepPts = 8;
  }

  // 4. Discomfort points (0 is best, 10 is worst)
  const clampedDiscomfort = Math.max(0, Math.min(10, discomfortLevel));
  const comfortPts = Math.round((10 - clampedDiscomfort) * 2.5);

  const total = Math.max(0, Math.min(100, moodPts + energyPts + sleepPts + comfortPts));

  let summary = "Balanced day";
  if (total >= 85) summary = "Optimal wellness";
  else if (total >= 70) summary = "Good overall condition";
  else if (total >= 50) summary = "Mild fatigue or discomfort noted";
  else summary = "High stress or discomfort - rest recommended";

  return {
    total,
    breakdown: { moodPts, energyPts, sleepPts, comfortPts },
    summary,
  };
}
