"use client";

import React, { useState } from "react";
import {
  CalendarCheck,
  Smile,
  Zap,
  Moon,
  AlertCircle,
  Plus,
  Trash2,
  CheckCircle,
  HelpCircle,
} from "lucide-react";
import { WellnessCheckIn, MoodType } from "@/lib/types";
import { calculateWellnessScore } from "@/lib/scoring";

interface CheckInTabProps {
  checkIns: WellnessCheckIn[];
  onSaveCheckIn: (entry: WellnessCheckIn) => void;
  onDeleteCheckIn: (id: string) => void;
}

const MOOD_OPTIONS: { type: MoodType; label: string; icon: string; description: string }[] = [
  { type: "great", label: "Great", icon: "😄", description: "Energized & positive" },
  { type: "good", label: "Good", icon: "🙂", description: "Steady & calm" },
  { type: "okay", label: "Okay", icon: "😐", description: "Managing normally" },
  { type: "low", label: "Low", icon: "🙁", description: "Tired or stressed" },
  { type: "rough", label: "Rough", icon: "😣", description: "Struggling or in pain" },
];

export default function CheckInTab({
  checkIns,
  onSaveCheckIn,
  onDeleteCheckIn,
}: CheckInTabProps) {
  // Form State
  const [mood, setMood] = useState<MoodType>("good");
  const [energy, setEnergy] = useState<number>(7);
  const [sleepHours, setSleepHours] = useState<number>(7.5);
  const [discomfort, setDiscomfort] = useState<number>(1);
  const [notes, setNotes] = useState<string>("");
  const [showFormulaModal, setShowFormulaModal] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  // Live calculation
  const scoreResult = calculateWellnessScore(mood, energy, sleepHours, discomfort);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const now = new Date();
    const newEntry: WellnessCheckIn = {
      id: "chk-" + Date.now(),
      timestamp: now.toISOString(),
      dateFormatted: now.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      mood,
      energy,
      sleepHours,
      discomfortLevel: discomfort,
      notes: notes.trim(),
      wellnessScore: scoreResult.total,
    };

    onSaveCheckIn(newEntry);
    setSaveSuccess(true);
    setNotes("");

    setTimeout(() => {
      setSaveSuccess(false);
    }, 3500);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Daily Wellness Check-in</h1>
        <p className="text-sm text-slate-500 mt-1">
          Log how you&apos;re feeling today. CareBuddy computes a transparent 100-point wellness score saved locally in your
          browser.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: The Interactive Form */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 md:p-8 border border-slate-200/80 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 1. Mood Selection */}
            <div>
              <label className="block text-sm font-bold text-slate-800 mb-2">
                1. How is your overall mood today?
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                {MOOD_OPTIONS.map((item) => (
                  <button
                    key={item.type}
                    type="button"
                    onClick={() => setMood(item.type)}
                    className={`p-3 rounded-xl border text-center transition flex flex-col items-center justify-center ${
                      mood === item.type
                        ? "bg-brand-50 border-brand-500 ring-2 ring-brand-500/20 text-brand-900"
                        : "border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    <span className="text-2xl mb-1">{item.icon}</span>
                    <span className="text-xs font-bold">{item.label}</span>
                    <span className="text-[10px] text-slate-500 mt-0.5">{item.description}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Energy Level Slider */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-amber-500" />
                  2. Energy Level (1 to 10)
                </label>
                <span className="text-sm font-extrabold text-brand-700 bg-brand-50 px-2.5 py-0.5 rounded-lg border border-brand-200">
                  {energy} / 10
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                step="1"
                value={energy}
                onChange={(e) => setEnergy(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-600"
              />
              <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                <span>1 - Exhausted</span>
                <span>5 - Moderate</span>
                <span>10 - High Energy</span>
              </div>
            </div>

            {/* 3. Sleep Hours */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                  <Moon className="w-4 h-4 text-indigo-500" />
                  3. Sleep Duration Last Night (Hours)
                </label>
                <span className="text-sm font-extrabold text-brand-700 bg-brand-50 px-2.5 py-0.5 rounded-lg border border-brand-200">
                  {sleepHours} hrs
                </span>
              </div>
              <input
                type="range"
                min="3"
                max="12"
                step="0.5"
                value={sleepHours}
                onChange={(e) => setSleepHours(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-600"
              />
              <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                <span>3 hrs</span>
                <span>7 - 9 hrs (Optimal)</span>
                <span>12 hrs</span>
              </div>
            </div>

            {/* 4. Physical Discomfort / Pain Level */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-rose-500" />
                  4. Physical Discomfort / Pain (0 = None, 10 = Severe)
                </label>
                <span className="text-sm font-extrabold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-lg border border-rose-200">
                  {discomfort} / 10
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="10"
                step="1"
                value={discomfort}
                onChange={(e) => setDiscomfort(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-rose-500"
              />
              <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                <span>0 - Pain free</span>
                <span>5 - Noticeable ache</span>
                <span>10 - Severe pain</span>
              </div>
            </div>

            {/* 5. Personal Notes */}
            <div>
              <label className="block text-sm font-bold text-slate-800 mb-1.5">
                5. Personal Notes & Observations (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="E.g., Drank 2L of water today, felt slightly stiff neck after computer work, took a 15-min walk."
                rows={3}
                className="w-full p-3 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>

            {/* Submit Bar */}
            <div className="pt-2 flex items-center justify-between gap-4">
              <button
                type="button"
                onClick={() => setShowFormulaModal(true)}
                className="text-xs text-slate-500 hover:text-brand-600 flex items-center gap-1"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                How is this calculated?
              </button>

              <button
                type="submit"
                className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold px-6 py-2.5 rounded-xl transition shadow-sm text-sm"
              >
                <Plus className="w-4 h-4" />
                Save Daily Check-in
              </button>
            </div>

            {saveSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Today&apos;s check-in was saved successfully to your local browser history!</span>
              </div>
            )}
          </form>
        </div>

        {/* Right 1 Col: Live Score Card Preview */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm sticky top-24">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3">
              Live Score Calculation
            </h2>

            <div className="text-center py-4 bg-slate-50 rounded-xl border border-slate-200 mb-4">
              <span className="text-5xl font-black text-brand-700 tracking-tight">
                {scoreResult.total}
              </span>
              <span className="text-slate-400 text-sm ml-1">/ 100</span>
              <p className="text-xs font-semibold text-slate-700 mt-1">{scoreResult.summary}</p>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between text-slate-600">
                <span>Mood ({mood})</span>
                <span className="font-semibold text-slate-900">{scoreResult.breakdown.moodPts} / 25 pts</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5">
                <div
                  className="bg-brand-500 h-1.5 rounded-full"
                  style={{ width: `${(scoreResult.breakdown.moodPts / 25) * 100}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-slate-600 pt-1">
                <span>Energy ({energy}/10)</span>
                <span className="font-semibold text-slate-900">{scoreResult.breakdown.energyPts} / 25 pts</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5">
                <div
                  className="bg-amber-500 h-1.5 rounded-full"
                  style={{ width: `${(scoreResult.breakdown.energyPts / 25) * 100}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-slate-600 pt-1">
                <span>Sleep ({sleepHours} hrs)</span>
                <span className="font-semibold text-slate-900">{scoreResult.breakdown.sleepPts} / 25 pts</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5">
                <div
                  className="bg-indigo-500 h-1.5 rounded-full"
                  style={{ width: `${(scoreResult.breakdown.sleepPts / 25) * 100}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-slate-600 pt-1">
                <span>Physical Comfort (discomfort {discomfort}/10)</span>
                <span className="font-semibold text-slate-900">{scoreResult.breakdown.comfortPts} / 25 pts</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5">
                <div
                  className="bg-emerald-500 h-1.5 rounded-full"
                  style={{ width: `${(scoreResult.breakdown.comfortPts / 25) * 100}%` }}
                />
              </div>
            </div>

            <p className="text-[11px] text-slate-400 mt-4 leading-relaxed border-t border-slate-100 pt-3">
              This score reflects immediate subjective lifestyle factors and does not represent a medical diagnostic
              test.
            </p>
          </div>
        </div>
      </div>

      {/* History Section */}
      <div className="bg-white rounded-2xl p-6 md:p-8 border border-slate-200/80 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Recorded Check-In History</h2>
            <p className="text-xs text-slate-500">View and manage your past lifestyle entries</p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
            {checkIns.length} records saved
          </span>
        </div>

        {checkIns.length === 0 ? (
          <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-200">
            <CalendarCheck className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">No check-in history found</p>
            <p className="text-xs text-slate-500 mt-1">Complete the form above to add your first entry.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {checkIns.map((item) => (
              <div key={item.id} className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">{item.dateFormatted}</span>
                    <span className="text-xs px-2 py-0.5 rounded font-bold bg-brand-50 text-brand-700 border border-brand-200">
                      Score: {item.wellnessScore}/100
                    </span>
                    <span className="text-xs font-medium text-slate-500 capitalize">
                      Mood: {item.mood}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600">
                    <span>⚡ Energy: {item.energy}/10</span>
                    <span>🌙 Sleep: {item.sleepHours} hrs</span>
                    <span>🩹 Discomfort: {item.discomfortLevel}/10</span>
                  </div>
                  {item.notes && (
                    <p className="text-xs text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100 mt-1">
                      &ldquo;{item.notes}&rdquo;
                    </p>
                  )}
                </div>

                <button
                  onClick={() => {
                    if (confirm("Are you sure you want to delete this check-in entry?")) {
                      onDeleteCheckIn(item.id);
                    }
                  }}
                  className="text-slate-400 hover:text-rose-600 p-2 rounded-lg hover:bg-rose-50 transition"
                  title="Delete entry"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Formula Explanation Modal */}
      {showFormulaModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-2">CareBuddy Transparent Scoring Formula</h3>
            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              We never use a black-box machine-learning model to invent health scores. The score is a simple 100-point
              composite built from 4 equal 25-point buckets:
            </p>
            <div className="space-y-2 text-xs text-slate-700 mb-6 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <p>• <strong>Mood (25 pts)</strong>: Great = 25, Good = 20, Okay = 15, Low = 8, Rough = 4.</p>
              <p>• <strong>Energy (25 pts)</strong>: Direct 1-10 slider scaled by 2.5 (e.g. 8 energy = 20 pts).</p>
              <p>• <strong>Sleep (25 pts)</strong>: 7–9 hours (ideal) = 25 pts, 6 or 10 hrs = 20 pts, &lt;5 or &gt;11 hrs = 8 pts.</p>
              <p>• <strong>Comfort (25 pts)</strong>: (10 - discomfort level) * 2.5 (0 discomfort = 25 pts; 10 = 0 pts).</p>
            </div>
            <button
              onClick={() => setShowFormulaModal(false)}
              className="w-full py-2.5 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800"
            >
              Understood
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
