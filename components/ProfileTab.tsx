"use client";

import React, { useState } from "react";
import {
  UserCheck,
  Save,
  RotateCcw,
  AlertTriangle,
  CheckCircle,
  ShieldCheck,
  Heart,
  Phone,
} from "lucide-react";
import { UserProfile } from "@/lib/types";
import { DEMO_PROFILE } from "@/data/mockData";

interface ProfileTabProps {
  profile: UserProfile;
  onSaveProfile: (profile: UserProfile) => void;
  onResetAllData: () => void;
}

const BLOOD_GROUPS = ["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-", "Unknown"];

export default function ProfileTab({
  profile,
  onSaveProfile,
  onResetAllData,
}: ProfileTabProps) {
  const [formData, setFormData] = useState<UserProfile>(profile);
  const [showSavedToast, setShowSavedToast] = useState(false);

  const handleChange = (field: keyof UserProfile, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value, isDemoData: false }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile(formData);
    setShowSavedToast(true);
    setTimeout(() => setShowSavedToast(false), 3000);
  };

  const handleLoadDemo = () => {
    setFormData(DEMO_PROFILE);
    onSaveProfile(DEMO_PROFILE);
    setShowSavedToast(true);
    setTimeout(() => setShowSavedToast(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-brand-600" />
            Health Profile & Safety Baseline
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Stored locally in your browser to personalize AI advice and assist doctor visit preparation.
          </p>
        </div>

        {formData.isDemoData && (
          <span className="self-start sm:self-auto text-xs px-2.5 py-1 rounded-full font-bold bg-amber-100 text-amber-800 border border-amber-200">
            Demo Sample Data Loaded
          </span>
        )}
      </div>

      {showSavedToast && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>Profile saved securely to your browser localStorage!</span>
        </div>
      )}

      {/* Main Profile Form */}
      <div className="bg-white rounded-2xl p-6 md:p-8 border border-slate-200/80 shadow-sm">
        <form onSubmit={handleSave} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Full Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                required
                placeholder="e.g. Alex Rivera"
                className="w-full p-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Age
              </label>
              <input
                type="number"
                value={formData.age}
                onChange={(e) => handleChange("age", e.target.value)}
                placeholder="e.g. 34"
                className="w-full p-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Blood Group
              </label>
              <select
                value={formData.bloodGroup}
                onChange={(e) => handleChange("bloodGroup", e.target.value)}
                className="w-full p-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 bg-white"
              >
                {BLOOD_GROUPS.map((bg) => (
                  <option key={bg} value={bg}>
                    {bg}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Known Drug / Food Allergies
              </label>
              <input
                type="text"
                value={formData.allergies}
                onChange={(e) => handleChange("allergies", e.target.value)}
                placeholder="e.g. Penicillin, Peanuts, Sulfa drugs"
                className="w-full p-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Existing Chronic Conditions
            </label>
            <input
              type="text"
              value={formData.conditions}
              onChange={(e) => handleChange("conditions", e.target.value)}
              placeholder="e.g. Mild asthma, Hypertension, Migraines, Type 2 Diabetes"
              className="w-full p-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>

          <div className="border-t border-slate-100 pt-4">
            <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-3">
              Emergency Contact Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Contact Name & Relation
                </label>
                <input
                  type="text"
                  value={formData.emergencyContactName}
                  onChange={(e) => handleChange("emergencyContactName", e.target.value)}
                  placeholder="e.g. Sarah Rivera (Spouse)"
                  className="w-full p-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Emergency Phone Number
                </label>
                <input
                  type="text"
                  value={formData.emergencyContactPhone}
                  onChange={(e) => handleChange("emergencyContactPhone", e.target.value)}
                  placeholder="e.g. +1 (555) 234-5678"
                  className="w-full p-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                />
              </div>
            </div>
          </div>

          <div className="pt-3 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleLoadDemo}
                className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 transition"
              >
                Load Sample Demo Profile
              </button>

              <button
                type="button"
                onClick={() => {
                  if (confirm("Reset ALL data (profile, check-ins, medications) back to initial demo state?")) {
                    onResetAllData();
                  }
                }}
                className="text-xs font-semibold text-rose-600 hover:text-rose-800 px-3 py-2 rounded-xl border border-rose-100 hover:bg-rose-50 transition"
              >
                Reset All Data
              </button>
            </div>

            <button
              type="submit"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold px-6 py-2.5 rounded-xl transition shadow-sm text-sm"
            >
              <Save className="w-4 h-4" />
              Save Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
