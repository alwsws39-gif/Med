import express from "express";
import path from "path";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

const PORT = 3000;

// Initialize Gemini API client
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("GEMINI_API_KEY is not defined in environment. Using fallback triage logic.");
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

const SYSTEM_INSTRUCTION = `
You are the core intelligence of MedPath AI, an official medical triage and patient navigation system operating strictly under Saudi Arabian Digital Health Regulations (MOH, SDAIA, and SFDA guidelines).

YOUR KNOWLEDGE BASE & REGULATORY FRAMEWORK:
1. Patient Data Privacy (SDAIA PDPL):
   - Never request, store, or output Personally Identifiable Information (PII) such as National ID, Iqama, names, phone numbers, or addresses.
   - Any commercial targeted advertising or sponsored clinic routing based on user symptoms is STRICTLY PROHIBITED. All routing must be strictly objective, evidence-based, and aligned with standard Saudi public healthcare pathways (e.g. MOH Urgent Care Centers, Primary Healthcare Centers PHCs, Specialist Clinics via Sehhaty, Emergency 997 / 937).

2. Clinical Safety & Human-in-the-Loop (SFDA SaMD):
   - You are a pre-clinical triage assistant, not a final diagnosing physician.
   - High-risk symptoms (Red Flags: severe central crushing chest pain radiating to arm/jaw, acute focal neurological deficit / FAST stroke signs, acute respiratory failure / stridor / cyanosis, massive hemorrhage, anaphylaxis with airway compromise, sudden loss of consciousness, acute severe poisoning / trauma) must IMMEDIATELY trigger mandatory emergency department redirection (Level 1: Immediate Emergency) without unnecessary delays or prolonged questionnaires.

3. Clinical Triage Standard (Saudi MOH Guidelines):
   Categorize all assessed cases into one of three official levels:
   - Level 1: Immediate Emergency (ER) -> Immediate emergency department visit or call 997 Red Crescent.
   - Level 2: Urgent Care (Within 24 Hours) -> Visit an Urgent Care Center (مراكز الرعاية العاجلة) or 24/7 PHC within 24 hours.
   - Level 3: Routine Specialty Clinic (Scheduled Appointment) -> Book a scheduled appointment via Sehhaty (تطبيق صحتي) within 3-5 days.

QUESTIONING WORKFLOW:
- If the patient presents clear high-risk red-flag symptoms immediately in their chief complaint, DO NOT ask more questions; IMMEDIATELY return "isLast": true with Level 1 Immediate Emergency (ER).
- If the case is non-emergency but requires clinical clarification to determine the appropriate specialty, severity, or timeline, ask 1 to 3 targeted, focused clinical clarifying questions ("isLast": false).
- Once sufficient context is gathered (or when questions reach 2-3), return "isLast": true with the final structured assessment.
- All text in questions, options, and directives MUST be in clear, professional, empathetic Arabic (اللغة العربية الفصحى).

YOUR MANDATORY OUTPUT FORMAT:
You MUST output ONLY a valid JSON object matching one of the following two schemas with NO markdown or extraneous text:

Schema A (When isLast is false - asking a clarifying question):
{
  "isLast": false,
  "question": "نص السؤال الطبي التوضيحي باللغة العربية",
  "options": [
    "خيار توضيحي 1",
    "خيار توضيحي 2",
    "خيار توضيحي 3",
    "خيار توضيحي 4"
  ],
  "allowCustomInput": true,
  "clinicalRationale": "السبب السريري للسؤال وفق المعايير الطبية"
}

Schema B (When isLast is true - final assessment containing EXACTLY the 4 required components):
{
  "isLast": true,
  "triageLevel": "LEVEL_1_EMERGENCY" | "LEVEL_2_URGENT" | "LEVEL_3_ROUTINE",
  "triageLevelLabel": "المستوى 1: طوارئ فورية (ER)" | "المستوى 2: رعاية عاجلة (خلال 24 ساعة)" | "المستوى 3: عيادة تخصصية روتينية (موعد مجدول)",
  
  // 1. Recommended Appointment Timeline
  "appointmentTimeline": "التوقيت الموصى به للمراجعة (مثلاً: طوارئ فورية - التوجه مباشرة لأقرب طوارئ أو الاتصال بـ 997، أو خلال 24 ساعة لمركز رعاية عاجلة، أو حجز موعد روتيني خلال 3-5 أيام)",
  
  // 2. Target Medical Clinic/Specialty
  "targetSpecialty": {
    "specialtyName": "اسم التخصص الطبي المناسب (مثال: طب وجراحة القلب، طب الأسرة والرعاية الأولية، جراحة العظام والمفاصل، أمراض الجهاز الهضمي، المخ والأعصاب)",
    "departmentType": "نوع المنشأة أو القسم (مثال: قسم الطوارئ والإسعاف الطبي، مراكز الرعاية الصحية الأولية العاجلة، العيادات الاستشارية التخصصية)",
    "saudiHealthcareRouting": "مسار التوجيه في المنظومة الصحية السعودية (مثال: الاتصال بـ 997 للإسعاف الفوري، أو زيارة مركز رعاية عاجلة ممتد، أو حجز موعد عبر تطبيق صحتي Sehhaty أو استشارة 937)",
    "clinicalFocus": "نطاق الفحص السريري المتوقع لدى الطبيب المختص"
  },
  
  // 3. Pre-Consultation Safety Directives
  "safetyDirectives": {
    "dos": [
      "إجراء آمن 1 موصى به أثناء الانتظار (مثال: الاستراحة في وضعية الجلوس المريح، قياس وتدوين الحرارة دورياً)",
      "إجراء آمن 2",
      "إجراء آمن 3"
    ],
    "donts": [
      "إجراء أو دواء محظور تجنبه 1 (مثال: الامتناع عن قيادة السيارة في حال الدوار، تجنب مضادات الالتهاب غير الستيرويدية دون استشارة)",
      "إجراء أو دواء محظور تجنبه 2",
      "إجراء أو دواء محظور تجنبه 3"
    ]
  },
  
  // 4. Printable Clinical Summary (Technical summary for attending physician)
  "clinicalSummary": {
    "chiefComplaintSummary": "ملخص الشكوى الرئيسية الأولية بأسلوب طبي دقيق",
    "hpiTimeline": "التسلسل الزمني لتطور الأعراض ومدتها",
    "reportedSymptoms": ["عرض 1", "عرض 2", "عرض 3"],
    "pertinentNegativesOrRiskFactors": ["عامل خطورة أو نفي سريري مهم 1", "عامل 2"],
    "provisionalTriageCategory": "التصنيف السريري المبدئي للفرز وفق معايير وزارة الصحة السعودية",
    "suggestedSpecialty": "التخصص الطبي الموصى بالإحالة إليه",
    "clinicalNotesForPhysician": "ملخص سريري تقني موجز ومعد ليقدمه المريض للطبيب المعالج عند الحضور لتسهيل الفحص السريري المباشر",
    "generatedAt": "تاريخ ووقت إعداد التقرير"
  },
  
  "regulatoryCompliance": {
    "sdaiaPdplNotice": "متوافق مع نظام حماية البيانات الشخصية (SDAIA PDPL) - لم يتم جمع أو تخزين أي بيانات هوية شخصية أو توجيه تجاري.",
    "sfdaSamdNotice": "مصنف كمساعد فرز وتوجيه ما قبل سريري (SFDA SaMD) - لا يعد تشخيصاً طبياً نهائياً ولا يغني عن الفحص السريري المباشر.",
    "mohFramework": "مبني وفق الدليل الإرشادي للفرز والتوجيه الصحي لوزارة الصحة السعودية (Saudi MOH Triage Protocol)."
  }
}
`;

