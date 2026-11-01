"use client";

import React, { useState } from "react";
import {
  MapPin,
  AlertCircle,
  CheckCircle,
  Phone,
  Loader2,
  AlertTriangle,
  RefreshCw,
  ShieldAlert,
} from "lucide-react";
import { getTriageRecord } from "@/lib/storage";
import { TriageResult, Doctor } from "@/lib/types";
import doctorsData from "@/data/doctors.json";

// ─── Static data ──────────────────────────────────────────────────────────────

const DOCTORS: Doctor[] = doctorsData as Doctor[];

/** One clickable body zone */
interface BodyZone {
  id: string;
  label: string;
  path: string; // SVG path
}

// All coordinates fit inside a 200 × 480 viewBox.
// Anatomical orientation: observer's left is patient's right; observer's right is patient's left.
const BODY_ZONES: BodyZone[] = [
  {
    id: "head",
    label: "Head",
    path: "M 82,14 C 82,8 118,8 118,14 C 127,24 126,50 117,60 C 109,66 91,66 83,60 C 74,50 73,24 82,14 Z",
  },
  {
    id: "throat",
    label: "Throat",
    path: "M 89,66 L 111,66 L 113,84 L 87,84 Z",
  },
  {
    id: "chest",
    label: "Chest",
    path: "M 87,86 L 113,86 L 126,104 L 124,136 L 76,136 L 74,104 Z",
  },
  {
    id: "upper-abdomen",
    label: "Upper Abdomen",
    path: "M 76,138 L 124,138 L 122,174 L 78,174 Z",
  },
  {
    id: "lower-abdomen",
    label: "Lower Abdomen",
    path: "M 78,176 L 122,176 L 126,196 L 122,216 L 100,216 L 78,216 L 74,196 Z",
  },
  // Shoulders
  {
    id: "right-shoulder",
    label: "Right Shoulder",
    path: "M 85,86 C 73,86 58,92 48,102 L 53,118 L 73,104 Z",
  },
  {
    id: "left-shoulder",
    label: "Left Shoulder",
    path: "M 115,86 C 127,86 142,92 152,102 L 147,118 L 127,104 Z",
  },
  // Arms: Upper
  {
    id: "right-upper-arm",
    label: "Right Upper Arm",
    path: "M 49,104 L 54,119 L 52,166 L 34,168 Z",
  },
  {
    id: "left-upper-arm",
    label: "Left Upper Arm",
    path: "M 151,104 L 166,168 L 148,166 L 146,119 Z",
  },
  // Arms: Forearm
  {
    id: "right-forearm",
    label: "Right Forearm",
    path: "M 34,170 L 52,168 L 39,216 L 23,218 Z",
  },
  {
    id: "left-forearm",
    label: "Left Forearm",
    path: "M 166,170 L 177,218 L 161,216 L 148,168 Z",
  },
  // Hands
  {
    id: "right-hand",
    label: "Right Hand",
    path: "M 23,220 L 39,218 L 37,236 C 36,246 29,248 24,248 C 19,248 16,243 17,235 Z",
  },
  {
    id: "left-hand",
    label: "Left Hand",
    path: "M 161,218 L 177,220 L 183,235 C 184,243 181,248 176,248 C 171,248 164,246 163,236 Z",
  },
  // Thighs
  {
    id: "right-thigh",
    label: "Right Thigh",
    path: "M 76,218 L 98,218 L 97,296 L 70,296 Z",
  },
  {
    id: "left-thigh",
    label: "Left Thigh",
    path: "M 102,218 L 124,218 L 130,296 L 103,296 Z",
  },
  // Knees
  {
    id: "right-knee",
    label: "Right Knee",
    path: "M 70,298 L 97,298 L 96,326 L 71,326 Z",
  },
  {
    id: "left-knee",
    label: "Left Knee",
    path: "M 103,298 L 130,298 L 129,326 L 104,326 Z",
  },
  // Lower Legs
  {
    id: "right-lower-leg",
    label: "Right Lower Leg",
    path: "M 71,328 L 96,328 L 94,434 L 74,434 Z",
  },
  {
    id: "left-lower-leg",
    label: "Left Lower Leg",
    path: "M 104,328 L 129,328 L 126,434 L 106,434 Z",
  },
  // Feet
  {
    id: "right-foot",
    label: "Right Foot",
    path: "M 74,436 L 94,436 L 95,456 C 95,465 88,468 78,468 C 67,468 62,462 62,454 C 62,446 68,439 74,436 Z",
  },
  {
    id: "left-foot",
    label: "Left Foot",
    path: "M 106,436 L 126,436 C 132,439 138,446 138,454 C 138,462 133,468 122,468 C 112,468 105,465 105,456 Z",
  },
];

