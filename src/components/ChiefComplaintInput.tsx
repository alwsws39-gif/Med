import React, { useState } from "react";
import { MessageSquarePlus, Sparkles, AlertCircle, ArrowLeft, HeartPulse, Stethoscope } from "lucide-react";

interface ChiefComplaintInputProps {
  onSubmit: (complaint: string) => void;
  isLoading: boolean;
}

export const ChiefComplaintInput: React.FC<ChiefComplaintInputProps> = ({ onSubmit, isLoading }) => {
  const [text, setText] = useState("");

  const sampleComplaints = [
    "عندي ألم في المعدة من أمس بعد الأكل وبدأ يزيد اليوم مع غثيان خفيف",
    "صداع مستمر في الجهة اليمنى من الراس مع زغللة بسيطة في العين",
    "ألم حاد في الأسنان يمتد للأذن والفك والرقبة",
    "سعال جاف وضيق تنفس خفيف مع حرارة طفيفة منذ يومين",
    "ألم أسفل الظهر يشتد مع الحركة والجلوس لفترات طويلة"
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || isLoading) return;
    onSubmit(text.trim());
  };

  const handleSelectSample = (sample: string) => {
    setText(sample);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Step Container Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col mb-6 overflow-hidden">
        {/* Step Header */}
        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <span className="text-xs font-bold text-teal-600 bg-teal-50 border border-teal-200/50 px-3 py-1 rounded-md">
            المرحلة 1: الوصف الأولي للشكوى
          </span>
          <div className="flex gap-1.5 items-center">
            <div className="w-2.5 h-2.5 rounded-full bg-teal-600"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-slate-200"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-slate-200"></div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6">
          <div className="flex items-start gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center shrink-0 text-teal-600">
              <HeartPulse className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800 tracking-tight mb-1">أهلاً بك، صف لنا حالتك الطبية</h2>
              <p className="text-xs text-slate-500 leading-relaxed">
                تحدث بحرية عما تشعر به، متى بدأ الألم وأين يتركز؟ سيقوم الذكاء الاصطناعي بتوليد أسئلة توضيحية لتوجيهك.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="chief-complaint" className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <MessageSquarePlus className="w-3.5 h-3.5 text-teal-600" />
                <span>الشكوى أو الأعراض التي تشعر بها:</span>
              </label>
              <span className="text-[11px] text-slate-400 font-medium">كتابة حرّة</span>
            </div>

            <div className="relative mb-5">
              <textarea
                id="chief-complaint"
                rows={4}
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="عندي ألم في المعدة من أمس بعد الأكل وبدأ يزيد اليوم بشكل ملحوظ خاصة عند الضغط..."
                disabled={isLoading}
                className="w-full p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-sm leading-relaxed placeholder:text-slate-400 focus:bg-white focus:border-teal-600 focus:ring-2 focus:ring-teal-600/10 transition-all outline-none resize-none"
              />
              {text.length > 0 && (
                <span className="absolute left-3 bottom-3 text-[10px] text-slate-400 bg-white border border-slate-200 px-2 py-0.5 rounded-md font-mono">
                  {text.length} حرف
                </span>
              )}
            </div>

            {/* Quick Sample Suggestions */}
            <div className="mb-6">
              <p className="text-xs font-bold text-slate-600 mb-2 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>أمثلة سريعة لشكاوى شائعة (اضغط للتجربة):</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {sampleComplaints.map((sample, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectSample(sample)}
                    disabled={isLoading}
                    className="text-right text-xs bg-slate-50 hover:bg-teal-50 hover:text-teal-800 hover:border-teal-300 text-slate-700 px-3 py-2 rounded-xl transition-all border border-slate-200 active:scale-95 leading-snug"
                  >
                    "{sample}"
                  </button>
                ))}
              </div>
            </div>

            {/* Informative Notice */}
            <div className="bg-blue-50/80 border border-blue-100 rounded-xl p-3.5 mb-6 text-xs text-blue-900 flex items-start gap-2.5">
              <Stethoscope className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                سيقوم النظام بطرح <strong>3 إلى 5 أسئلة توضيحية</strong> خفيفة لتحديد العيادة والطبيب والمسار المناسبين بوضوح.
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!text.trim() || isLoading}
              className="w-full py-3.5 px-6 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 active:scale-[0.99]"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>جاري تحليل الشكوى وتحضير الأسئلة التوضيحية...</span>
                </>
              ) : (
                <>
                  <span>بدء التحليل الذكي ومتابعة الأسئلة</span>
                  <ArrowLeft className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Safety Disclaimer */}
      <div className="text-center text-slate-400 text-xs flex items-center justify-center gap-1.5">
        <AlertCircle className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <span>هذا الإرشاد لأغراض التنظيم والتوجيه الطبي فقط، وليس تشخيصاً طبياً نائياً.</span>
      </div>
    </div>
  );
};

