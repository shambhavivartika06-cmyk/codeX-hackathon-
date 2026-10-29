"use client";

import React, { useState } from "react";
import {
  BookOpenCheck,
  Search,
  Sparkles,
  Loader2,
  AlertCircle,
  HelpCircle,
  Copy,
  Check,
} from "lucide-react";

const SAMPLE_TERMS = [
  "Complete Blood Count (CBC)",
  "TSH (Thyroid-Stimulating Hormone)",
  "Lipid Panel / LDL vs HDL",
  "HbA1c (Hemoglobin A1c)",
  "Creatinine / eGFR",
  "Vitamin D (25-Hydroxy)",
];

export default function ExplainerTab() {
  const [term, setTerm] = useState("");
  const [explanation, setExplanation] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isFallback, setIsFallback] = useState(false);

  const handleExplain = async (termToExplain?: string) => {
    const text = (termToExplain || term).trim();
    if (!text || isLoading) return;

    setTerm(text);
    setIsLoading(true);
    setCopied(false);

    try {
      const res = await fetch("/api/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ term: text }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to explain term");

      setExplanation(data.explanation);
      setIsFallback(Boolean(data.isFallback));
    } catch (err: any) {
      alert(`Error explaining term: ${err?.message || "Unknown error"}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!explanation) return;
    navigator.clipboard.writeText(explanation);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <BookOpenCheck className="w-6 h-6 text-sky-600" />
          Medical Terminology & Lab Explainer
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Demystify complex lab results, prescription terminology, and medical jargon into plain 5th-grade language.
        </p>
      </div>

      {/* Input Card */}
      <div className="bg-white rounded-2xl p-6 md:p-8 border border-slate-200/80 shadow-sm space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
            Enter a Medical Term, Diagnostic Acronym, or Lab Test:
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleExplain();
              }}
              placeholder="e.g. TSH, Complete Blood Count, Bilirubin, Atorvastatin..."
              className="flex-1 p-3 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 bg-white"
            />
            <button
              onClick={() => handleExplain()}
              disabled={!term.trim() || isLoading}
              className="px-6 py-3 bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white rounded-xl text-sm font-semibold flex items-center gap-2 transition shadow-sm"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Explaining...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Explain Term</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Popular chips */}
        <div>
          <span className="text-xs font-semibold text-slate-400 block mb-2">Or try a common lab test:</span>
          <div className="flex flex-wrap gap-2">
            {SAMPLE_TERMS.map((sample, idx) => (
              <button
                key={idx}
                onClick={() => handleExplain(sample)}
                disabled={isLoading}
                className="px-3 py-1.5 rounded-full text-xs font-medium bg-slate-50 border border-slate-200 hover:border-brand-300 hover:bg-brand-50 text-slate-700 transition"
              >
                {sample}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Explanation Output */}
      {explanation && (
        <div className="bg-white rounded-2xl p-6 md:p-8 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-900">Plain-English Explanation</span>
              {isFallback && (
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                  Local Mode
                </span>
              )}
            </div>

            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-500" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>

          <div className="text-sm text-slate-800 whitespace-pre-wrap leading-relaxed space-y-3">
            {explanation}
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex items-start gap-2.5 text-xs text-amber-900">
            <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <span>
              <strong>Clinical Context Notice:</strong> Individual reference ranges fluctuate across diagnostic
              laboratories, ages, and medical backgrounds. Never adjust prescriptions or make treatment choices
              without reviewing your official lab printout with your doctor.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
