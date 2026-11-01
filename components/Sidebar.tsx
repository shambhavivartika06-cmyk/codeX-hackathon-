"use client";

import React from "react";
import {
  LayoutDashboard,
  CalendarCheck,
  Pill,
  BotMessageSquare,
  Stethoscope,
  FileText,
  BookOpenCheck,
  UserCheck,
  ScanText,
} from "lucide-react";

export interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

export const NAV_ITEMS: NavItem[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "snap", label: "Snap & Structure", icon: ScanText, badge: "AI OCR" },
  { id: "checkin", label: "Daily Check-in", icon: CalendarCheck },
  { id: "medications", label: "Medications", icon: Pill },
  { id: "assistant", label: "AI Assistant", icon: BotMessageSquare, badge: "Gemini" },
  // { id: "symptoms", label: "Symptom Explorer", icon: Stethoscope },
  { id: "summary", label: "Doctor Summary", icon: FileText },
  { id: "explainer", label: "Medical Explainer", icon: BookOpenCheck },
  { id: "profile", label: "Health Profile", icon: UserCheck },
];

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  todayMedsPending: number;
}

export default function Sidebar({
  activeTab,
  setActiveTab,
  mobileMenuOpen,
  setMobileMenuOpen,
  todayMedsPending,
}: SidebarProps) {
  const handleSelect = (id: string) => {
    setActiveTab(id);
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-slate-200 bg-white p-4 space-y-1 min-h-[calc(100vh-4rem)]">
        <div className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          Navigation
        </div>
        <nav className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelect(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition ${
                  isActive
                    ? "bg-brand-50 text-brand-700 shadow-sm border border-brand-200/60 font-semibold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 ${isActive ? "text-brand-600" : "text-slate-400"}`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.id === "medications" && todayMedsPending > 0 && (
                  <span className="text-[11px] px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-semibold">
                    {todayMedsPending} due
                  </span>
                )}
                {item.badge && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-sky-100 text-brand-800 font-medium">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="mt-auto pt-6 border-t border-slate-100">
        </div>
      </aside>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden bg-slate-900/50 backdrop-blur-sm flex">
          <div className="w-72 bg-white h-full p-4 flex flex-col space-y-1 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="font-bold text-slate-800">Menu</span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>
            <nav className="space-y-1 pt-3 flex-1 overflow-y-auto">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelect(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition ${
                      isActive
                        ? "bg-brand-50 text-brand-700 font-semibold"
                        : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${isActive ? "text-brand-600" : "text-slate-400"}`} />
                      <span>{item.label}</span>
                    </div>
                    {item.id === "medications" && todayMedsPending > 0 && (
                      <span className="text-[11px] px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-semibold">
                        {todayMedsPending} due
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
          <div className="flex-1" onClick={() => setMobileMenuOpen(false)} />
        </div>
      )}
    </>
  );
}
