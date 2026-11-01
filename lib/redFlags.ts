/**
 * lib/redFlags.ts
 * Pure rule-based emergency detector — zero AI, zero network.
 * Called first in /api/triage so we never waste a Gemini call on a 911 case.
 */

interface RedFlagResult {
  emergency: boolean;
  reason?: string; // Human-readable reason shown to the user
}

/**
 * Checks whether the combination of area, symptom text and pain score
 * triggers any hard-coded emergency rule.
 *
 * All comparisons are done on lowercase strings to be case-insensitive.
 */
export function checkRedFlags(
  area: string,
  symptoms: string,
  pain: number
): RedFlagResult {
  const a = area.toLowerCase();
  const s = symptoms.toLowerCase();
  const combined = `${a} ${s}`; // search both fields at once

  // ── Rule 1: Cardiac / Chest emergency ─────────────────────────────────────
  // Chest pain PLUS any respiratory or classic cardiac companion symptom
  if (
    (a.includes("chest") || s.includes("chest pain") || s.includes("chest pressure")) &&
    (s.includes("breath") ||
      s.includes("breathing") ||
      s.includes("sweating") ||
      s.includes("left arm") ||
      s.includes("jaw"))
  ) {
    return {
      emergency: true,
      reason:
        "Chest pain combined with breathing difficulty, sweating, or left arm/jaw discomfort may indicate a cardiac emergency. Call 911 / 999 / 112 immediately.",
    };
  }

  // ── Rule 2: Stroke signs ──────────────────────────────────────────────────
  if (
    combined.includes("face drooping") ||
    combined.includes("facial droop") ||
    combined.includes("slurred speech") ||
    combined.includes("sudden weakness one side") ||
    combined.includes("arm weakness") ||
    combined.includes("sudden confusion") ||
    combined.includes("sudden vision loss")
  ) {
    return {
      emergency: true,
      reason:
        "Sudden facial drooping, slurred speech, or one-sided weakness are stroke warning signs. Call 911 / 999 / 112 immediately.",
    };
  }

  // ── Rule 3: Worst-ever / thunderclap headache ─────────────────────────────
  if (
    combined.includes("worst headache") ||
    combined.includes("thunderclap") ||
    combined.includes("sudden severe headache")
  ) {
    return {
      emergency: true,
      reason:
        "A sudden, severe 'worst headache of your life' can signal a brain bleed. Seek emergency care immediately.",
    };
  }

  // ── Rule 4: Inability to breathe ─────────────────────────────────────────
  if (
    combined.includes("cannot breathe") ||
    combined.includes("can't breathe") ||
    combined.includes("not breathing")
  ) {
    return {
      emergency: true,
      reason:
        "Inability to breathe is a life-threatening emergency. Call 911 / 999 / 112 immediately.",
    };
  }

  // ── Rule 5: Uncontrolled heavy bleeding ───────────────────────────────────
  if (
    combined.includes("heavy bleeding") ||
    combined.includes("bleeding won't stop") ||
    combined.includes("uncontrolled bleeding") ||
    combined.includes("bleeding that won")
  ) {
    return {
      emergency: true,
      reason:
        "Heavy or uncontrolled bleeding requires immediate emergency attention. Call 911 / 999 / 112.",
    };
  }

  // ── Rule 6: Loss of consciousness ────────────────────────────────────────
  if (
    combined.includes("fainted") ||
    combined.includes("unconscious") ||
    combined.includes("passed out") ||
    combined.includes("loss of consciousness")
  ) {
    return {
      emergency: true,
      reason:
        "Fainting or loss of consciousness needs urgent evaluation. Call 911 / 999 / 112 immediately.",
    };
  }

  // ── Rule 7: Anaphylaxis / severe allergic reaction ────────────────────────
  if (
    combined.includes("swelling of lips") ||
    combined.includes("throat swelling") ||
    combined.includes("tongue swelling") ||
    combined.includes("swollen throat") ||
    combined.includes("anaphylaxis")
  ) {
    return {
      emergency: true,
      reason:
        "Swelling of lips, throat, or tongue may indicate anaphylaxis — a life-threatening allergic reaction. Call 911 / 999 / 112 immediately.",
    };
  }

  // ── Rule 8: Extreme pain in chest or head area ────────────────────────────
  // Pain 9 or 10 specifically in chest or head zones
  if (
    pain >= 9 &&
    (a.includes("chest") || a.includes("head"))
  ) {
    return {
      emergency: true,
      reason:
        `Extreme pain (${pain}/10) in the ${area} area warrants immediate emergency evaluation. Please call 911 / 999 / 112 or go to the nearest emergency room.`,
    };
  }

  // No red flags triggered
  return { emergency: false };
}