const DURATION_OPTIONS = [
  "Few hours",
  "1-2 days",
  "About a week",
  "More than a week",
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

// Pain text / bg colour helpers (same style as CheckInTab)
function painColor(pain: number) {
  if (pain <= 3) return "text-emerald-700";
  if (pain <= 6) return "text-amber-700";
  return "text-rose-700";
}
function painBg(pain: number) {
  if (pain <= 3) return "bg-emerald-50 border-emerald-200";
  if (pain <= 6) return "bg-amber-50 border-amber-200";
  return "bg-rose-50 border-rose-200";
}

/** Urgency → card colour tokens */
function urgencyStyle(urgency: TriageResult["urgency"]) {
  if (urgency === "home")
    return {
      border: "border-emerald-200",
      bg: "bg-emerald-50",
      badge: "bg-emerald-100 text-emerald-800 border-emerald-200",
      label: "✅ Home Care",
    };
  if (urgency === "soon")
    return {
      border: "border-amber-200",
      bg: "bg-amber-50",
      badge: "bg-amber-100 text-amber-800 border-amber-200",
      label: "⚠️ See a Doctor Soon",
    };
  return {
    border: "border-rose-300",
    bg: "bg-rose-50",
    badge: "bg-rose-100 text-rose-800 border-rose-200",
    label: "🚨 See a Doctor Now",
  };
}

/** Confidence → badge colour */
function confidenceStyle(c: TriageResult["confidence"]) {
  if (c === "high") return "bg-emerald-100 text-emerald-800 border-emerald-200";
  if (c === "medium") return "bg-amber-100 text-amber-800 border-amber-200";
  return "bg-slate-100 text-slate-700 border-slate-200";
}

/**
 * Match doctors to doctorType by specialty (case-insensitive includes).
 * Falls back to General Physician if nothing matches. Returns at most 3.
 */
function matchDoctors(doctorType: string): Doctor[] {
  const key = doctorType.toLowerCase();
  const matched = DOCTORS.filter((d) =>
    d.specialty.toLowerCase().includes(key) ||
    key.includes(d.specialty.toLowerCase())
  );
  if (matched.length > 0) return matched.slice(0, 3);
  // Fallback: General Physician
  return DOCTORS.filter((d) =>
    d.specialty.toLowerCase().includes("general")
  ).slice(0, 3);
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function BodyMapTab() {
  // Body map selection
  const [hoveredZone, setHoveredZone] = useState<string | null>(null);
  const [selectedZone, setSelectedZone] = useState<string | null>(null);

  // Form fields
  const [description, setDescription] = useState("");
  const [pain, setPain] = useState(3);
  const [duration, setDuration] = useState(DURATION_OPTIONS[0]);

  // AI triage state
  const [loading, setLoading] = useState(false);
  const [triageResult, setTriageResult] = useState<TriageResult | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  // Derived label for selected zone
  const selectedLabel =
    BODY_ZONES.find((z) => z.id === selectedZone)?.label ?? null;

  // ── Reset everything ────────────────────────────────────────────────────────
  const handleReset = () => {
    setTriageResult(null);
    setApiError(null);
    setSelectedZone(null);
    setDescription("");
    setPain(3);
    setDuration(DURATION_OPTIONS[0]);
  };

  // ── Submit: call /api/triage ────────────────────────────────────────────────
  const handleCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedZone || !selectedLabel) return;

    setLoading(true);
    setApiError(null);
    setTriageResult(null);

    try {
      // Pull allergies + medications from localStorage
      const record = getTriageRecord();

      const res = await fetch("/api/triage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          area: selectedLabel,
          symptoms: description.trim(),
          pain,
          duration,
          record,
        }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        setApiError(data.error ?? "Triage request failed. Please try again.");
      } else {
        setTriageResult(data.result as TriageResult);
      }
    } catch (err: any) {
      setApiError("Could not reach the server. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  // Doctors to show alongside the result
  const matchedDoctors =
    triageResult && !triageResult.emergency
      ? matchDoctors(triageResult.doctorType)
      : [];

  const urgency = triageResult?.urgency;
  const uStyle = urgency ? urgencyStyle(urgency) : null;

  return (
    <div className="space-y-8">
      {/* ── Page Header ── */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Body Map
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Tap a region on the body, describe your symptoms, and get an AI
          triage summary to share with your doctor.
        </p>
      </div>

      {/* ── Main two-column layout ── */}
      <div className="flex flex-col lg:flex-row gap-8 items-start">

        {/* ── Left: SVG Body Map ── */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 flex flex-col items-center w-full lg:w-auto">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4">
            Tap a zone to select it
          </p>

          <svg
            viewBox="0 0 200 480"
            className="w-full max-w-[220px] max-h-[70vh] h-auto select-none"
            aria-label="Human body map"
          >
            {BODY_ZONES.map((zone) => {
              const isSelected = selectedZone === zone.id;
              const isHovered = hoveredZone === zone.id;

              // Colours: selected = brand blue, hovered = slate-200, default = slate-100
              const fill = isSelected
                ? "#0284c7"
                : isHovered
                ? "#e2e8f0"
                : "#f1f5f9";
              const stroke = isSelected ? "#0369a1" : "#cbd5e1";

              return (
                <path
                  key={zone.id}
                  d={zone.path}
                  fill={fill}
                  stroke={stroke}
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                  className="cursor-pointer transition-all duration-150"
                  onMouseEnter={() => setHoveredZone(zone.id)}
                  onMouseLeave={() => setHoveredZone(null)}
                  onClick={() => {
                    setSelectedZone(zone.id);
                    // Clear previous result when the zone changes
                    setTriageResult(null);
                    setApiError(null);
                  }}
                  aria-label={zone.label}
                >
                  <title>{zone.label}</title>
                </path>
              );
            })}
          </svg>

          {/* Orientation guide: viewer's left is user's right side, viewer's right is user's left side */}
          <div className="w-full max-w-[220px] flex justify-between px-2 mt-2 text-[11px] font-medium text-slate-400 select-none">
            <span>Your right</span>
            <span>Your left</span>
          </div>

          <p className="mt-3 text-xs text-slate-500 min-h-[1.25rem]">
            {hoveredZone
              ? BODY_ZONES.find((z) => z.id === hoveredZone)?.label
              : selectedLabel
              ? `Selected: ${selectedLabel}`
              : "No zone selected"}
          </p>
        </div>

        {/* ── Right: Form + Result Panel ── */}
        <div className="flex-1 w-full space-y-6">

          {/* ── EMERGENCY alert ── */}
          {triageResult?.emergency && (
            <div className="bg-rose-50 border-2 border-rose-400 rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-3">
                <ShieldAlert className="w-7 h-7 text-rose-600 flex-shrink-0" />
                <h2 className="text-lg font-extrabold text-rose-800">
                  Emergency — Seek Help Immediately
                </h2>
              </div>
              <p className="text-sm text-rose-800 leading-relaxed font-medium">
                {triageResult.emergencyReason}
              </p>
              <div className="bg-rose-100 rounded-xl p-4 border border-rose-200">
                <p className="text-sm font-bold text-rose-900">
                  📞 Call your local emergency number now
                </p>
                <p className="text-sm text-rose-800 mt-1">
                  India: <strong>112</strong> or <strong>108</strong> (ambulance)
                </p>
              </div>
              {/* Immediate steps */}
              <ul className="space-y-1.5">
                {triageResult.immediateSteps.map((step, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-rose-800">
                    <span className="mt-0.5 text-rose-500 flex-shrink-0">•</span>
                    {step}
                  </li>
                ))}
              </ul>
              {/* Disclaimer + Start Over */}
              <p className="text-[11px] text-rose-600 border-t border-rose-200 pt-3">
                This is an automated safety check, not a medical diagnosis. Always follow emergency services&apos; instructions.
              </p>
              <button
                onClick={handleReset}
                className="w-full py-2.5 rounded-xl border border-rose-200 text-sm font-semibold text-rose-700 hover:bg-rose-100 transition"
              >
                Start Over
              </button>
            </div>
          )}

          {/* ── API ERROR state ── */}
          {apiError && !triageResult && (
            <div className="bg-white border border-rose-200 rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-500 flex-shrink-0" />
                <h2 className="text-base font-bold text-slate-900">
                  Something went wrong
                </h2>
              </div>
              <p className="text-sm text-slate-600">{apiError}</p>
              <div className="flex gap-3">
                <button
                  onClick={handleCheck as any}
                  className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm font-semibold transition"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Try again
                </button>
                <button
                  onClick={handleReset}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition"
                >
                  Start Over
                </button>
              </div>
            </div>
          )}

          {/* ── NON-EMERGENCY TRIAGE RESULT ── */}
          {triageResult && !triageResult.emergency && uStyle && (
            <div className={`rounded-2xl border-2 ${uStyle.border} ${uStyle.bg} p-6 space-y-5`}>
              {/* Urgency header */}
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className={`text-sm font-bold px-3 py-1 rounded-full border ${uStyle.badge}`}>
                  {uStyle.label}
                </span>
                {/* Confidence badge */}
                <span
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded border ${confidenceStyle(triageResult.confidence)}`}
                >
                  Confidence: {triageResult.confidence}
                </span>
              </div>

              {/* Low confidence nudge */}
              {triageResult.confidence === "low" && (
                <p className="text-sm font-semibold text-slate-700 bg-white rounded-xl px-4 py-3 border border-slate-200">
                  🤔 Not sure about this. Please see a doctor for a proper evaluation.
                </p>
              )}

              {/* Possible causes */}
              {triageResult.possibleCauses.length > 0 && (
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Possible Causes
                  </p>
                  <ul className="space-y-1">
                    {triageResult.possibleCauses.map((cause, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                        <span className="text-brand-500 flex-shrink-0 mt-0.5">•</span>
                        {cause}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Immediate steps */}
              {triageResult.immediateSteps.length > 0 && (
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Immediate Steps
                  </p>
                  <ul className="space-y-1.5">
                    {triageResult.immediateSteps.map((step, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                        <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                        {step}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Doctor type */}
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="w-4 h-4 text-brand-500 flex-shrink-0" />
                <span className="text-slate-600 font-medium">
                  Recommended specialist:{" "}
                  <span className="font-bold text-slate-900">
                    {triageResult.doctorType}
                  </span>
                </span>
              </div>

              {/* Personal note */}
              {triageResult.personalNote && (
                <div className="bg-white rounded-xl p-3 border border-slate-200 text-sm text-slate-700 leading-relaxed">
                  <span className="font-semibold">Personal note: </span>
                  {triageResult.personalNote}
                </div>
              )}

              {/* Follow-up question */}
              {triageResult.followUpQuestion && (
                <div className="bg-white rounded-xl p-3 border border-slate-200 text-sm text-slate-700">
                  <span className="font-semibold">Ask your doctor: </span>
                  <span className="italic">&quot;{triageResult.followUpQuestion}&quot;</span>
                </div>
              )}

              {/* Urgency = now: go today banner */}
              {triageResult.urgency === "now" && (
                <p className="text-sm font-bold text-rose-700 bg-rose-50 border border-rose-200 rounded-xl px-4 py-3">
                  🏥 Go to the nearest hospital or clinic today.
                </p>
              )}

              {/* Medical disclaimer */}
              <p className="text-[11px] text-slate-500 border-t border-slate-200/60 pt-3 leading-relaxed">
                This AI summary is for general educational purposes only and does
                not constitute a medical diagnosis. Always consult a licensed
                healthcare provider for personalised advice.
              </p>

              {/* Start Over */}
              <button
                onClick={handleReset}
                className="w-full py-2.5 rounded-xl border border-slate-300 text-sm font-semibold text-slate-600 hover:bg-white transition"
              >
                Start Over
              </button>
            </div>
          )}

          {/* ── DOCTOR LIST ── (only for non-emergency results) */}
          {triageResult && !triageResult.emergency && matchedDoctors.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-900">
                  Doctors you can contact
                </h2>
                {/* Disclaimer label */}
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                  Sample data — not real doctors
                </span>
              </div>

              <div className="space-y-3">
                {matchedDoctors.map((doc, i) => (
                  <div
                    key={i}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200"
                  >
                    <div className="space-y-0.5">
                      <p className="text-sm font-bold text-slate-900">{doc.name}</p>
                      <p className="text-xs text-slate-500">
                        {doc.specialty} · {doc.clinic}
                      </p>
                      <p className="text-xs text-slate-400">
                        📍 {doc.area} · {doc.distance}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-white px-3 py-1.5 rounded-lg border border-slate-200 flex-shrink-0">
                      <Phone className="w-3.5 h-3.5 text-brand-500" />
                      {doc.phone}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── SYMPTOM FORM (shown when no result yet and not loading) ── */}
          {!triageResult && !apiError && (
            <form
              onSubmit={handleCheck}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-6"
            >
              {/* Selected area display */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  Selected Area
                </p>
                <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <MapPin className="w-4 h-4 text-brand-500 flex-shrink-0" />
                  <span className="text-sm font-semibold text-slate-800">
                    {selectedLabel ?? (
                      <span className="text-slate-400 font-normal">
                        Tap a body zone on the left
                      </span>
                    )}
                  </span>
                </div>
              </div>

              {/* Symptom description */}
              <div>
                <label className="block text-sm font-bold text-slate-800 mb-1.5">
                  Describe your symptoms
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="E.g. Sharp pain when breathing, dull ache since morning, swollen..."
                  rows={3}
                  className="w-full p-3 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 resize-none"
                />
              </div>

              {/* Pain slider */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-rose-500" />
                    Pain Level (1 – 10)
                  </label>
                  <span
                    className={`text-sm font-extrabold px-2.5 py-0.5 rounded-lg border ${painColor(pain)} ${painBg(pain)}`}
                  >
                    {pain} / 10
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="1"
                  value={pain}
                  onChange={(e) => setPain(parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-600"
                />
                <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                  <span>1 – Barely noticeable</span>
                  <span>5 – Moderate</span>
                  <span>10 – Severe</span>
                </div>
              </div>

              {/* Duration dropdown */}
              <div>
                <label className="block text-sm font-bold text-slate-800 mb-1.5">
                  How long have you had this?
                </label>
                <select
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full p-3 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 cursor-pointer"
                >
                  {DURATION_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={!selectedZone || loading}
                className="w-full inline-flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-semibold px-6 py-2.5 rounded-xl transition shadow-sm text-sm"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Checking...
                  </>
                ) : (
                  <>
                    <MapPin className="w-4 h-4" />
                    Check my symptoms
                  </>
                )}
              </button>

              {!selectedZone && (
                <p className="text-center text-xs text-slate-400">
                  Select a body zone first to enable this button.
                </p>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
