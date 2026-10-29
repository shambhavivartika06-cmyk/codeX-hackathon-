"use client";

import React, { useState } from "react";
import { AlertCircle, PhoneCall, X } from "lucide-react";

export default function MedicalDisclaimerBanner() {
  const [dismissed, setDismissed] = useState(false);
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);

  if (dismissed) return null;

  return (
    <>
      <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2 text-xs md:text-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-1">
            <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span>
              <strong>CareBuddy Health Notice:</strong> This application is an educational wellness companion and does
              not provide medical diagnoses, treatment plans, or prescriptions. In a medical emergency, call 911 (US),
              999 (UK), 112 (EU), or your local emergency line.
            </span>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => setShowEmergencyModal(true)}
              className="inline-flex items-center gap-1 font-medium text-amber-800 hover:text-amber-950 underline text-xs"
            >
              <PhoneCall className="w-3 h-3" />
              Emergency Lines
            </button>
            <button
              onClick={() => setDismissed(true)}
              className="text-amber-600 hover:text-amber-900 p-0.5 rounded"
              title="Dismiss notice"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {showEmergencyModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-red-600">
                <AlertCircle className="w-6 h-6" />
                <h3 className="text-lg font-bold">Emergency Hotlines</h3>
              </div>
              <button
                onClick={() => setShowEmergencyModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-slate-600 mb-4">
              If you or someone around you is experiencing chest pain, difficulty breathing, sudden severe bleeding, or
              loss of consciousness, please contact emergency dispatch immediately:
            </p>
            <div className="space-y-2 mb-6">
              <div className="flex items-center justify-between p-3 rounded-lg bg-red-50 border border-red-100">
                <span className="font-semibold text-slate-800">United States & Canada</span>
                <span className="font-mono font-bold text-red-600 text-lg">911</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-red-50 border border-red-100">
                <span className="font-semibold text-slate-800">United Kingdom</span>
                <span className="font-mono font-bold text-red-600 text-lg">999 / 111</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-red-50 border border-red-100">
                <span className="font-semibold text-slate-800">European Union</span>
                <span className="font-mono font-bold text-red-600 text-lg">112</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-red-50 border border-red-100">
                <span className="font-semibold text-slate-800">India</span>
                <span className="font-mono font-bold text-red-600 text-lg">112 / 102</span>
              </div>
            </div>
            <button
              onClick={() => setShowEmergencyModal(false)}
              className="w-full py-2.5 px-4 bg-slate-900 text-white rounded-xl text-sm font-medium hover:bg-slate-800 transition"
            >
              Return to CareBuddy
            </button>
          </div>
        </div>
      )}
    </>
  );
}
