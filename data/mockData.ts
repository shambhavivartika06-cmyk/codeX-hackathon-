import { UserProfile, Medication, WellnessCheckIn, SymptomInfo } from "../lib/types";

export const DEMO_PROFILE: UserProfile = {
  name: "Alex Rivera",
  age: 34,
  bloodGroup: "O+",
  allergies: "Penicillin, Peanuts",
  conditions: "Mild seasonal asthma, Occasional migraine",
  emergencyContactName: "Sarah Rivera (Spouse)",
  emergencyContactPhone: "+1 (555) 234-5678",
  isDemoData: true,
};

export const INITIAL_MEDICATIONS: Medication[] = [
  {
    id: "med-1",
    name: "Vitamin D3",
    dosage: "2000 IU",
    schedule: "Morning with breakfast (8:30 AM)",
    notes: "Take with food for better absorption",
    takenToday: true,
    lastMarkedDate: new Date().toISOString().split("T")[0],
  },
  {
    id: "med-2",
    name: "Omega-3 Fish Oil",
    dosage: "1000 mg",
    schedule: "Lunch (1:00 PM)",
    notes: "Support cardiovascular health",
    takenToday: false,
    lastMarkedDate: "",
  },
  {
    id: "med-3",
    name: "Magnesium Glycinate",
    dosage: "200 mg",
    schedule: "Bedtime (9:30 PM)",
    notes: "Assists muscle relaxation & sleep quality",
    takenToday: false,
    lastMarkedDate: "",
  },
];

export const INITIAL_CHECKINS: WellnessCheckIn[] = [
  {
    id: "chk-demo-1",
    timestamp: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    dateFormatted: "Yesterday",
    mood: "good",
    energy: 7,
    sleepHours: 7.5,
    discomfortLevel: 2,
    notes: "Slight shoulder tension after desk work, improved after stretching.",
    wellnessScore: 83,
  },
  {
    id: "chk-demo-2",
    timestamp: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
    dateFormatted: "2 days ago",
    mood: "great",
    energy: 8,
    sleepHours: 8,
    discomfortLevel: 1,
    notes: "Felt rested, went for a 30-minute morning jog.",
    wellnessScore: 93,
  },
];

export const SYMPTOMS_CATALOG: SymptomInfo[] = [
  {
    id: "symp-headache",
    name: "Tension Headache",
    category: "Head & Neck",
    description: "A dull, aching sensation around the forehead, temples, or back of the neck.",
    homeCare: [
      "Drink 16-24 oz of water; dehydration is a frequent culprit.",
      "Rest in a quiet, dimly lit room with a cool cloth on forehead.",
      "Gentle neck and shoulder mobility stretches.",
    ],
    whenToSeeDoctor: [
      "Headaches that wake you from sleep or progressively worsen over days.",
      "Accompanied by persistent nausea or sensitivity to sound and light.",
    ],
    redFlags: [
      "Sudden 'thunderclap' onset reaching maximum severity in seconds.",
      "Stiff neck, high fever, confusion, speech slurring, or weakness on one side.",
    ],
  },
  {
    id: "symp-acid-reflux",
    name: "Acid Indigestion / Heartburn",
    category: "Digestive",
    description: "Burning discomfort in the chest or upper throat, often after heavy or spicy meals.",
    homeCare: [
      "Avoid lying flat for at least 2-3 hours following meals.",
      "Sip lukewarm water or chamomile tea; avoid citrus, carbonation, and coffee.",
      "Wear loose clothing around the abdomen.",
    ],
    whenToSeeDoctor: [
      "Difficulty or pain when swallowing food.",
      "Occurring more than twice a week for multiple consecutive weeks.",
    ],
    redFlags: [
      "Chest tightness radiating to left arm, neck, jaw, or shortness of breath (call emergency services).",
      "Vomiting dark material resembling coffee grounds or black tarry stools.",
    ],
  },
  {
    id: "symp-fatigue",
    name: "Daytime Fatigue & Brain Fog",
    category: "General",
    description: "Persistent lack of energy, sluggish concentration, or difficulty waking up refreshed.",
    homeCare: [
      "Establish a consistent 7-8 hour sleep schedule including weekends.",
      "Step outside for 10-15 minutes of natural sunlight within 1 hour of waking.",
      "Check hydration and reduce late afternoon caffeine.",
    ],
    whenToSeeDoctor: [
      "Unexplained fatigue persisting for more than 2-3 weeks.",
      "Accompanied by unexpected weight changes, hair thinning, or extreme cold sensitivity.",
    ],
    redFlags: [
      "Sudden extreme lethargy, fainting (syncope), or persistent shortness of breath while seated.",
    ],
  },
  {
    id: "symp-cough",
    name: "Mild Dry Cough / Throat Tickle",
    category: "Respiratory",
    description: "Irritating throat tickle without phlegm, commonly triggered by dry air or post-viral recovery.",
    homeCare: [
      "1 teaspoon of natural honey (safe for adults and children > 1 year).",
      "Use a cool-mist room humidifier or take a warm steamy shower.",
      "Sip warm broths and stay well-hydrated.",
    ],
    whenToSeeDoctor: [
      "Cough lingering longer than 3 weeks.",
      "Thick yellow-green mucus or recurring evening fevers.",
    ],
    redFlags: [
      "Struggling to speak in full sentences due to breathlessness.",
      "Coughing up pink frothy phlegm or bright red blood.",
      "Blue or pale tint around fingernails or lips.",
    ],
  },
  {
    id: "symp-back-pain",
    name: "Lower Back Muscular Strain",
    category: "Musculoskeletal",
    description: "Aching or stiffness in lumbar region after lifting, prolonged sitting, or abrupt twist.",
    homeCare: [
      "Avoid strict bed rest; gentle short walks help blood circulation and healing.",
      "Apply cold compress for first 48 hours (15 mins at a time), then mild heat.",
      "Support lower back with a small lumbar pillow while seated.",
    ],
    whenToSeeDoctor: [
      "Pain not improving after 7-10 days of conservative self-care.",
      "Pain shooting down the leg below the knee (sciatica pattern).",
    ],
    redFlags: [
      "Sudden loss of bowel or bladder control (cauda equina syndrome - immediate emergency).",
      "Numbness in the groin or inner thighs ('saddle anesthesia').",
    ],
  },
];
