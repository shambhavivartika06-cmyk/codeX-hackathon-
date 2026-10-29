import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { UserProfile, WellnessCheckIn, Medication } from "@/lib/types";
import { generateContentWithCascade } from "@/lib/gemini";

interface SummarizePayload {
  profile: UserProfile;
  checkIns: WellnessCheckIn[];
  medications: Medication[];
  selectedSymptoms?: string[];
  userNotes?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body: SummarizePayload = await req.json();
    const { profile, checkIns, medications, selectedSymptoms = [], userNotes = "" } = body;

    const apiKey = process.env.GEMINI_API_KEY;

    // Build offline structured summary as high-quality fallback or base
    const recentCheckIns = checkIns.slice(0, 7);
    const avgScore = recentCheckIns.length
      ? Math.round(recentCheckIns.reduce((acc, c) => acc + c.wellnessScore, 0) / recentCheckIns.length)
      : 80;

    const medAdherence = medications.length
      ? `${medications.filter((m) => m.takenToday).length} of ${medications.length} taken today`
      : "No active medications recorded";

    const localStructuredSummary = `📋 **CAREBUDDY PATIENT PREPARATION BRIEF**
Generated on: ${new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "short", day: "numeric" })}

---
**1. PATIENT DEMOGRAPHICS & SAFETY PROFILE**
• Patient: ${profile.name || "Patient"} (Age: ${profile.age || "Not specified"})
• Blood Group: ${profile.bloodGroup || "Unknown"}
• Known Allergies: ${profile.allergies || "None noted"}
• Underlying Conditions: ${profile.conditions || "None listed"}
• Emergency Contact: ${profile.emergencyContactName || "Not provided"} (${profile.emergencyContactPhone || ""})

**2. RECENT SYMPTOMS & CHIEF CONCERNS**
• Active Symptoms Recorded: ${selectedSymptoms.length > 0 ? selectedSymptoms.join(", ") : "None reported today"}
• Patient's Own Words / Notes: ${userNotes ? `"${userNotes}"` : "No extra notes entered"}

**3. RECENT WELLNESS & LIFESTYLE LOGS (Last ${recentCheckIns.length} recorded days)**
• Average Wellness Index: ${avgScore}/100
• Recent Check-in Details:
${recentCheckIns.map((c) => `  - [${c.dateFormatted}] Mood: ${c.mood.toUpperCase()} | Energy: ${c.energy}/10 | Sleep: ${c.sleepHours}h | Discomfort: ${c.discomfortLevel}/10${c.notes ? ` ("${c.notes}")` : ""}`).join("\n")}

**4. CURRENT MEDICATION REGIMEN**
${medications.map((m) => `• ${m.name} (${m.dosage}) - Schedule: ${m.schedule}${m.notes ? ` [Notes: ${m.notes}]` : ""}`).join("\n")}
• Today's Adherence: ${medAdherence}

**5. SUGGESTED QUESTIONS FOR THE PHYSICIAN**
1. "Given my recent symptoms (${selectedSymptoms.join(", ") || "fatigue/discomfort"}), what diagnostic tests or adjustments do you recommend?"
2. "Are there any side effects or food interactions I should watch for with my current medication list?"
3. "At what point should I schedule a follow-up or seek urgent evaluation?"

---
*Notice: This summary is a self-reported lifestyle log prepared by the patient using CareBuddy to facilitate doctor-patient dialogue. It is not an official medical record or clinical diagnosis.*`;

    // If Gemini key is missing, return reliable structured summary
    if (!apiKey || apiKey.trim() === "" || apiKey === "your_gemini_api_key_here") {
      return NextResponse.json({
        summary: localStructuredSummary,
        isFallback: true,
      });
    }

    try {
      const genAI = new GoogleGenerativeAI(apiKey);

      const prompt = `You are a clinical documentation assistant helping a patient organize their personal health records into a clean, concise, 1-page "Doctor Visit Summary" for their upcoming physician appointment.

Patient Context:
- Name: ${profile.name}, Age: ${profile.age}, Blood Group: ${profile.bloodGroup}
- Allergies: ${profile.allergies}
- Pre-existing conditions: ${profile.conditions}
- Active Symptoms selected: ${selectedSymptoms.join(", ") || "None"}
- Additional Patient Notes: ${userNotes || "None"}
- Medication list: ${medications.map((m) => `${m.name} ${m.dosage} (${m.schedule})`).join("; ")}
- Recent Check-In logs: ${recentCheckIns.map((c) => `${c.dateFormatted}: Mood ${c.mood}, Energy ${c.energy}/10, Sleep ${c.sleepHours}h, Discomfort ${c.discomfortLevel}/10`).join(" | ")}

Please generate a professional, easy-to-read Doctor Visit Brief formatted in Markdown with:
1. Patient Demographics & Critical Allergies
2. Chief Complaints & Recent Symptoms
3. Lifestyle & Vitals Summary (Sleep, Energy, Discomfort trends)
4. Current Medication List
5. 3 Specific, High-Value Questions for the Physician
Conclude with a clear disclaimer that this is a patient self-reported summary.`;

      const summary = await generateContentWithCascade(genAI, prompt);
      return NextResponse.json({
        summary,
        isFallback: false,
      });
    } catch (apiError) {
      console.warn("Gemini summarization failed, returning local structured summary:", apiError);
      return NextResponse.json({
        summary: localStructuredSummary,
        isFallback: true,
      });
    }
  } catch (err: any) {
    console.error("Error in /api/summarize:", err);
    return NextResponse.json({ error: "Failed to generate summary.", details: err?.message }, { status: 500 });
  }
}
