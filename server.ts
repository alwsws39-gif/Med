import express from "express";
import path from "path";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

const PORT = 3000;

// Initialize Gemini API client lazily or when env exists
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("GEMINI_API_KEY is not defined in environment.");
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
أنت المساعد الذكي لتوجيه وفرز المرضى "MedPath AI" باللغة العربية.
مهمتك الأساسية هي تحليل الشكوى الطبية للمريض، وطرح أسئلة توضيحية متتابعة لمساعدة المريض على توضيح أعراضه، ثم في النهاية توجيهه إلى العيادة والطبيب والتخصص والمسار المناسبين مع إرشادات الانتظار والاحتياطات.

قواعد صارمة جداً:
1. يمنع منعاً باتاً تضمين أي مستويات خطورة (Severity Level)، أو درجات طوارئ (Urgency Score)، أو شارات طوارئ حادة، أو نسب مئوية لليقين التشخيصي. التركيز التام هو على توجيه المريض وإرشاده برفق.
2. جميع النصوص والأسئلة والخيارات والتوصيات يجب أن تكون باللغة العربية الفصحى الواضحة والودودة.
3. عدد الأسئلة المتتابعة يكون من 3 إلى 5 أسئلة قبل التوصية النهائية.
   - إذا كان عدد الأسئلة السابقة أقل من 3، يجب أن تجعل "isLast": false وتولد سؤالاً جديداً خياراته واضحة.
   - إذا بلغ عدد الأسئلة السابقة 3 أو 4 أو 5، وكانت المعلومات كافية جداً لتحديد التخصص والعيادة والمسار المناسبين، اجعل "isLast": true وقدم التوصية والمسار الكاملين.
4. الإجابة يجب أن تكون بصيغة JSON نصرة فقط وبدون أية نصوص خارج كائن الـ JSON.

صيغة JSON عندما يكون isLast يساوي false:
{
  "question": "نص السؤال باللغة العربية",
  "options": [
    "خيار 1",
    "خيار 2",
    "خيار 3",
    "خيار 4"
  ],
  "allowCustomInput": true,
  "isLast": false
}

صيغة JSON عندما يكون isLast يساوي true:
{
  "isLast": true,
  "recommendedTiming": "الموعد المناسب للذهاب (مثال: خلال 24 ساعة أو زيارة العيادة اليوم خلال 3 ساعات)",
  "clinicInfo": {
    "clinicName": "اسم العيادة والتخصص والمركز",
    "doctorName": "اسم الطبيب المقترح والتخصص",
    "clinicFeatures": [
      "ميزة 1",
      "ميزة 2",
      "ميزة 3"
    ],
    "clinicPath": "توجيهات الوصول ومسار العيادة داخل المنشأة"
  },
  "patientGuidance": {
    "whileWaiting": [
      "نصيحة 1 أثناء الانتظار",
      "نصيحة 2 أثناء الانتظار"
    ],
    "thingsToAvoid": [
      "شيء يجب تجنبه 1",
      "شيء يجب تجنبه 2"
    ]
  },
  "disclaimer": "هذا الإرشاد لأغراض التنظيم والتوجيه الطبي فقط، وليس تشخيصاً طبياً نائياً."
}
`;

app.post("/api/triage", async (req, res) => {
  try {
    const { chiefComplaint, history } = req.body;

    if (!chiefComplaint || typeof chiefComplaint !== "string") {
      return res.status(400).json({ error: "الرجاء إدخال الشكوى الأساسية" });
    }

    const historyText = Array.isArray(history) && history.length > 0
      ? history.map((item: any, idx: number) => {
          let ans = item.selectedOption || "";
          if (item.customDetails) {
            ans += ` (${item.customDetails})`;
          }
          return `سؤال ${idx + 1}: ${item.question}\nإجابة المريض: ${ans}`;
        }).join("\n---\n")
      : "لا توجد أسئلة سابقة بعد (هذه البداية).";

    const prompt = `
الشكوى الأساسية الأولية للمريض:
"${chiefComplaint}"

سجل الأسئلة والإجابات السابقة حتى الآن (عدد الأسئلة السابقة: ${Array.isArray(history) ? history.length : 0}):
${historyText}

