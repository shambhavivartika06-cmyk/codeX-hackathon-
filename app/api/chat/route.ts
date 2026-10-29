import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  MEDICAL_SAFETY_SYSTEM_PROMPT,
  detectEmergencyKeywords,
  getLocalFallbackChatResponse,
  generateContentWithCascade,
} from "@/lib/gemini";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, profile } = body;

    if (!message || typeof message !== "string" || !message.trim()) {
      return NextResponse.json({ error: "A message string is required." }, { status: 400 });
    }

    const trimmedMessage = message.trim();
    const isEmergency = detectEmergencyKeywords(trimmedMessage);

    // If emergency warning is triggered, we return immediate safety advice
    if (isEmergency) {
      return NextResponse.json({
        text: `🚨 **IMPORTANT EMERGENCY ALERT**\n\nThe symptoms you described may be signs of a medical emergency.\n\nPlease **immediately call your local emergency service (such as 911 in the US/Canada, 999 in the UK, 112 in Europe, 102/108 in India)** or go to the nearest hospital emergency room.\n\nDo not wait to see if symptoms pass.`,
        isEmergencyWarning: true,
        isFallback: false,
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    // Graceful fallback when API key is missing
    if (!apiKey || apiKey.trim() === "" || apiKey === "your_gemini_api_key_here") {
      const fallback = getLocalFallbackChatResponse(trimmedMessage, profile);
      return NextResponse.json({
        text: fallback.responseText,
        isEmergencyWarning: fallback.isEmergency,
        isFallback: true,
      });
    }

    // Call Gemini API server-side with resilient cascade
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const userContext = profile
        ? `\nUser Profile Context: Age ${profile.age || "Unknown"}, Known Conditions: ${profile.conditions || "None listed"}, Allergies: ${profile.allergies || "None listed"}.\n`
        : "";

      const prompt = `${userContext}\nUser question/concern: ${trimmedMessage}`;

      const text = await generateContentWithCascade(
        genAI,
        prompt,
        MEDICAL_SAFETY_SYSTEM_PROMPT
      );

      return NextResponse.json({
        text,
        isEmergencyWarning: false,
        isFallback: false,
      });
    } catch (apiError: any) {
      console.warn("Gemini API cascade failed, falling back to local guidance:", apiError?.message || apiError);
      const fallback = getLocalFallbackChatResponse(trimmedMessage, profile);
      return NextResponse.json({
        text: `${fallback.responseText}\n\n*(Note: Gemini API returned a temporary service notice: ${apiError?.message || "Service busy"}. Showing reliable offline guidance.)*`,
        isEmergencyWarning: fallback.isEmergency,
        isFallback: true,
      });
    }
  } catch (err: any) {
    console.error("Error in /api/chat:", err);
    return NextResponse.json(
      {
        error: "Internal server error processing request.",
        details: err?.message,
      },
      { status: 500 }
    );
  }
}
