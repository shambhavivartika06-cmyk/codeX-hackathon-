"use client";

import React from "react";
import {
  HeartPulse,
  Pill,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Stethoscope,
  Calendar,
  Activity,
  Smile,
  ShieldCheck,
} from "lucide-react";
import { UserProfile, WellnessCheckIn, Medication } from "@/lib/types";

interface DashboardTabProps {
  profile: UserProfile;
  checkIns: WellnessCheckIn[];
  medications: Medication[];
  setActiveTab: (tab: string) => void;
  onToggleMedication: (id: string) => void;
}

export default function DashboardTab({
  profile,
  checkIns,
  medications,
  setActiveTab,
  onToggleMedication,
}: DashboardTabProps) {
  const latestCheckIn = checkIns.length > 0 ? checkIns[0] : null;

  // Calculate today's medication metrics
  const totalMeds = medications.length;
  const takenMeds = medications.filter((m) => m.takenToday).length;
  const medPercent = totalMeds > 0 ? Math.round((takenMeds / totalMeds) * 100) : 100;

  // Current Wellness Score
  const currentScore = latestCheckIn ? latestCheckIn.wellnessScore : 85;

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-600 bg-emerald-50 border-emerald-200";
    if (score >= 60) return "text-amber-600 bg-amber-50 border-amber-200";
    return "text-rose-600 bg-rose-50 border-rose-200";
  };

  const todayStr = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="space-y-6">
      {/* Welcome Hero Banner */}
      <div className="bg-gradient-to-r from-brand-600 via-brand-700 to-teal-700 rounded-3xl p-6 md:p-8 text-white shadow-sm relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-white text-xs font-medium mb-3 backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5 text-mint-300" />
            <span>CareBuddy Wellness Hub</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Good day, {profile.name?.split(" ")[0] || "Friend"} 👋
          </h1>
          <p className="text-brand-100 text-sm md:text-base mt-2 leading-relaxed">
            Here is your daily health status for <span className="font-medium text-white">{todayStr}</span>. Stay
            hydrated and keep up your wellness streak!
          </p>

          <div className="flex flex-wrap items-center gap-3 mt-6">
            <button
              onClick={() => setActiveTab("checkin")}
              className="inline-flex items-center gap-2 bg-white text-brand-700 hover:bg-brand-50 px-4 py-2.5 rounded-xl font-semibold text-sm transition shadow-sm"
            >
              <Calendar className="w-4 h-4" />
              <span>Log Today&apos;s Check-in</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setActiveTab("assistant")}
              className="inline-flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-4 py-2.5 rounded-xl font-medium text-sm transition backdrop-blur-sm"
            >
              <Sparkles className="w-4 h-4 text-mint-300" />
              <span>Ask AI Assistant</span>
            </button>
          </div>
        </div>

        {/* Decorative background shape */}
        <div className="absolute right-0 bottom-0 translate-x-10 translate-y-10 w-64 h-64 rounded-full bg-white/5 pointer-events-none" />
      </div>

      {/* Top 4 Quick Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Wellness Score */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Wellness Index
            </span>
            <div className="w-8 h-8 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="my-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{currentScore}</span>
            <span className="text-xs text-slate-400">/ 100</span>
            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${getScoreColor(currentScore)}`}>
              {currentScore >= 80 ? "Optimal" : currentScore >= 60 ? "Moderate" : "Attention"}
            </span>
          </div>
          <p className="text-xs text-slate-500">
            {latestCheckIn
              ? `Based on check-in: ${latestCheckIn.dateFormatted}`
              : "Demo baseline score. Log a check-in to personalize!"}
          </p>
        </div>

        {/* Card 2: Medication Adherence */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Medication Due
            </span>
            <div className="w-8 h-8 rounded-xl bg-mint-50 text-mint-600 flex items-center justify-center">
              <Pill className="w-4 h-4" />
            </div>
          </div>
          <div className="my-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">
              {takenMeds}/{totalMeds}
            </span>
            <span className="text-xs text-slate-500">doses taken</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-mint-500 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${medPercent}%` }}
            />
          </div>
        </div>

        {/* Card 3: Check-in Streak / Status */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Check-In History
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Smile className="w-4 h-4" />
            </div>
          </div>
          <div className="my-3">
            <span className="text-3xl font-extrabold text-slate-900">{checkIns.length}</span>
            <span className="text-xs text-slate-500 ml-1.5">logged days</span>
          </div>
          <p className="text-xs text-slate-500">
            {checkIns.length > 0 ? "Logs saved locally in browser" : "No logs recorded yet"}
          </p>
        </div>

        {/* Card 4: Health Snapshot */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Health Baseline
            </span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="my-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-800">Blood:</span>
              <span className="text-xs px-2 py-0.5 rounded bg-slate-100 font-bold text-slate-700">
                {profile.bloodGroup || "O+"}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 truncate" title={profile.allergies}>
              Allergies: {profile.allergies || "None noted"}
            </p>
          </div>
          <button
            onClick={() => setActiveTab("profile")}
            className="text-xs font-medium text-brand-600 hover:text-brand-800 text-left"
          >
            Edit Health Profile &rarr;
          </button>
        </div>
      </div>

      {/* Main 2-Column Split: Today's Medications + Recent Check-in Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Today's Medications Checklist */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Today&apos;s Medication Checklist</h2>
              <p className="text-xs text-slate-500">Click dose to toggle taken status</p>
            </div>
            <button
              onClick={() => setActiveTab("medications")}
              className="text-xs font-semibold text-brand-600 hover:text-brand-800"
            >
              Manage Meds &rarr;
            </button>
          </div>

          {medications.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <Pill className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-medium text-slate-700">No medications configured</p>
              <button
                onClick={() => setActiveTab("medications")}
                className="mt-3 text-xs font-semibold text-brand-600 hover:underline"
              >
                + Add your first medication
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {medications.map((med) => (
                <div
                  key={med.id}
                  onClick={() => onToggleMedication(med.id)}
                  className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition ${
                    med.takenToday
                      ? "bg-emerald-50/60 border-emerald-200 text-slate-700"
                      : "bg-white border-slate-200 hover:border-brand-300 hover:bg-slate-50/50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      className={`w-6 h-6 rounded-lg flex items-center justify-center transition ${
                        med.takenToday
                          ? "bg-emerald-500 text-white"
                          : "border-2 border-slate-300 hover:border-brand-500"
                      }`}
                    >
                      {med.takenToday && <CheckCircle2 className="w-4 h-4" />}
                    </button>
                    <div>
                      <p
                        className={`text-sm font-semibold ${
                          med.takenToday ? "line-through text-slate-500" : "text-slate-900"
                        }`}
                      >
                        {med.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {med.dosage} • {med.schedule}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`text-[11px] font-medium px-2 py-0.5 rounded-md ${
                      med.takenToday ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {med.takenToday ? "Taken" : "Scheduled"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Quick Feature Launchpad & Recent Log */}
        <div className="space-y-6">
          {/* Quick Actions Grid */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
            <h2 className="text-base font-bold text-slate-900 mb-1">Quick Clinical Helpers</h2>
            <p className="text-xs text-slate-500 mb-4">Fast access to preparation and AI features</p>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setActiveTab("summary")}
                className="p-3.5 rounded-xl border border-slate-200 hover:border-brand-300 hover:bg-brand-50/50 text-left transition group"
              >
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center mb-2 group-hover:scale-105 transition">
                  <Stethoscope className="w-4 h-4" />
                </div>
                <p className="text-sm font-bold text-slate-800">Doctor Summary</p>
                <p className="text-xs text-slate-500 mt-0.5">Generate visit report</p>
              </button>

              <button
                onClick={() => setActiveTab("symptoms")}
                className="p-3.5 rounded-xl border border-slate-200 hover:border-brand-300 hover:bg-brand-50/50 text-left transition group"
              >
                <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center mb-2 group-hover:scale-105 transition">
                  <HeartPulse className="w-4 h-4" />
                </div>
                <p className="text-sm font-bold text-slate-800">Symptom Guide</p>
                <p className="text-xs text-slate-500 mt-0.5">Explore care advice</p>
              </button>

              <button
                onClick={() => setActiveTab("explainer")}
                className="p-3.5 rounded-xl border border-slate-200 hover:border-brand-300 hover:bg-brand-50/50 text-left transition group"
              >
                <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center mb-2 group-hover:scale-105 transition">
                  <Activity className="w-4 h-4" />
                </div>
                <p className="text-sm font-bold text-slate-800">Lab Explainer</p>
                <p className="text-xs text-slate-500 mt-0.5">Understand test terms</p>
              </button>

              <button
                onClick={() => setActiveTab("assistant")}
                className="p-3.5 rounded-xl border border-slate-200 hover:border-brand-300 hover:bg-brand-50/50 text-left transition group"
              >
                <div className="w-8 h-8 rounded-lg bg-mint-50 text-mint-600 flex items-center justify-center mb-2 group-hover:scale-105 transition">
                  <Sparkles className="w-4 h-4" />
                </div>
                <p className="text-sm font-bold text-slate-800">Ask Gemini AI</p>
                <p className="text-xs text-slate-500 mt-0.5">Chat wellness guidance</p>
              </button>
            </div>
          </div>

          {/* Latest Check-in Snapshot */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-bold text-slate-900">Latest Recorded Check-In</h2>
              <button
                onClick={() => setActiveTab("checkin")}
                className="text-xs font-semibold text-brand-600 hover:text-brand-800"
              >
                View History &rarr;
              </button>
            </div>

            {latestCheckIn ? (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700">{latestCheckIn.dateFormatted}</span>
                  <span className="font-bold text-brand-700 bg-brand-100 px-2 py-0.5 rounded">
                    Score: {latestCheckIn.wellnessScore}/100
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-2 text-center pt-2 border-t border-slate-200/60">
                  <div>
                    <span className="text-[10px] uppercase text-slate-400 font-semibold block">Mood</span>
                    <span className="text-xs font-bold text-slate-800 capitalize">{latestCheckIn.mood}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-slate-400 font-semibold block">Energy</span>
                    <span className="text-xs font-bold text-slate-800">{latestCheckIn.energy}/10</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-slate-400 font-semibold block">Sleep</span>
                    <span className="text-xs font-bold text-slate-800">{latestCheckIn.sleepHours} hrs</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-slate-400 font-semibold block">Discomfort</span>
                    <span className="text-xs font-bold text-slate-800">{latestCheckIn.discomfortLevel}/10</span>
                  </div>
                </div>
                {latestCheckIn.notes && (
                  <p className="text-xs text-slate-600 italic pt-1 border-t border-slate-200/40">
                    &ldquo;{latestCheckIn.notes}&rdquo;
                  </p>
                )}
              </div>
            ) : (
              <div className="p-6 text-center text-xs text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                No check-ins yet. Take 30 seconds to log today&apos;s wellness!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
