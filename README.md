# MedPath AI 🩺

**AI-powered health guidance assistant — helping users understand their symptoms and know their next step, safely.**

> ⚠️ **Disclaimer:** MedPath AI does **not** provide a medical diagnosis. It is a guidance tool only. Always consult a licensed healthcare professional for any medical concern. In an emergency, call **997** (Saudi Red Crescent) or go to the nearest emergency department immediately.

---

## 📌 The Problem

Many people struggle to know what to do when new symptoms appear — is this urgent? Which clinic should I visit? What should I do while I wait for an appointment? This uncertainty causes delays in seeking the right care, unnecessary visits to the wrong clinic, or in worse cases, ignoring symptoms that needed urgent attention.

## 💡 The Solution

MedPath AI lets a user describe their symptoms in plain language and instantly receive a clear, structured guidance page containing:

- ⏰ **Suggested timeframe** for seeking care (e.g., today, within a few days, routine)
- 🏥 **Recommended clinic type / specialty** to visit
- ✅❌ **What to do and what to avoid** while waiting for the appointment
- 🖨️ **A printable summary** of the reported case to bring to the doctor

## 🧩 How It Works — Mapped to ITU-T Y.3172 ML Pipeline

| Pipeline Node | Role in MedPath AI |
|---|---|
| **SRC** (Source) | User-submitted symptom form (symptoms, severity, duration, age) |
| **C** (Collector) | Backend service that receives and structures the submitted data |
| **PP** (Preprocessor) | Cleans and normalizes free-text symptoms into structured fields |
| **M** (Model) | AI model (Google AI Studio / Gemini) that analyzes symptoms and classifies urgency |
| **P** (Policy) | Safety layer: "not a diagnosis" disclaimer, red-flag escalation rule for critical symptoms, human-in-the-loop principle |
| **D** (Distributor) | Builds the final guidance page (timing, clinic, instructions) |
| **SINK** | The result page shown to the user, with a printable/exportable summary |

## 📚 Policy & Regulatory References (Knowledge Base)

MedPath AI's design is informed by the following authentic public references:

1. **[National Strategy for Data & AI (NSDAI)](https://sdaia.gov.sa/en/SDAIA/SdaiaStrategies/Pages/NationalStrategyForDataAndAI.aspx)** — SDAIA, 2020 (Healthcare pillar)
2. **[Personal Data Protection Law (PDPL)](https://sdaia.gov.sa/en/SDAIA/about/Pages/RegulationsAndPolicies.aspx)** — SDAIA, 2021/2023
3. **[MDS-G010 — Guidance on AI/ML-based Medical Devices](https://www.sfda.gov.sa/sites/default/files/2023-01/MDS-G010ML.pdf)** — Saudi Food and Drug Authority (SFDA), 2023
4. **[MDS-G027 — Digital Health Guidance](https://www.sfda.gov.sa/sites/default/files/2025-08/MDS-G027.pdf)** — SFDA, 2025

Full document — including the Y.3172 mapping table and reference list — is available in the project's technical report (`/docs/MedPath_AI_Technical_Report.pdf`).

## 🛠️ Tech Stack

- **Frontend/App:** Built with Google AI Studio (AI-assisted / vibe coding)
- **AI Model:** Google Gemini (via Google AI Studio)
- **Hosting:** GitHub

## 🚀 Getting Started

1. Clone this repository
   ```bash
   git clone https://github.com/<your-username>/medpath-ai.git
   ```
2. Open the project in Google AI Studio, or open `index.html` directly if it is a static build.
3. No API key is required by the end user — the app is pre-configured to run as deployed.

## 🎯 Uniqueness / Value

- Directly maps a real-world health use case to the **ITU-T Y.3172 ML pipeline**
- Grounds AI outputs in **Saudi regulatory references** (SFDA, SDAIA/PDPL) rather than open-ended, unverifiable answers
- Demonstrates a concrete policy-gap scenario (see technical report, Evaluation Scenarios) and how the system's Policy (P) node responds to it

## 👤 Author

**Faisal Habib Al-Furaidi**
Nursing Student, Buraydah Private Colleges
📧 Alwsws91@gmail.com | 📱 +966 55 757 3885

## 🏆 Submission

Submitted to the **ITU AI Readiness Hackathon (Kingdom of Saudi Arabia)** — organized by ITU, in cooperation with SDAIA and ICAIRE. Track: **Health**.