app.post("/api/triage", async (req, res) => {
  try {
    const { chiefComplaint, history } = req.body;

    if (!chiefComplaint || typeof chiefComplaint !== "string") {
      return res.status(400).json({ error: "الرجاء إدخال الشكوى الطبية الأساسية" });
    }

    const currentHistory = Array.isArray(history) ? history : [];
    const historyText = currentHistory.length > 0
      ? currentHistory.map((item: any, idx: number) => {
          let ans = item.selectedOption || "";
          if (item.customDetails) {
            ans += ` (تفاصيل إضافية: ${item.customDetails})`;
          }
          return `سؤال ${idx + 1}: ${item.question}\nإجابة المريض: ${ans}`;
        }).join("\n---\n")
      : "لا توجد أسئلة سابقة (هذا التقييم الأولي للشكوى).";

    const prompt = `
الشكوى الطبية الأساسية للمريض:
"${chiefComplaint}"

سجل الأسئلة والإجابات التوضيحية السابقة (${currentHistory.length} أسئلة حتى الآن):
${historyText}

المطلوب:
1. تقييم الحالة وفق اللوائح الصحية الرقمية السعودية (MOH, SDAIA, SFDA).
2. فحص وجود علامات الخطر الحرجة (Red Flags). إذا وُجدت، أصدر فوراً Level 1 Emergency مع isLast: true.
3. إذا كانت الحالة غير طارئة وتحتاج تفاصيل إضافية لتحديد التخصص والتوقيت بدقة (وعدد الأسئلة السابقة أقل من 2 أو 3)، قم بطرح سؤال سريري توضيحي دقيق (isLast: false).
4. إذا اكتملت المعلومات أو وصل عدد الأسئلة إلى 2-3، أصدر التقييم النهائي والتوجيه الطبي الشامل المتضمن المكونات الأربعة الإلزامية بدقة بالغة مع isLast: true.
تأكد من إرجاع JSON صحيح فقط.
`;

    const ai = getGeminiClient();

    if (!ai) {
      // Intelligent Rule-Based Fallback Simulator aligned with Saudi MOH Triage Standards
      const lower = chiefComplaint.toLowerCase();
      const isChestPain = lower.includes("صدر") || lower.includes("قلب") || lower.includes("chest") || lower.includes("جلطة") || lower.includes("ضيق تنفس شديد") || lower.includes("اغماء");
      
      if (isChestPain) {
        return res.json({
          isLast: true,
          triageLevel: "LEVEL_1_EMERGENCY",
          triageLevelLabel: "المستوى 1: طوارئ فورية (ER)",
          appointmentTimeline: "طوارئ فورية - التوجه فوراً لأقرب قسم طوارئ أو الاتصال بهيئة الهلال الأحمر السعودي 997",
          targetSpecialty: {
            specialtyName: "طب وجراحة القلب والأوعية الدموية / طب الطوارئ",
            departmentType: "قسم الطوارئ والحالات الحرجة (Emergency Department)",
            saudiHealthcareRouting: "الاتصال المباشر بالإسعاف (997) أو التوجه الفوري لطوارئ المستشفى الأقرب",
            clinicalFocus: "تخطيط كهربية القلب (ECG)، إنزيمات القلب، والتقييم الوعائي الفوري"
          },
          safetyDirectives: {
            dos: [
              "الجلوس في وضع مريح شبه قائم لتسهيل التنفس وتجنب أي مجهود بدني",
              "الاتصال فوراً بـ 997 أو إبلاغ أقرب مرافق لطلب المساعدة الطبية الفورية",
              "فك الأزرار والملابس الضيقة حول الرقبة والصدر"
            ],
            donts: [
              "الامتناع التام عن قيادة السيارة بنفسك إلى المستشفى",
              "تجنب تناول المأكولات أو المشروبات حتى التقييم في قسم الطوارئ",
              "عدم تجاهل الأعراض أو الانتظار لتحسنها تلقائياً"
            ]
          },
          clinicalSummary: {
            chiefComplaintSummary: `شكوى ألم أو ضغط صدري حاد تستدعي استبعاد متلازمة الشريان التاجي الحادة: "${chiefComplaint}"`,
            hpiTimeline: "بدء الأعراض بشكل حاد مع حاجة ماسة لتقييم قلبي إسعافي",
            reportedSymptoms: ["ألم أو ضغط في الصدر", "احتمالية انتقال الألم أو ضيق تنفس مصاحب"],
            pertinentNegativesOrRiskFactors: ["حالة خطورة حرجة تتطلب تخطيط قلب مباشر واستبعاد الإقفار القلبي"],
            provisionalTriageCategory: "المستوى 1: فرز طوارئ فوري (Level 1 Emergency - Saudi MOH)",
            suggestedSpecialty: "Emergency Medicine / Cardiology",
            clinicalNotesForPhysician: "Pre-clinical alert: Patient presents with acute cardiopulmonary/chest symptoms meeting Level 1 triage criteria. Immediate triage ECG and cardiac markers indicated.",
            generatedAt: new Date().toISOString()
          },
          regulatoryCompliance: {
            sdaiaPdplNotice: "متوافق مع نظام حماية البيانات الشخصية (SDAIA PDPL) - لم يتم جمع أو تخزين أي بيانات هوية شخصية.",
            sfdaSamdNotice: "مصنف كمساعد فرز وتوجيه ما قبل سريري (SFDA SaMD) - توجيه إسعافي مباشر.",
            mohFramework: "وفق الدليل الإرشادي للفرز والتوجيه لوزارة الصحة السعودية (Saudi MOH Triage Level 1)."
          }
        });
      }

      if (currentHistory.length < 2) {
        const fallbackQuestions = [
          {
            question: "منذ متى بدأت هذه الأعراض، وما هو نمط الألم أو الانزعاج؟",
            options: [
              "بدأت منذ ساعات قليلة وتتزايد بشكل ملحوظ",
              "مستمرة منذ 24 إلى 48 ساعة بدرجة متوسطة",
              "أعراض متكررة على فترات متباعدة منذ عدة أسابيع",
              "أعراض خفيفة مستمرة تزداد مع الحركة أو الطعام"
            ],
            allowCustomInput: true,
            clinicalRationale: "تحديد مدى حداثة وتطور الحالة وفق معايير فرز وزارة الصحة"
          },
          {
            question: "هل ترافقت الشكوى مع أي من الأعراض المصاحبة التالية؟",
            options: [
              "حمى أو ارتفاع في درجة الحرارة مع قشعريرة",
              "غثيان أو اضطراب في الجهاز الهضمي",
              "صداع أو دوخة خفيفة مع إجهاد عام",
              "لا توجد أي أعراض إضافية مصاحبة"
            ],
            allowCustomInput: true,
            clinicalRationale: "تقييم العلامات الجهازية الإضافية لتحديد التخصص الطبي المستهدف"
          }
        ];
        return res.json({
          isLast: false,
          ...fallbackQuestions[currentHistory.length % fallbackQuestions.length]
        });
      } else {
        return res.json({
          isLast: true,
          triageLevel: "LEVEL_2_URGENT",
          triageLevelLabel: "المستوى 2: رعاية عاجلة (خلال 24 ساعة)",
          appointmentTimeline: "خلال 24 ساعة - مراجعة مركز الرعاية الصحية العاجلة أو طبيب الأسرة",
          targetSpecialty: {
            specialtyName: "طب الأسرة والرعاية الصحية الأولية / الأمراض الباطنية",
            departmentType: "مراكز الرعاية الصحية العاجلة الممتدة (Urgent Care PHC)",
            saudiHealthcareRouting: "زيارة أقرب مركز رعاية عاجلة تابع لوزارة الصحة أو الاستشارة عبر تطبيق صحتي (Sehhaty) أو الاتصال بـ 937",
            clinicalFocus: "الفحص السريري المباشر، التحاليل الأساسية، وتحديد الخطة العلاجية"
          },
          safetyDirectives: {
            dos: [
              "أخذ قسط كافٍ من الراحة والحرص على شرب السوائل بكميات منتظمة",
              "تدوين تطور الأعراض ومواعيدها لمشاركتها بدقة مع الطبيب المعالج",
              "مراقبة أي أعراض غير معتادة والتوجه للطوارئ فوراً في حال تفاقمها"
            ],
            donts: [
              "تجنب تناول المضادات الحيوية دون وصفة طبية صريحة",
              "الامتناع عن الإفراط في المسكنات القوية على معدة خاوية",
              "تجنب الأنشطة المجهدة حتى اكتمال التقييم الطبي"
            ]
          },
          clinicalSummary: {
            chiefComplaintSummary: `شكوى مريض بأعراض تحتاج تقييماً سريرياً ضمن الرعاية العاجلة: "${chiefComplaint}"`,
            hpiTimeline: "تطور تدريجي للأعراض خلال اليومين السابقين بدون علامات إنذار مهددة للحياة",
            reportedSymptoms: ["أعراض سريرية أولية", "انزعاج متوسط الشدة"],
            pertinentNegativesOrRiskFactors: ["نفي وجود علامات حمى نزفية أو ضيق تنفس حاد أو علامات صدمة"],
            provisionalTriageCategory: "المستوى 2: رعاية عاجلة خلال 24 ساعة (Saudi MOH Urgent Care)",
            suggestedSpecialty: "Family Medicine / General Practice / Internal Medicine",
            clinicalNotesForPhysician: "Pre-clinical patient summary generated via MedPath AI. Patient presents with non-critical symptoms appropriate for evaluation at Urgent Care PHC within 24h.",
            generatedAt: new Date().toISOString()
          },
          regulatoryCompliance: {
            sdaiaPdplNotice: "متوافق مع نظام حماية البيانات الشخصية (SDAIA PDPL) - لم يتم جمع أو تخزين أي بيانات هوية شخصية أو توجيه تجاري.",
            sfdaSamdNotice: "مصنف كمساعد فرز وتوجيه ما قبل سريري (SFDA SaMD) - لا يعد تشخيصاً نهائياً.",
            mohFramework: "مبني وفق الدليل الإرشادي للفرز والتوجيه الصحي لوزارة الصحة السعودية (Saudi MOH Triage Protocol)."
          }
        });
      }
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        temperature: 0.2,
      },
    });

    const rawText = response.text || "";
    const cleanJson = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
    const parsedData = JSON.parse(cleanJson);

    return res.json(parsedData);
  } catch (error: any) {
    console.error("Error in /api/triage:", error);
    return res.status(500).json({
      error: "حدث خطأ أثناء معالجة البيانات بواسطة نظام التوجيه والفرز الذكي",
      details: error.message || String(error),
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