توجيه: بناءً على الشكوى وعدد الأسئلة السابق (${Array.isArray(history) ? history.length : 0})، قم بتوليد خطوة التوجيه التالية ككائن JSON مطابق للمواصفات دقيقاً.
تذكر: إذا كان عدد الأسئلة السابقة أقل من 3، يجب توليد سؤال توضيحي محدد جديد مع options و allowCustomInput: true و isLast: false.
إذا كان عدد الأسئلة بين 3 و 5 ولديك سياق كافٍ، توليد التوصية النهائية مع isLast: true و clinicInfo و patientGuidance.
`;

    const ai = getGeminiClient();

    if (!ai) {
      // Fallback rule-based simulator if API key is not configured
      const stepCount = Array.isArray(history) ? history.length : 0;
      if (stepCount < 3) {
        const sampleQuestions = [
          {
            question: "منذ متى بدأت تشعر بهذه الأعراض، وهل تزداد في أوقات معينة؟",
            options: ["بدأت منذ عدة ساعات وتزداد تدريجياً", "منذ يومين أو ثلاثة بشكل مستمر", "تأتي على شكل نوبات متقطعة", "أعراض قديمة مستمرة منذ أسابيع"],
            allowCustomInput: true,
            isLast: false,
          },
          {
            question: "هل ترافقت هذه الشكوى مع أي أعراض مصاحبة أخرى؟",
            options: ["ارتفاع خفيف في درجة الحرارة أو غثيان", "إرهاق عام مع صعوبة في النوم", "صداع أو دوخة خفيفة", "لا توجد أعراض أخرى مصاحبة"],
            allowCustomInput: true,
            isLast: false,
          },
          {
            question: "هل تناولت أي أدوية مسكنة أو مضادة للأعراض، وهل خففت الشعور؟",
            options: ["تناولت مسكن خفيف وتحسنت قليلاً", "تناولت دواء ولم يتغير شيء", "لم أتناول أي أدوية بعد", "أتناول أدوية لأمراض مزمنة"],
            allowCustomInput: true,
            isLast: false,
          }
        ];
        return res.json(sampleQuestions[stepCount % sampleQuestions.length]);
      } else {
        return res.json({
          isLast: true,
          recommendedTiming: "زيارة العيادة اليوم خلال 3 إلى 6 ساعات",
          clinicInfo: {
            clinicName: "عيادة الباطنية والجهاز الهضمي - المركز الطبي المتقدم",
            doctorName: "د. محمد العتيبي - استشاري الجهاز الهضمي والعيادات التخصصية",
            clinicFeatures: [
              "توفر فحوصات السونار والتحاليل المباشرة",
              "نظام حجز ميسر بدون انتظار طويل",
              "استشارة متكاملة مع متابعة بعد الزيارة"
            ],
            clinicPath: "البرج الطبي الرئيسي - الدور الثاني - العيادة رقم 204"
          },
          patientGuidance: {
            whileWaiting: [
              "استرح في مكان هادئ وجيد التهوية",
              "اشرب كميات صغيرة من الماء الفاتر عند الحاجة",
              "دون أوقات اشتداد الألم أو ظهور الأعراض لمشاركتها مع الطبيب"
            ],
            thingsToAvoid: [
              "تجنب الوجبات الدسمة أو المأكولات الحارة",
              "لا تتناول مسكنات قوية على معدة فارغة دون استشارة",
              "تجنب المشروبات المنبهة والغازية"
            ]
          },
          disclaimer: "هذا الإرشاد لأغراض التنظيم والتوجيه الطبي فقط، وليس تشخيصاً طبياً نائياً."
        });
      }
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        temperature: 0.3,
      },
    });

    const rawText = response.text || "";
    const cleanJson = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
    const parsedData = JSON.parse(cleanJson);

    return res.json(parsedData);
  } catch (error: any) {
    console.error("Error in /api/triage:", error);
    return res.status(500).json({
      error: "حدث خطأ أثناء معالجة البيانات بواسطة نظام التوجيه الذكي",
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
