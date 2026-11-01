/**
 * app/api/triage/route.ts
 * POST handler — runs red-flag check first, then calls Gemini for non-emergencies.
 */

import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { generateContentWithCascade } from "@/lib/gemini";
import { checkRedFlags } from "@/lib/redFlags";
import { TriageRequest, TriageResult } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    // ── 1. Parse the incoming request body ─────────────────────────────────
    const body: TriageRequest = await req.json();
    const { area, symptoms, pain, duration, record } = body;

    if (!area || !symptoms) {
      return NextResponse.json(
        { error: "area and symptoms are required." },
        { status: 400 }
      );
    }

    // ── 2. Run red-flag rules BEFORE touching Gemini ────────────────────────
    const redFlag = checkRedFlags(area, symptoms, pain);

    if (redFlag.emergency) {
      // Return immediately — do NOT call Gemini for emergencies
      const result: TriageResult = {
        emergency: true,
        emergencyReason: redFlag.reason,
        possibleCauses: [],
        urgency: "now",
        immediateSteps: [
          "Call 911 / 999 / 112 or your local emergency number immediately.",
          "Do not drive yourself — ask someone to drive you or wait for an ambulance.",
          "Stay as calm and still as possible until help arrives.",
        ],
        doctorType: "Emergency Room",
        confidence: "high",
        personalNote:
          "This is an emergency. Skip self-care steps and seek help right now.",
        followUpQuestion:
          "What is the fastest way to reach emergency services from my location?",
      };
      return NextResponse.json({ result });
    }

    // ── 3. Non-emergency — call Gemini ──────────────────────────────────────
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey || apiKey.trim() === "" || apiKey === "your_gemini_api_key_here") {
      // No API key — return a clear offline message instead of crashing
      return NextResponse.json(
        {
          error:
            "AI triage is not available in offline mode. Please add GEMINI_API_KEY to .env.local to enable this feature.",
          isFallback: true,
        },
        { status: 503 }
      );
    }

    // Build a context string from the patient's record for personalNote
    const allergyText =
      record.allergies.length > 0
        ? `Known allergies: ${record.allergies.join(", ")}.`
        : "No known allergies on record.";

    const medText =
      record.medications.length > 0
        ? `Current medications: ${record.medications.join(", ")}.`
        : "No medications on record.";

    // ── 4. Build the prompt ─────────────────────────────────────────────────
    const prompt = `You are a careful, compassionate triage assistant. A patient has reported the following:

Body area: ${area}
Symptoms: ${symptoms}
Pain level: ${pain} out of 10
Duration: ${duration}
Patient context — ${allergyText} ${medText}

Respond ONLY with a valid JSON object matching this exact shape (no markdown, no code fences, no extra text):
{
  "emergency": false,
  "possibleCauses": ["...", "..."],
  "urgency": "home" | "soon" | "now",
  "immediateSteps": ["...", "..."],
  "doctorType": "...",
  "confidence": "low" | "medium" | "high",
  "personalNote": "...",
  "followUpQuestion": "..."
}

Rules you MUST follow:
- Never use the word "diagnosis". Use "possible causes" instead.
- Never say "safe to take". Use "may conflict" or "please ask your doctor or pharmacist".
- In personalNote, mention allergies and medications from the patient context only if relevant (e.g. a medication may conflict with treatment options). Use "may conflict" language.
- If symptoms are vague or unclear, set confidence to "low" and advise seeing a doctor.
- urgency: "home" = manage at home with self-care; "soon" = see a doctor within 1-3 days; "now" = go to urgent care or ER today.
- Keep immediateSteps practical and specific (not generic).
- followUpQuestion must be one concrete question the patient should ask their doctor.
- This guidance is for general educational purposes only, not a medical diagnosis.`;

    // ── 5. Call Gemini with cascade/fallback ────────────────────────────────
    let rawText: string;
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      rawText = await generateContentWithCascade(genAI, prompt);
    } catch (aiError: any) {
      console.error("[Triage] Gemini call failed:", aiError);
      return NextResponse.json(
        {
          error: `AI service unavailable: ${aiError?.message || "Unknown error"}. Please try again in a moment.`,
        },
        { status: 500 }
      );
    }

    // ── 6. Strip code fences then parse JSON ────────────────────────────────
    // Gemini sometimes wraps its response in ```json ... ``` even when asked not to
    const cleaned = rawText
      .replace(/^```(?:json)?\s*/i, "") // strip opening fence
      .replace(/```\s*$/i, "")          // strip closing fence
      .trim();

    let result: TriageResult;
    try {
      result = JSON.parse(cleaned);
    } catch (parseError: any) {
      console.error("[Triage] JSON parse failed. Raw output:", rawText);
      return NextResponse.json(
        {
          error:
            "The AI returned an unexpected format. Please try again. If this persists, check your Gemini API key.",
          details: parseError?.message,
        },
        { status: 500 }
      );
    }

    // ── 7. Always mark emergency false here (red flags handled above) ────────
    result.emergency = false;

    return NextResponse.json({ result });
  } catch (err: any) {
    console.error("[Triage] Unexpected error:", err);
    return NextResponse.json(
      { error: "Triage request failed.", details: err?.message },
      { status: 500 }
    );
  }
}
