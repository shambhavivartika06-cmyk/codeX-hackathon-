import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { ExtractedDocumentData } from "@/lib/types";
import { GEMINI_MODEL_CASCADE } from "@/lib/gemini";

// Deterministic local fallbacks for sample documents
const SAMPLE_EXTRACTIONS: Record<string, ExtractedDocumentData> = {
  "sample-rx-1": {
    documentType: "prescription",
    facilityOrDoctor: "Dr. Marcus Vance, MD (Metro Health Clinic)",
    documentDate: "Oct 26, 2026",
    patientName: "Alex Rivera",
    medications: [
      {
        name: "Amoxicillin",
        dosage: "500 mg",
        frequency: "Three times daily (TID)",
        instructions: "Take 1 capsule 3x daily by mouth for 10 days with a full glass of water. Finish entire course.",
        confidence: "clear",
      },
      {
        name: "Atorvastatin",
        dosage: "20 mg",
        frequency: "Once daily at bedtime",
        instructions: "Take 1 tablet daily at bedtime. Refills: 3.",
        confidence: "clear",
      },
    ],
    warningsOrNotes: [
      "Confirm penicillin allergy tolerance prior to dispensing.",
      "Report immediate rash, wheezing, or facial swelling.",
    ],
    rawTextSummary: "Prescription issued by Dr. Marcus Vance for Alex Rivera containing Amoxicillin 500mg and Atorvastatin 20mg.",
    hasAmbiguities: false,
  },
  "sample-lab-1": {
    documentType: "lab_report",
    facilityOrDoctor: "Apex Diagnostic Laboratories (Medical Dir: Dr. H. Patel)",
    documentDate: "Oct 25, 2026",
    patientName: "Alex Rivera",
    labTests: [
      {
        testName: "Fasting Glucose",
        value: "94",
        unit: "mg/dL",
        referenceRange: "70 - 99",
        flag: "normal",
        confidence: "clear",
      },
      {
        testName: "Total Cholesterol",
        value: "218",
        unit: "mg/dL",
        referenceRange: "< 200",
        flag: "abnormal",
        confidence: "clear",
        confidenceNote: "Elevated above target range of 200 mg/dL.",
      },
      {
        testName: "LDL Cholesterol (Calc)",
        value: "138",
        unit: "mg/dL",
        referenceRange: "< 100",
        flag: "abnormal",
        confidence: "clear",
        confidenceNote: "Moderate elevation.",
      },
      {
        testName: "HDL Cholesterol",
        value: "52",
        unit: "mg/dL",
        referenceRange: "> 40",
        flag: "normal",
        confidence: "clear",
      },
      {
        testName: "TSH (Thyroid Stimulating Hormone)",
        value: "2.18",
        unit: "uIU/mL",
        referenceRange: "0.45 - 4.50",
        flag: "normal",
        confidence: "clear",
      },
      {
        testName: "Serum Ferritin",
        value: "78",
        unit: "ng/mL",
        referenceRange: "30 - 400",
        flag: "normal",
        confidence: "clear",
      },
    ],
    warningsOrNotes: [
      "Pathologist note: Mild hyperlipidemia indicated by elevated Total and LDL cholesterol.",
      "Thyroid and fasting glucose are within expected homeostatic baseline.",
    ],
    rawTextSummary: "Comprehensive Metabolic & Lipid Panel showing elevated Total (218) and LDL (138) cholesterol; normal glucose, TSH, and ferritin.",
    hasAmbiguities: false,
  },
  "sample-ambiguous-1": {
    documentType: "prescription",
    facilityOrDoctor: "Valley Community Care (Urgent Care)",
    documentDate: "Oct 27, 2026",
    patientName: "Alex Rivera",
    medications: [
      {
        name: "Ibuprofen",
        dosage: "600 mg",
        frequency: "Every 8 hours as needed",
        instructions: "Take 1 tablet every 8 hours as needed for back pain with food.",
        confidence: "clear",
      },
      {
        name: "Cyclobenzaprine",
        dosage: "[UNREADABLE - SMUDGED]",
        frequency: "At night",
        instructions: "Take [??] mg at night for muscle spasms.",
        confidence: "ambiguous",
        confidenceNote: "⚠️ Dosage strength is obscured by a liquid stain. DO NOT GUESS DOSAGE. Confirm with prescribing doctor or pharmacy.",
      },
    ],
    warningsOrNotes: [
      "Liquid damage/stain detected over Cyclobenzaprine dosage strength.",
      "Safety rule applied: Ambiguity flagged for user manual verification.",
    ],
    rawTextSummary: "Urgent care prescription with 1 legible medication (Ibuprofen 600mg) and 1 stained/ambiguous entry (Cyclobenzaprine).",
    hasAmbiguities: true,
  },
};

