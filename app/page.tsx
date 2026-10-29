"use client";

import React, { useState, useEffect } from "react";
import MedicalDisclaimerBanner from "@/components/MedicalDisclaimerBanner";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import DashboardTab from "@/components/DashboardTab";
import CheckInTab from "@/components/CheckInTab";
import MedicationsTab from "@/components/MedicationsTab";
import AssistantTab from "@/components/AssistantTab";
import SymptomExplorerTab from "@/components/SymptomExplorerTab";
import DoctorSummaryTab from "@/components/DoctorSummaryTab";
import ExplainerTab from "@/components/ExplainerTab";
import ProfileTab from "@/components/ProfileTab";
import { UserProfile, WellnessCheckIn, Medication } from "@/lib/types";
import { DEMO_PROFILE, INITIAL_MEDICATIONS, INITIAL_CHECKINS } from "@/data/mockData";
import {
  getSavedProfile,
  saveProfile,
  getSavedMedications,
  saveMedications,
  getSavedCheckIns,
  addCheckIn,
  deleteCheckIn,
  resetAllToDemo,
} from "@/lib/storage";

export default function Home() {
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [isHydrated, setIsHydrated] = useState<boolean>(false);

  // Application Data States
  const [profile, setProfile] = useState<UserProfile>(DEMO_PROFILE);
  const [medications, setMedications] = useState<Medication[]>(INITIAL_MEDICATIONS);
  const [checkIns, setCheckIns] = useState<WellnessCheckIn[]>(INITIAL_CHECKINS);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);

  // Hydrate from localStorage once mounted in browser
  useEffect(() => {
    setProfile(getSavedProfile());
    setMedications(getSavedMedications());
    setCheckIns(getSavedCheckIns());
    setIsHydrated(true);
  }, []);

  // Medication Handlers
  const handleToggleMedication = (id: string) => {
    const today = new Date().toISOString().split("T")[0];
    const updated = medications.map((med) => {
      if (med.id === id) {
        const nextState = !med.takenToday;
        return {
          ...med,
          takenToday: nextState,
          lastMarkedDate: nextState ? today : "",
        };
      }
      return med;
    });
    setMedications(updated);
    saveMedications(updated);
  };

  const handleAddMedication = (newMed: Medication) => {
    const updated = [newMed, ...medications];
    setMedications(updated);
    saveMedications(updated);
  };

  const handleUpdateMedication = (updatedMed: Medication) => {
    const updated = medications.map((m) => (m.id === updatedMed.id ? updatedMed : m));
    setMedications(updated);
    saveMedications(updated);
  };

  const handleDeleteMedication = (id: string) => {
    const updated = medications.filter((m) => m.id !== id);
    setMedications(updated);
    saveMedications(updated);
  };

  const handleResetMedsToday = () => {
    const updated = medications.map((m) => ({ ...m, takenToday: false, lastMarkedDate: "" }));
    setMedications(updated);
    saveMedications(updated);
  };

  // Check-In Handlers
  const handleSaveCheckIn = (entry: WellnessCheckIn) => {
    const updated = addCheckIn(entry);
    setCheckIns(updated);
  };

  const handleDeleteCheckIn = (id: string) => {
    const updated = deleteCheckIn(id);
    setCheckIns(updated);
  };

  // Profile Handlers
  const handleSaveProfile = (newProfile: UserProfile) => {
    setProfile(newProfile);
    saveProfile(newProfile);
  };

  const handleResetAllData = () => {
    resetAllToDemo();
    setProfile(DEMO_PROFILE);
    setMedications(INITIAL_MEDICATIONS);
    setCheckIns(INITIAL_CHECKINS);
    setSelectedSymptoms([]);
    setActiveTab("dashboard");
  };

  // Symptom Handler for Doctor Summary
  const handleSelectSymptomForSummary = (symptomString: string) => {
    if (!selectedSymptoms.includes(symptomString)) {
      setSelectedSymptoms((prev) => [...prev, symptomString]);
    }
  };

  const handleRemoveSymptom = (symptomString: string) => {
    setSelectedSymptoms((prev) => prev.filter((s) => s !== symptomString));
  };

  const handleAddCustomSymptom = (symptomString: string) => {
    if (!selectedSymptoms.includes(symptomString)) {
      setSelectedSymptoms((prev) => [...prev, symptomString]);
    }
  };

  const todayMedsPending = medications.filter((m) => !m.takenToday).length;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
      {/* 1. Medical Safety Disclaimer Banner */}
      <MedicalDisclaimerBanner />

      {/* 2. Top Header Navigation */}
      <Navbar
        profile={profile}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />

      {/* 3. Main Workspace with Sidebar & Tab View */}
      <div className="flex-1 max-w-7xl w-full mx-auto flex">
        {/* Navigation Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
          todayMedsPending={todayMedsPending}
        />

        {/* Dynamic Main Content Tab */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {!isHydrated ? (
            <div className="h-64 flex items-center justify-center text-slate-400 text-sm">
              Loading CareBuddy workspace...
            </div>
          ) : (
            <>
              {activeTab === "dashboard" && (
                <DashboardTab
                  profile={profile}
                  checkIns={checkIns}
                  medications={medications}
                  setActiveTab={setActiveTab}
                  onToggleMedication={handleToggleMedication}
                />
              )}

              {activeTab === "checkin" && (
                <CheckInTab
                  checkIns={checkIns}
                  onSaveCheckIn={handleSaveCheckIn}
                  onDeleteCheckIn={handleDeleteCheckIn}
                />
              )}

              {activeTab === "medications" && (
                <MedicationsTab
                  medications={medications}
                  onToggleMedication={handleToggleMedication}
                  onAddMedication={handleAddMedication}
                  onUpdateMedication={handleUpdateMedication}
                  onDeleteMedication={handleDeleteMedication}
                  onResetMedsToday={handleResetMedsToday}
                />
              )}

              {activeTab === "assistant" && <AssistantTab profile={profile} />}

              {activeTab === "symptoms" && (
                <SymptomExplorerTab
                  onSelectSymptomForSummary={handleSelectSymptomForSummary}
                  setActiveTab={setActiveTab}
                />
              )}

              {activeTab === "summary" && (
                <DoctorSummaryTab
                  profile={profile}
                  checkIns={checkIns}
                  medications={medications}
                  selectedSymptoms={selectedSymptoms}
                  onRemoveSymptom={handleRemoveSymptom}
                  onAddCustomSymptom={handleAddCustomSymptom}
                />
              )}

              {activeTab === "explainer" && <ExplainerTab />}

              {activeTab === "profile" && (
                <ProfileTab
                  profile={profile}
                  onSaveProfile={handleSaveProfile}
                  onResetAllData={handleResetAllData}
                />
              )}
            </>
          )}
        </main>
      </div>

      {/* 4. Accessible & Ethical Healthcare Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 px-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© 2026 CareBuddy Health. Built as a resilient AI-assisted healthcare starter template.</p>
          <p className="text-slate-400">
            For medical emergencies, immediately contact local emergency services (911 / 999 / 112).
          </p>
        </div>
      </footer>
    </div>
  );
}
