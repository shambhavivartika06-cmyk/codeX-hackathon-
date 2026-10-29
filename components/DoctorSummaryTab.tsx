"use client";

import React, { useState } from "react";
import {
  FileText,
  Copy,
  Check,
  Sparkles,
  Printer,
  HelpCircle,
  Loader2,
  Send,
  Plus,
  Trash2,
} from "lucide-react";
import { UserProfile, WellnessCheckIn, Medication } from "@/lib/types";

interface DoctorSummaryTabProps {
  profile: UserProfile;
  checkIns: WellnessCheckIn[];
  medications: Medication[];
  selectedSymptoms: string[];
  onRemoveSymptom: (symptom: string) => void;
  onAddCustomSymptom: (symptom: string) => void;
}

export default function DoctorSummaryTab({
  profile,
  checkIns,
  medications,
  selectedSymptoms,
  onRemoveSymptom,
  onAddCustomSymptom,
}: DoctorSummaryTabProps) {
  const [customSymptomInput, setCustomSymptomInput] = useState("");
  const [userNotes, setUserNotes] = useState("");
  const [generatedSummary, setGeneratedSummary] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isFallback, setIsFallback] = useState(false);

  const handleGenerate = async () => {
    setIsLoading(true);
    setCopied(false);

    try {
      const res = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profile,
          checkIns,
          medications,
          selectedSymptoms,
          userNotes,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate summary");

      setGeneratedSummary(data.summary);
      setIsFallback(Boolean(data.isFallback));
    } catch (err: any) {
      console.error(err);
      alert(`Could not generate summary: ${err?.message || "Unknown error"}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!generatedSummary) return;
    navigator.clipboard.writeText(generatedSummary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleAddSymptom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customSymptomInput.trim()) return;
    onAddCustomSymptom(customSymptomInput.trim());
    setCustomSymptomInput("");
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <FileText className="w-6 h-6 text-indigo-600" />
          Doctor Visit Brief Generator
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Compile your check-ins, medication adherence, and symptoms into a structured 1-page report ready for your
          physician or telehealth call.
        </p>
      </div>

      {/* Input Options Grid */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-5">
        <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
          Review Data Included in Brief
        </h2>

        {/* Selected Symptoms Chips */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
            Active Symptoms to Report ({selectedSymptoms.length})
          </label>
          <div className="flex flex-wrap items-center gap-2 mb-3">
            {selectedSymptoms.length === 0 ? (
              <span className="text-xs text-slate-400 italic">
                No active symptoms attached yet. Pick from Symptom Explorer or type below.
              </span>
            ) : (
              selectedSymptoms.map((symp, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-800 border border-indigo-200"
                >
                  <span>{symp}</span>
                  <button
                    onClick={() => onRemoveSymptom(symp)}
                    className="text-indigo-400 hover:text-rose-600 p-0.5"
                    title="Remove symptom"
                  >
                    ×
                  </button>
                </span>
              ))
            )}
          </div>

          {/* Add custom symptom mini form */}
          <form onSubmit={handleAddSymptom} className="flex gap-2">
            <input
              type="text"
              value={customSymptomInput}
              onChange={(e) => setCustomSymptomInput(e.target.value)}
              placeholder="Add another symptom (e.g. Mild lower back stiffness)..."
              className="flex-1 p-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
            />
            <button
              type="submit"
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              Add
            </button>
          </form>
        </div>

        {/* Extra Notes */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
            Key Questions or Concerns for the Doctor (Optional)
          </label>
          <textarea
            value={userNotes}
            onChange={(e) => setUserNotes(e.target.value)}
            placeholder="e.g. Wondering if my dosage should be adjusted, need a refill on prescription, feeling tired around 3 PM."
            rows={2}
            className="w-full p-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
          />
        </div>

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={isLoading}
          className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition shadow-sm"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Generating Clinical Summary...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-indigo-200" />
              <span>Generate Doctor Visit Brief</span>
            </>
          )}
        </button>
      </div>

      {/* Generated Summary Card */}
      {generatedSummary && (
        <div className="bg-white rounded-2xl p-6 md:p-8 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-900">Generated Doctor Visit Brief</span>
              {isFallback && (
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                  Reliable Local Template
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-500" />
                    <span>Copy to Clipboard</span>
                  </>
                )}
              </button>

              <button
                onClick={handlePrint}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                <Printer className="w-3.5 h-3.5 text-slate-500" />
                <span>Print</span>
              </button>
            </div>
          </div>

          <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 font-mono whitespace-pre-wrap leading-relaxed">
            {generatedSummary}
          </div>
        </div>
      )}
    </div>
  );
}