const EXTRACTION_SYSTEM_PROMPT = `You are CareBuddy's Clinical Document OCR and Entity Extraction engine.
Your mission is to extract visible clinical information from the user-uploaded image into structured, strict JSON.

CRITICAL MEDICAL INTEGRITY & ZERO-HALLUCINATION RULES:
1. ONLY extract information directly and unambiguously visible in the image.
2. If ANY field (dosage, frequency, reference interval, test name) is smudged, blurry, cropped, stained, or missing:
   - Mark confidence as "ambiguous" or "missing".
   - Include a clear confidenceNote explaining the ambiguity (e.g. "Partially cut off - verify with pharmacist").
   - NEVER invent or guess missing numbers or frequencies.
3. Classify documentType as: "prescription" | "lab_report" | "other".
4. For lab reports: flag results as "normal", "abnormal", or "unclear" based on the printed reference interval.
5. Return ONLY a valid JSON object matching this schema (no surrounding markdown or chat prose):
{
  "documentType": "prescription" | "lab_report" | "other",
  "facilityOrDoctor": "string",
  "documentDate": "string",
  "patientName": "string",
  "medications": [
    {
      "name": "string",
      "dosage": "string",
      "frequency": "string",
      "instructions": "string",
      "confidence": "clear" | "ambiguous" | "missing",
      "confidenceNote": "string"
    }
  ],
  "labTests": [
    {
      "testName": "string",
      "value": "string",
      "unit": "string",
      "referenceRange": "string",
      "flag": "normal" | "abnormal" | "unclear",
      "confidence": "clear" | "ambiguous" | "missing",
      "confidenceNote": "string"
    }
  ],
  "warningsOrNotes": ["string"],
  "rawTextSummary": "string",
  "hasAmbiguities": boolean
}`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { imageBase64, mimeType = "image/jpeg", sampleId } = body;

    // Check for sample ID quick-parse fallback
    if (sampleId && SAMPLE_EXTRACTIONS[sampleId]) {
      return NextResponse.json({
        data: SAMPLE_EXTRACTIONS[sampleId],
        isFallback: false,
        source: "sample_preset",
      });
    }

    if (!imageBase64 || typeof imageBase64 !== "string") {
      return NextResponse.json({ error: "No image payload provided." }, { status: 400 });
    }

    // Clean base64 header if present (e.g. "data:image/png;base64,....")
    const cleanBase64 = imageBase64.replace(/^data:[a-zA-Z0-9\/\+\-]+;base64,/, "");

    // Quick size validation (< 8MB)
    const approximateSizeInMb = (cleanBase64.length * 0.75) / (1024 * 1024);
    if (approximateSizeInMb > 8) {
      return NextResponse.json({ error: "Image file exceeds 8 MB size limit. Please upload a smaller image." }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    // If API key is missing, check if this matches a sample or provide intelligent local fallback
    if (!apiKey || apiKey.trim() === "" || apiKey === "your_gemini_api_key_here") {
      // Return safe structured fallback
      return NextResponse.json({
        data: {
          documentType: "prescription",
          facilityOrDoctor: "Local OCR Demo Mode",
          documentDate: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
          patientName: "Patient (Demo)",
          medications: [
            {
              name: "Prescription Item (Local Demo)",
              dosage: "500 mg",
              frequency: "Twice daily",
              instructions: "Add your GEMINI_API_KEY to .env.local to activate live multimodal vision extraction for arbitrary photos.",
              confidence: "clear",
            },
          ],
          warningsOrNotes: [
            "Local demo mode active. For live optical scanning of real camera photos, configure GEMINI_API_KEY in .env.local.",
          ],
          rawTextSummary: "Local preview extracted without live Gemini vision API.",
          hasAmbiguities: false,
        },
        isFallback: true,
        source: "offline_fallback",
      });
    }

    // Call Gemini API with vision multimodal input
    try {
      const genAI = new GoogleGenerativeAI(apiKey);

      let extractedJsonString: string | null = null;
      let lastError: any = null;

      // Try model cascade with vision support and fast 5.5s timeout
      for (const modelName of GEMINI_MODEL_CASCADE) {
        try {
          const model = genAI.getGenerativeModel({
            model: modelName,
            systemInstruction: EXTRACTION_SYSTEM_PROMPT,
          });

          const result = await Promise.race([
            model.generateContent([
              {
                text: "Extract all clinical text, prescriptions, or laboratory values from this image into strict JSON schema specified in system instructions. Emphasize zero-hallucination for any unclear portions.",
              },
              {
                inlineData: {
                  data: cleanBase64,
                  mimeType: mimeType.includes("png") ? "image/png" : mimeType.includes("webp") ? "image/webp" : "image/jpeg",
                },
              },
            ]),
            new Promise<never>((_, reject) =>
              setTimeout(() => reject(new Error(`Timeout after 5500ms on ${modelName}`)), 5500)
            ),
          ]);

          const response = await result.response;
          const text = response.text();
          if (text) {
            extractedJsonString = text;
            break;
          }
        } catch (mErr: any) {
          console.warn(`[Snap & Structure] Vision model ${modelName} error: ${mErr?.message || mErr}. Trying next...`);
          lastError = mErr;
        }
      }

      if (!extractedJsonString) {
        throw lastError || new Error("All vision models failed to return a response.");
      }

      // Parse JSON output from model (strip any markdown code fences)
      let cleaned = extractedJsonString.trim();
      if (cleaned.startsWith("```json")) {
        cleaned = cleaned.replace(/^```json/, "").replace(/```$/, "").trim();
      } else if (cleaned.startsWith("```")) {
        cleaned = cleaned.replace(/^```/, "").replace(/```$/, "").trim();
      }

      const parsedData: ExtractedDocumentData = JSON.parse(cleaned);

      return NextResponse.json({
        data: parsedData,
        isFallback: false,
        source: "gemini_multimodal_vision",
      });
    } catch (aiErr: any) {
      console.warn("Gemini vision extraction failed, returning structured fallback:", aiErr?.message || aiErr);

      // Return graceful fallback so user can still review and edit manually
      return NextResponse.json({
        data: {
          documentType: "prescription",
          facilityOrDoctor: "Self-Reported Medical Document",
          documentDate: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
          patientName: "Patient Record",
          medications: [
            {
              name: "Please enter medication name",
              dosage: "Verify dosage on bottle",
              frequency: "Verify frequency",
              instructions: "Please double-check your physical bottle or prescription label.",
              confidence: "ambiguous",
              confidenceNote: `AI vision service busy (${aiErr?.message || "Capacity"}). Please fill in the editable fields manually.`,
            },
          ],
          warningsOrNotes: [
            "Live AI extraction experienced a service notice. You can verify and edit the fields on the right manually.",
          ],
          rawTextSummary: "Manual entry mode activated following temporary AI service limit.",
          hasAmbiguities: true,
        },
        isFallback: true,
        source: "offline_fallback_after_error",
      });
    }
  } catch (err: any) {
    console.error("Error in /api/extract:", err);
    return NextResponse.json({ error: "Failed to process image.", details: err?.message }, { status: 500 });
  }
}
