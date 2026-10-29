"use client";

import React from "react";
import { HeartPulse, User, Sparkles, Menu, X } from "lucide-react";
import { UserProfile } from "@/lib/types";

interface NavbarProps {
  profile: UserProfile;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

export default function Navbar({
  profile,
  activeTab,
  setActiveTab,
  mobileMenuOpen,
  setMobileMenuOpen,
}: NavbarProps) {
  const todayFormatted = new Date().toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab("dashboard")}
            className="flex items-center gap-2.5 text-left group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-mint-500 flex items-center justify-center text-white shadow-sm shadow-brand-500/20 group-hover:scale-105 transition">
              <HeartPulse className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-lg text-slate-900 tracking-tight">CareBuddy</span>
                <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-brand-50 text-brand-700 border border-brand-200">
                  Health
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">Personal Wellness Companion</p>
            </div>
          </button>
        </div>

        {/* Center Date & Status Badge */}
        <div className="hidden md:flex items-center gap-3 text-xs text-slate-600 bg-slate-50 py-1.5 px-3 rounded-full border border-slate-200">
          <span className="font-medium text-slate-700">{todayFormatted}</span>
          <span className="w-1 h-1 rounded-full bg-slate-300" />
          <span className="flex items-center gap-1 text-mint-700 font-medium">
            <Sparkles className="w-3 h-3 text-mint-500" />
            Gemini AI Connected
          </span>
        </div>

        {/* Right Action & Profile Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab("profile")}
            className={`flex items-center gap-2 py-1.5 px-3 rounded-xl border text-sm font-medium transition ${
              activeTab === "profile"
                ? "bg-brand-50 border-brand-300 text-brand-800"
                : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
            }`}
          >
            <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
              <User className="w-3.5 h-3.5" />
            </div>
            <span className="hidden sm:inline">{profile.name || "My Profile"}</span>
            {profile.isDemoData && (
              <span className="text-[10px] bg-slate-200 text-slate-600 px-1 rounded font-normal hidden lg:inline">
                Demo
              </span>
            )}
          </button>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>
    </header>
  );
}
