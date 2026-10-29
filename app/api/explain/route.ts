import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { generateContentWithCascade } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  try {
    const { term } = await req.json();

    if (!term || typeof term !== "string" || !term.trim()) {
      return NextResponse.json({ error: "Please provide a medical term or lab test name." }, { status: 400 });
    }

    const trimmed = term.trim();
    const apiKey = process.env.GEMINI_API_KEY;

    // Local smart fallback dictionary for common terms
    const localDictionary: Record<string, { definition: string; normalContext: string; questions: string[] }> = {
      hemoglobin: {
        definition: "A protein in red blood cells that transports oxygen throughout your entire body.",
        normalContext: "Commonly tested in a Complete Blood Count (CBC) to screen for anemia or fatigue causes.",
        questions: ["Is my hemoglobin level within normal range for my age and gender?", "Do I need dietary changes or an iron supplement?"],
      },
      cbc: {
        definition: "Complete Blood Count: A foundational routine blood test checking red cells, white cells, and platelets.",
        normalContext: "Helps physicians evaluate overall vitality, infection resistance, and blood clotting ability.",
        questions: ["Did any of the differential white blood cell counts stand out?", "When should we re-test?"],
      },
      tsh: {
        definition: "Thyroid-Stimulating Hormone: A hormone produced by the brain telling your thyroid how much hormone to create.",
        normalContext: "Elevated TSH often suggests sluggish thyroid (hypothyroidism); low TSH suggests overactive thyroid.",
        questions: ["Does this TSH value correlate with my current fatigue/energy levels?", "Should we test free T3 and T4?"],
      },
      lipid: {
        definition: "Lipid Panel: Measures fats in the bloodstream including HDL ('good'), LDL ('bad'), and Triglycerides.",
        normalContext: "Evaluates cardiovascular health and informs lifestyle or nutritional counseling.",
        questions: ["What is my overall cardiovascular risk score?", "What dietary adjustments can optimize my LDL/HDL ratio?"],
      },
    };

    const termKey = Object.keys(localDictionary).find((k) => trimmed.toLowerCase().includes(k));

    if (!apiKey || apiKey.trim() === "" || apiKey === "your_gemini_api_key_here") {
      if (termKey) {
        const item = localDictionary[termKey];
        return NextResponse.json({
          explanation: `**[Local Knowledge Mode - Offline Demo]**\n\n### 📖 Plain-Language Explanation of "${trimmed}"\n\n**What it means:**\n${item.definition}\n\n**Clinical Context:**\n${item.normalContext}\n\n**Suggested Questions to Ask Your Doctor:**\n${item.questions.map((q) => `• ${q}`).join("\n")}\n\n*(Note: Add your \`GEMINI_API_KEY\` to \`.env.local\` to explain any arbitrary medical text or custom lab panel.)*\n\n*Important Reminder: Laboratory reference ranges vary between individual testing facilities. Only your doctor can interpret lab results in the context of your overall medical history.*`,
          isFallback: true,
        });
      }

      return NextResponse.json({
        explanation: `**[Local Knowledge Mode - Offline Demo]**\n\n### 📖 Explanation for "${trimmed}"\n\nIn medical terminology, **"${trimmed}"** represents a diagnostic marker, anatomical structure, or clinical parameter. \n\n**General Advice on Reading Medical Terms:**\n• **Prefixes and Suffixes**: For example, "-itis" means inflammation, "hypo-" means lower than usual, "hyper-" means higher than usual.\n• **Reference Ranges**: Lab reports typically list standard target intervals right next to your result.\n\n**Recommended questions for your doctor:**\n1. "How does this specific value relate to the symptoms I've been experiencing?"\n2. "Does this reading represent a temporary fluctuation or a sustained trend?"\n\n*Important Reminder: Always have your ordering physician review your full laboratory report. Offline demo mode explains select common terms; activate \`GEMINI_API_KEY\` in \`.env.local\` for personalized AI explanations of any term.*`,
        isFallback: true,
      });
    }

    try {
      const genAI = new GoogleGenerativeAI(apiKey);

      const prompt = `You are a patient-centered medical educator. A patient is asking to understand the following medical term or lab test result:
"${trimmed}"

Explain it clearly in 5th to 6th grade plain English:
1. What this test or term means in everyday language (analogy if helpful).
2. Why a doctor typically orders or measures it.
3. 2 thoughtful questions the patient can ask their doctor about it.

CRITICAL: Emphasize that lab ranges vary by laboratory and individual clinical history, and results should always be interpreted directly with their healthcare provider.`;

      const explanation = await generateContentWithCascade(genAI, prompt);

      return NextResponse.json({
        explanation,
        isFallback: false,
      });
    } catch (apiError: any) {
      console.warn("Gemini explainer call failed:", apiError);
      return NextResponse.json({
        explanation: `**[Offline Fallback Mode]**\n\nCould not connect to Gemini AI (${apiError?.message || "Service unavailable"}).\n\nFor **"${trimmed}"**, please bring your printed report to your consultation and ask:\n1. "Is this result within the expected baseline for my health profile?"\n2. "Are follow-up tests or lifestyle modifications suggested?"\n\n*Clinical Notice: Laboratory values require physician interpretation.*`,
        isFallback: true,
      });
    }
  } catch (err: any) {
    console.error("Error in /api/explain:", err);
    return NextResponse.json({ error: "Failed to explain term.", details: err?.message }, { status: 500 });
  }
}
