# 🩺 CareBuddy — Personal Healthcare & Wellness Companion

CareBuddy is a modern, full-stack healthcare companion web application designed as a reliable, beginner-friendly starter template for AI-assisted hackathons.

It gives users an intuitive workspace to log daily check-ins, calculate a transparent wellness index, track medication adherence, explore conservative symptom home-care guides, generate structured doctor visit briefs, and chat with an AI wellness assistant.

---

## 🚀 Key Features

1. **Dashboard & Vitals Overview**:
   - Live 100-point Wellness Index calculation.
   - Real-time medication adherence ring & quick-check dose list.
   - Emergency hotline access and quick launchpads.
2. **Daily Wellness Check-in**:
   - Interactive 4-parameter questionnaire: Mood, Energy (1-10), Sleep (hrs), and Discomfort (0-10).
   - Fully transparent 100-point scoring algorithm (no black-box AI guessing).
   - Historical log records with timestamps and deletion controls.
3. **Medication Tracker**:
   - Add, edit, and remove medications with dosage and schedule.
   - Interactive daily checkbox with adherence percentage bar.
   - Daily automatic reset logic and manual reset controls.
4. **AI Health Assistant**:
   - Chat interface with empathetic wellness guidance and suggested starter prompts.
   - Backed by Google Gemini API (`gemini-1.5-flash`) with medical guardrails.
   - **Emergency Detection**: Automatically detects urgent warning signs (e.g. chest pain, stroke signs) and directs users to call 911 / 999 / 112 immediately.
   - **Reliable Local Fallback**: When no API key is provided, switches to Local Knowledge Mode without breaking or pretending to be Gemini.
5. **Symptom Explorer & Triage Guide**:
   - Searchable and categorized directory of common symptoms.
   - Evidence-based conservative home remedies, when to consult a doctor, and red-flag alerts.
   - One-click export to the Doctor Visit Brief.
6. **Doctor Visit Brief Generator**:
   - Compiles profile, recent 7-day check-ins, medication logs, and active symptoms into a clean, Markdown-formatted 1-page report for physicians.
   - One-click copy to clipboard and print support.
7. **Medical Terminology & Lab Explainer**:
   - Translates confusing laboratory tests (CBC, TSH, Lipid Panel, HbA1c) into plain 5th-grade language.
   - Emphasizes that individual lab ranges must be interpreted in clinical context.
8. **Health Profile & Safety Baseline**:
   - Editable demographics, blood group, allergies, pre-existing conditions, and emergency contacts.
   - Demo mode switcher and local storage reset.

---

## 🛠️ Technology Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router, React 18, TypeScript)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) with a calming medical color palette (soft blues `#0284c7`, mint greens `#10b981`, and slate neutrals `#f8fafc`)
- **Icons**: [Lucide React](https://lucide.dev/)
- **State & Persistence**: Browser `localStorage` with SSR-safe hydration
- **AI Intelligence**: Google Gemini API via official `@google/generative-ai` SDK
- **Backend**: Next.js Server-Side Route Handlers (`app/api/chat`, `app/api/summarize`, `app/api/explain`)

---

## 🔐 Architecture: Security & API Protection

```
+-------------------------------------------------------------+
| Browser / Client UI (React 18 Components)                   |
| - LocalStorage: profile, medications, check-in history       |
| - ZERO exposed API keys in network requests                 |
+-------------------------------------------------------------+
                              |
                     POST /api/chat
                     POST /api/summarize
                     POST /api/explain
                              |
                              v
+-------------------------------------------------------------+
| Server-Side Next.js Route Handlers                          |
| - Reads GEMINI_API_KEY from .env.local                      |
| - Attaches Clinical Safety System Prompt Guardrails         |
| - Graceful Fallback if offline or missing API key           |
+-------------------------------------------------------------+
                              |
                              v
+-------------------------------------------------------------+
| Google Gemini API (gemini-1.5-flash)                        |
+-------------------------------------------------------------+
```

---

## 📦 Folder Structure

```text
├── app/
│   ├── api/
│   │   ├── chat/route.ts         # Secure AI chat proxy to Gemini
│   │   ├── summarize/route.ts    # Doctor visit brief generator
│   │   └── explain/route.ts      # Medical jargon & lab explainer
│   ├── globals.css               # Tailwind directives and custom scrollbars
│   ├── layout.tsx                # App root layout with HTML head & metadata
│   └── page.tsx                  # CareBuddy main application hub
├── components/
│   ├── AssistantTab.tsx          # AI Chat interface & suggested prompts
│   ├── CheckInTab.tsx            # Daily check-in form, history & scoring
│   ├── DashboardTab.tsx          # Overview cards, vitals & quick actions
│   ├── DoctorSummaryTab.tsx      # Visit brief generator with copy/print
│   ├── ExplainerTab.tsx          # Lab term translator
│   ├── MedicationsTab.tsx        # Medication tracker & adherence
│   ├── MedicalDisclaimerBanner.tsx # Pinned medical notice & hotline modal
│   ├── Navbar.tsx                # Brand header, avatar & mobile drawer toggle
│   ├── ProfileTab.tsx            # Patient profile & emergency contacts
│   ├── Sidebar.tsx               # Desktop & mobile navigation
│   └── SymptomExplorerTab.tsx    # Symptom directory & red flag warnings
├── data/
│   └── mockData.ts               # Starter demo profile, medications & symptoms
├── lib/
│   ├── gemini.ts                 # Gemini system prompt & fallback generator
│   ├── scoring.ts                # 100-point transparent wellness formula
│   ├── storage.ts                # Browser localStorage helpers
│   └── types.ts                  # TypeScript data interfaces
├── .env.example                  # Template for environment variables
├── package.json                  # Dependencies & scripts
├── tailwind.config.ts            # Palette & typography theme
└── tsconfig.json                 # TypeScript compiler options
```

---

## ⚡ How to Run CareBuddy Locally

### 1. Prerequisites
- **Node.js** (v18.x, v20.x, or v24.x)
- **npm** or **pnpm**

### 2. Configure Environment Variables (Optional for AI)
To enable live AI features with Google Gemini:
1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
2. Get a free API key from [Google AI Studio](https://aistudio.google.com/).
3. Paste it inside `.env.local`:
   ```env
   GEMINI_API_KEY=AIzaSy...
   ```
*(Note: If you skip this step, CareBuddy will automatically run in **Local Knowledge Mode** using its built-in medical heuristics without crashing!)*

### 3. Install Dependencies
```bash
npm install
```

### 4. Run the Development Server
```bash
npm run dev
```

Open your browser and navigate to:
```
http://localhost:3000
```

---

## 🧪 Testing and Verification Checklist

- [x] **TypeScript check**: Run `npx tsc --noEmit` to verify type safety.
- [x] **Production build**: Run `npm run build` to confirm compilation.
- [x] **LocalStorage persistence**: Add a medication or check-in, refresh the page, and observe the state preserved.
- [x] **Offline fallback**: Run without an API key to confirm graceful fallback responses.
- [x] **Emergency hotline triage**: Type "severe chest pain and shortness of breath" in the AI Assistant to trigger immediate emergency instructions.
