"use client";

import React, { useState } from "react";
import {
  Stethoscope,
  AlertTriangle,
  CheckCircle,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Search,
} from "lucide-react";
import { SYMPTOMS_CATALOG } from "@/data/mockData";
import { SymptomInfo } from "@/lib/types";

interface SymptomExplorerTabProps {
  onSelectSymptomForSummary: (symptomName: string) => void;
  setActiveTab: (tab: string) => void;
}

export default function SymptomExplorerTab({
  onSelectSymptomForSummary,
  setActiveTab,
}: SymptomExplorerTabProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeSymptom, setActiveSymptom] = useState<SymptomInfo>(SYMPTOMS_CATALOG[0]);
  const [duration, setDuration] = useState("Under 24 hours");
  const [freeformNotes, setFreeformNotes] = useState("");

  const categories = ["All", "Head & Neck", "Digestive", "Respiratory", "General", "Musculoskeletal"];

  const filtered = SYMPTOMS_CATALOG.filter((item) => {
    const matchesCat = selectedCategory === "All" || item.category === selectedCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleSendToSummary = () => {
    onSelectSymptomForSummary(
      `${activeSymptom.name} (Duration: ${duration}${freeformNotes ? `, Notes: ${freeformNotes}` : ""})`
    );
    setActiveTab("summary");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <Stethoscope className="w-6 h-6 text-teal-600" />
          Symptom Explorer & Triage Guide
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Explore conservative home-care guidance, red-flag warning signs, and prepare clear notes for your healthcare
          provider.
        </p>
      </div>

      {/* Search & Category Filter Pills */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search symptoms (e.g. headache, cough, fatigue)..."
            className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 bg-white"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                selectedCategory === cat
                  ? "bg-teal-600 text-white shadow-sm"
                  : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* 2-Column Explorer: Symptom Cards (Left) vs In-Depth Clinical Guide (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 1 Col: List of Symptoms */}
        <div className="space-y-2.5">
          {filtered.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 text-xs">
              No matching symptoms found. Try searching general terms.
            </div>
          ) : (
            filtered.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSymptom(item)}
                className={`w-full text-left p-4 rounded-2xl border transition ${
                  activeSymptom.id === item.id
                    ? "bg-teal-50/70 border-teal-500 ring-2 ring-teal-500/20 shadow-sm"
                    : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                    {item.category}
                  </span>
                  <span className="text-xs text-teal-600 font-semibold flex items-center gap-1">
                    Details &rarr;
                  </span>
                </div>
                <h3 className="font-bold text-sm text-slate-900">{item.name}</h3>
                <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                  {item.description}
                </p>
              </button>
            ))
          )}
        </div>

        {/* Right 2 Cols: Selected Symptom Detail & Action Guide */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl p-6 md:p-8 border border-slate-200/80 shadow-sm space-y-6">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-teal-50 text-teal-700 border border-teal-200 uppercase">
                  {activeSymptom.category}
                </span>
                <span className="text-xs text-slate-400">Educational Guidance</span>
              </div>
              <h2 className="text-xl font-bold text-slate-900 mt-2">{activeSymptom.name}</h2>
              <p className="text-sm text-slate-600 mt-1 leading-relaxed">{activeSymptom.description}</p>
            </div>

            {/* Red Flag Emergency Alert Box */}
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-4">
              <div className="flex items-center gap-2 text-rose-800 font-bold text-xs uppercase mb-2">
                <ShieldAlert className="w-4 h-4 text-rose-600" />
                <span>Urgent Red-Flag Warnings (Seek Immediate Care)</span>
              </div>
              <ul className="space-y-1.5 text-xs text-rose-900">
                {activeSymptom.redFlags.map((flag, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-rose-600 font-bold">•</span>
                    <span>{flag}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Home Care Measures */}
            <div>
              <h3 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                Evidence-Based Self-Care Measures
              </h3>
              <div className="space-y-2">
                {activeSymptom.homeCare.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center flex-shrink-0 text-[10px]">
                      {idx + 1}
                    </span>
                    <span className="leading-relaxed">{step}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* When to see a doctor */}
            <div>
              <h3 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-600" />
                When to Schedule a Doctor Appointment
              </h3>
              <ul className="space-y-1.5 text-xs text-slate-600">
                {activeSymptom.whenToSeeDoctor.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-amber-500 font-bold">→</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Interactive "Prepare for Doctor" Box */}
            <div className="border-t border-slate-100 pt-6">
              <h3 className="text-sm font-bold text-slate-900 mb-2">
                Log this symptom for your Doctor Visit Brief:
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    How long has this lasted?
                  </label>
                  <select
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full p-2 text-xs rounded-xl border border-slate-200 bg-white"
                  >
                    <option>Under 24 hours</option>
                    <option>2 to 3 days</option>
                    <option>1 to 2 weeks</option>
                    <option>More than 1 month (chronic)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Specific trigger / notes
                  </label>
                  <input
                    type="text"
                    value={freeformNotes}
                    onChange={(e) => setFreeformNotes(e.target.value)}
                    placeholder="e.g. Worse in the morning after coffee"
                    className="w-full p-2 text-xs rounded-xl border border-slate-200 bg-white"
                  />
                </div>
              </div>

              <button
                onClick={handleSendToSummary}
                className="w-full py-2.5 px-4 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-2 transition shadow-sm"
              >
                <span>Attach to Doctor Visit Summary</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
