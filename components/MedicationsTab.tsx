"use client";

import React, { useState } from "react";
import {
  Pill,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  Clock,
  Info,
  X,
  RotateCcw,
} from "lucide-react";
import { Medication } from "@/lib/types";

interface MedicationsTabProps {
  medications: Medication[];
  onToggleMedication: (id: string) => void;
  onAddMedication: (med: Medication) => void;
  onUpdateMedication: (med: Medication) => void;
  onDeleteMedication: (id: string) => void;
  onResetMedsToday: () => void;
}

export default function MedicationsTab({
  medications,
  onToggleMedication,
  onAddMedication,
  onUpdateMedication,
  onDeleteMedication,
  onResetMedsToday,
}: MedicationsTabProps) {
  // Modal State for Add / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMed, setEditingMed] = useState<Medication | null>(null);

  // Form Fields
  const [name, setName] = useState("");
  const [dosage, setDosage] = useState("");
  const [schedule, setSchedule] = useState("Morning (8:00 AM)");
  const [notes, setNotes] = useState("");
  const [formError, setFormError] = useState("");

  const total = medications.length;
  const takenCount = medications.filter((m) => m.takenToday).length;
  const percent = total > 0 ? Math.round((takenCount / total) * 100) : 0;

  const openAddModal = () => {
    setEditingMed(null);
    setName("");
    setDosage("");
    setSchedule("Morning (8:00 AM)");
    setNotes("");
    setFormError("");
    setIsModalOpen(true);
  };

  const openEditModal = (med: Medication) => {
    setEditingMed(med);
    setName(med.name);
    setDosage(med.dosage);
    setSchedule(med.schedule);
    setNotes(med.notes || "");
    setFormError("");
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError("Medication name is required.");
      return;
    }
    if (!dosage.trim()) {
      setFormError("Dosage (e.g. 500mg, 1 tablet) is required.");
      return;
    }

    if (editingMed) {
      onUpdateMedication({
        ...editingMed,
        name: name.trim(),
        dosage: dosage.trim(),
        schedule: schedule.trim(),
        notes: notes.trim(),
      });
    } else {
      const newMed: Medication = {
        id: "med-" + Date.now(),
        name: name.trim(),
        dosage: dosage.trim(),
        schedule: schedule.trim(),
        notes: notes.trim(),
        takenToday: false,
      };
      onAddMedication(newMed);
    }

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Medication Tracker</h1>
          <p className="text-sm text-slate-500 mt-1">
            Track daily doses, timing, and progress. Stored securely in your browser session.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {total > 0 && (
            <button
              onClick={() => {
                if (confirm("Reset all medication checkmarks for today?")) {
                  onResetMedsToday();
                }
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
              title="Reset today's checks"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Checks
            </button>
          )}

          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold px-4 py-2 rounded-xl transition shadow-sm text-sm"
          >
            <Plus className="w-4 h-4" />
            Add Medication
          </button>
        </div>
      </div>

      {/* Progress Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-slate-800">Today&apos;s Dose Adherence</span>
            <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-mint-100 text-mint-800">
              {percent}% Completed
            </span>
          </div>
          <span className="text-xs font-semibold text-slate-500">
            {takenCount} of {total} doses marked taken
          </span>
        </div>

        <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
          <div
            className="bg-gradient-to-r from-mint-500 to-teal-500 h-3 rounded-full transition-all duration-500"
            style={{ width: `${percent}%` }}
          />
        </div>

        <div className="mt-4 flex items-start gap-2 text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
          <Info className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
          <span>
            <strong>Reminder note:</strong> CareBuddy is an in-browser tracking tool. It does not send SMS or push
            notifications to your device. Always follow the prescription instructions provided on your pharmacy label.
          </span>
        </div>
      </div>

      {/* Medication List */}
      <div className="space-y-3">
        {medications.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-slate-200">
            <Pill className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">No medications logged</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
              Add your daily prescriptions, vitamins, or supplements to organize your schedule and track adherence.
            </p>
            <button
              onClick={openAddModal}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-600 text-white rounded-xl text-xs font-semibold hover:bg-brand-700 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Medication
            </button>
          </div>
        ) : (
          medications.map((med) => (
            <div
              key={med.id}
              className={`bg-white rounded-2xl p-5 border transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm ${
                med.takenToday ? "border-emerald-200 bg-emerald-50/20" : "border-slate-200/80"
              }`}
            >
              <div className="flex items-center gap-4 flex-1">
                <button
                  type="button"
                  onClick={() => onToggleMedication(med.id)}
                  className={`w-8 h-8 rounded-xl flex items-center justify-center transition flex-shrink-0 ${
                    med.takenToday
                      ? "bg-emerald-500 text-white shadow-sm shadow-emerald-500/20"
                      : "border-2 border-slate-300 hover:border-brand-500 bg-white"
                  }`}
                  title={med.takenToday ? "Mark untaken" : "Mark as taken today"}
                >
                  {med.takenToday && <CheckCircle2 className="w-5 h-5" />}
                </button>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`font-bold text-base ${
                        med.takenToday ? "line-through text-slate-500" : "text-slate-900"
                      }`}
                    >
                      {med.name}
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-brand-50 text-brand-700 border border-brand-100">
                      {med.dosage}
                    </span>
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {med.schedule}
                    </span>
                  </div>
                  {med.notes && <p className="text-xs text-slate-500 italic">{med.notes}</p>}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 self-end sm:self-center">
                <button
                  onClick={() => openEditModal(med)}
                  className="p-2 text-slate-400 hover:text-brand-600 rounded-lg hover:bg-slate-100 transition"
                  title="Edit medication"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Remove "${med.name}" from your medication list?`)) {
                      onDeleteMedication(med.id);
                    }
                  }}
                  className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
                  title="Delete medication"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900">
                {editingMed ? "Edit Medication" : "Add New Medication"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <p className="text-xs text-rose-600 bg-rose-50 p-2.5 rounded-lg border border-rose-200 mb-3">
                {formError}
              </p>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Medication Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Amoxicillin, Vitamin D, Lisinopril"
                  className="w-full p-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Dosage / Strength *
                </label>
                <input
                  type="text"
                  value={dosage}
                  onChange={(e) => setDosage(e.target.value)}
                  placeholder="e.g. 500mg, 1 tablet, 10ml"
                  className="w-full p-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Schedule / Timing
                </label>
                <input
                  type="text"
                  value={schedule}
                  onChange={(e) => setSchedule(e.target.value)}
                  placeholder="e.g. Morning (8:00 AM), Twice daily after food"
                  className="w-full p-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Special Instructions / Notes (Optional)
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Take with a full glass of water, avoid dairy"
                  className="w-full p-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-brand-600 text-white hover:bg-brand-700 transition shadow-sm"
                >
                  {editingMed ? "Save Changes" : "Add Medication"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
