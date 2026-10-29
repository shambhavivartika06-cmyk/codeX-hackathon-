import { GoogleGenerativeAI } from "@google/generative-ai";
import { UserProfile, ChatMessage } from "./types";

export const MEDICAL_SAFETY_SYSTEM_PROMPT = `You are CareBuddy, a warm, knowledgeable, and supportive personal health and wellness assistant.

CRITICAL MEDICAL SAFETY RULES:
1. You are NOT a licensed doctor, nurse, or medical provider. You do NOT diagnose conditions, interpret official medical scans, prescribe medications, or alter prescription dosages.
2. EMERGENCY PROTOCOL: If the user describes any emergency warning signs—such as severe chest pain/pressure, sudden severe shortness of breath, sudden one-sided facial drooping, weakness or numbness, slurred speech, sudden loss of vision, uncontrollable bleeding, suicidal thoughts, or sudden 'worst headache of life'—IMMEDIATELY and clearly advise them to call emergency services (911, 999, 112, or their local emergency number) or proceed to the nearest emergency department right away.
3. For non-emergencies:
   - Provide clear, evidence-based, general educational information.
   - Suggest safe, conservative home-comfort measures (hydration, rest, gentle mobility).
   - Suggest 2-3 specific, thoughtful questions they can bring to their next doctor or pharmacist appointment.
   - Explain what signs or changes would warrant prompt medical evaluation.
4. Keep explanations approachable, compassionate, and free of unnecessary medical jargon.
5. Always remind the user that this guidance is informational and they should consult their personal healthcare provider for individualized care.`;

export const GEMINI_MODEL_CASCADE = [
  "gemini-flash-latest",
  "gemini-3.8-flash",
  "gemini-3.5-flash",
  "gemini-pro-latest",
];

/**
 * Attempts generation across the model cascade.
 * If one model experiences temporary 503 capacity spikes, seamlessly falls back to the next.
 */
export async function generateContentWithCascade(
  genAI: GoogleGenerativeAI,
  prompt: string,
  systemInstruction?: string
): Promise<string> {
  let lastError: any = null;

  for (const modelName of GEMINI_MODEL_CASCADE) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        ...(systemInstruction ? { systemInstruction } : {}),
      });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      if (text) return text;
    } catch (err: any) {
      console.warn(`[CareBuddy AI Cascade] Model ${modelName} notice: ${err?.message || err}. Trying next tier...`);
      lastError = err;
    }
  }

  throw lastError || new Error("All Gemini cascade models unavailable.");
}

/**
 * Checks if emergency red flags exist in user message.
 */
export function detectEmergencyKeywords(text: string): boolean {
  const lower = text.toLowerCase();
  const emergencyPatterns = [
    "chest pain",
    "can't breathe",
    "cannot breathe",
    "shortness of breath",
    "suicide",
    "kill myself",
    "severe bleeding",
    "slurred speech",
    "face drooping",
    "stroke",
    "heart attack",
    "passed out",
    "fainted suddenly",
    "loss of consciousness",
    "worst headache",
    "coughing blood",
  ];
  return emergencyPatterns.some((pattern) => lower.includes(pattern));
}

/**
 * Intelligent local fallback when Gemini API key is missing or service is unavailable.
 * Transparently informs user that local knowledge mode is active.
 */
export function getLocalFallbackChatResponse(
  message: string,
  profile?: UserProfile
): { responseText: string; isEmergency: boolean } {
  const isEmergency = detectEmergencyKeywords(message);

  if (isEmergency) {
    return {
      isEmergency: true,
      responseText: `🚨 **IMPORTANT EMERGENCY WARNING**\n\nThe symptoms you mentioned may indicate an urgent medical situation. Please **immediately call emergency medical services (such as 911, 999, 112, or your local emergency line)** or have someone drive you to the nearest emergency room.\n\nDo not wait to see if symptoms improve on their own.`,
    };
  }

  const lower = message.toLowerCase();

  let contextAdvice = "";
  if (lower.includes("headache") || lower.includes("migraine")) {
    contextAdvice = `• **Hydration**: Drink 1-2 large glasses of water right now.\n• **Rest**: Rest in a dark, quiet room with a cool compress across your forehead or back of neck.\n• **Screen break**: Give your eyes a 20-minute break from monitors and phones.\n• **When to consult**: If accompanied by neck stiffness, fever, or sudden vision changes, seek immediate medical attention.`;
  } else if (lower.includes("sleep") || lower.includes("insomnia") || lower.includes("tired")) {
    contextAdvice = `• **Sleep Hygiene**: Keep your bedroom cool (around 65-68°F / 18-20°C) and completely dark.\n• **Wind-down Routine**: Avoid screens for 45 minutes before bedtime.\n• **Caffeine Cutoff**: Try to avoid coffee or energy drinks after 1:00 PM.\n• **Consistency**: Aim to wake up at the exact same hour every day, even on weekends.`;
  } else if (lower.includes("stomach") || lower.includes("nausea") || lower.includes("digestion")) {
    contextAdvice = `• **Gentle Foods**: Consider small sips of peppermint or ginger tea, plain crackers, or rice.\n• **Positioning**: Avoid lying completely flat; elevate your head with 2 pillows.\n• **Avoid Triggers**: Steer clear of acidic, greasy, or heavily spiced foods for the next 24 hours.`;
  } else {
    contextAdvice = `• **General Wellness**: Stay well-hydrated, aim for nutritious meals, and ensure 7-8 hours of restful sleep.\n• **Track your patterns**: Use the CareBuddy Check-in tab to record daily energy, discomfort, and sleep.\n• **Questions for your Doctor**: Note down when this started, what makes it better/worse, and any medications you are currently taking.`;
  }

  const responseText = `**[Local Knowledge Mode - Offline Demo]**\n\n*Note: To enable live AI intelligence, add your \`GEMINI_API_KEY\` to \`.env.local\`.*\n\nHere is general wellness guidance regarding your query:\n\n${contextAdvice}\n\n**Next Steps to discuss with your healthcare provider:**\n1. "Are my current symptoms consistent with normal fatigue or an underlying issue?"\n2. "Are there any laboratory screenings (like iron, vitamin D, or thyroid) that might be helpful?"\n\n*Disclaimer: CareBuddy is an educational guide and does not provide formal medical diagnosis or prescriptions.*`;

  return { responseText, isEmergency: false };
}
