import React, { useState } from "react";
import { FinalRecommendationResponse, QAPair } from "../types";
import { generateVisitSummaryPDF, downloadTextSummary } from "../utils/pdfGenerator";
import {
  Building2,
  Clock,
  UserCheck,
  CheckCircle2,
  Navigation,
  Sparkles,
  ShieldAlert,
  FileText,
  Download,
  Share2,
  RotateCcw,
  Stethoscope,
  Info,
  Check,
  Ban,
  MapPin,
  CalendarCheck
} from "lucide-react";

interface FinalRecommendationProps {
  recommendation: FinalRecommendationResponse;
  chiefComplaint: string;
  history: QAPair[];
  onReset: () => void;
}

export const FinalRecommendation: React.FC<FinalRecommendationProps> = ({
  recommendation,
  chiefComplaint,
  history,
  onReset,
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleDownloadPDF = async () => {
    setIsExporting(true);
    try {
      await generateVisitSummaryPDF("summary-report-card", chiefComplaint, history, recommendation);
    } catch (e) {
      console.error(e);
      downloadTextSummary(chiefComplaint, history, recommendation);
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopySummary = () => {
    let summaryText = `*ملخص التوجيه الطبي - MedPath AI*\n`;
    summaryText += `الشكوى الأساسية: ${chiefComplaint}\n\n`;
    summaryText += `الموعد المناسب: ${recommendation.recommendedTiming}\n`;
    summaryText += `العيادة: ${recommendation.clinicInfo.clinicName}\n`;
    summaryText += `الطبيب: ${recommendation.clinicInfo.doctorName}\n`;
    summaryText += `المسار: ${recommendation.clinicInfo.clinicPath}\n\n`;
    summaryText += `إرشادات أثناء الانتظار:\n${recommendation.patientGuidance.whileWaiting.map((w) => `- ${w}`).join("\n")}\n\n`;
    summaryText += `أمور يجب تجنبها:\n${recommendation.patientGuidance.thingsToAvoid.map((a) => `- ${a}`).join("\n")}`;

    navigator.clipboard.writeText(summaryText);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Container Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm mb-6 overflow-hidden">
        {/* Step Header */}
        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <span className="text-xs font-bold text-teal-600 bg-teal-50 border border-teal-200/50 px-3 py-1 rounded-md">
            المرحلة 3: النتيجة والتوجيه العيادي
          </span>
          <div className="flex gap-1.5 items-center">
            <div className="w-2.5 h-2.5 rounded-full bg-teal-200"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-teal-200"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-teal-600"></div>
          </div>
        </div>

        {/* Action Header bar for export */}
        <div className="p-4 bg-slate-50/80 border-b border-slate-200/60 flex flex-wrap items-center gap-2">
          <button
            onClick={handleDownloadPDF}
            disabled={isExporting}
            className="flex-1 py-3 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs transition-all shadow-xs flex items-center justify-center gap-2 active:scale-[0.98]"
          >
            {isExporting ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            <span>تحميل ملخص الزيارة للمشاركة مع الطبيب (PDF)</span>
          </button>

          <button
            onClick={handleCopySummary}
            className="py-3 px-3.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-all border border-slate-200 flex items-center gap-1.5"
            title="نسخ ملخص نصي"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4 text-slate-500" />}
            <span className="hidden sm:inline">{copied ? "تم النسخ" : "مشاركة"}</span>
          </button>
        </div>

        {/* Printable / Downloadable Content Container */}
        <div id="summary-report-card" className="p-6 space-y-6">
          
          {/* 1. Appointment Timing Card */}
          <div>
            <h4 className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide">1. الموعد المناسب للذهاب</h4>
            <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-xl flex items-center gap-3">
              <Clock className="w-5 h-5 text-amber-600 shrink-0" />
              <div>
                <span className="text-xs text-amber-700 block font-medium">التوقيت الموصى به للمراجعة:</span>
                <span className="font-bold text-base text-slate-900">{recommendation.recommendedTiming}</span>
              </div>
            </div>
          </div>

          {/* 2. Clinic & Doctor Recommendation Card */}
          <div>
            <h4 className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide">2. العيادة والطبيب</h4>
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <div className="font-bold text-teal-800 text-base flex items-center gap-2">
                <Building2 className="w-4 h-4 text-teal-600" />
                <span>{recommendation.clinicInfo.clinicName}</span>
              </div>
              <div className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-blue-600" />
                <span>{recommendation.clinicInfo.doctorName}</span>
              </div>
              
              <div className="mt-2 flex flex-wrap gap-1.5 pt-2 border-t border-slate-200/60">
                {recommendation.clinicInfo.clinicFeatures.map((feat, idx) => (
                  <span key={idx} className="text-[11px] bg-white border border-slate-200 px-2.5 py-1 rounded-md text-slate-600 font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>{feat}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* 3. Clinic Path / Directions Card */}
          <div>
            <h4 className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide">3. توجيهات الوصول ومسار العيادة</h4>
            <div className="text-sm text-slate-700 bg-blue-50 border border-blue-100 p-4 rounded-xl flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <span className="font-medium leading-relaxed">{recommendation.clinicInfo.clinicPath}</span>
            </div>
          </div>

          {/* 4. Patient Guidance: While Waiting & Things to Avoid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
              <h4 className="text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-600" />
                <span>ماذا تفعل أثناء الانتظار</span>
              </h4>
              <ul className="text-xs text-slate-600 space-y-1.5 pr-4 list-disc leading-relaxed">
                {recommendation.patientGuidance.whileWaiting.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
              <h4 className="text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
                <Ban className="w-3.5 h-3.5 text-amber-600" />
                <span>ماذا تتجنب الآن</span>
              </h4>
              <ul className="text-xs text-slate-600 space-y-1.5 pr-4 list-disc leading-relaxed">
                {recommendation.patientGuidance.thingsToAvoid.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Patient Initial Input Summary Log */}
          <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl">
            <h4 className="text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-500" />
              <span>ملخص الشكوى المقدمة:</span>
            </h4>
            <div className="text-xs text-slate-700 space-y-1.5">
              <p><span className="font-bold text-slate-900">الشكوى الأولية:</span> "{chiefComplaint}"</p>
              {history.length > 0 && (
                <div className="pt-2 border-t border-slate-200">
                  <span className="font-bold text-slate-900 block mb-1">الإجابات التوضيحية:</span>
                  <ul className="space-y-1 text-slate-600">
                    {history.map((qa, i) => (
                      <li key={i}>• {qa.question} ← <span className="font-semibold text-slate-900">{qa.selectedOption}</span></li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Medical Disclaimer */}
          <div className="bg-slate-100 border border-slate-200 rounded-xl p-3.5 text-xs text-slate-500 flex items-start gap-2">
            <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              {recommendation.disclaimer || "هذا الإرشاد لأغراض التنظيم والتوجيه الطبي فقط، وليس تشخيصاً طبياً نائياً."}
            </p>
          </div>

        </div>

        {/* Card Footer Actions */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={handleDownloadPDF}
            disabled={isExporting}
            className="w-full sm:w-auto flex-1 py-3 px-5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2 active:scale-[0.99]"
          >
            <Download className="w-4 h-4" />
            <span>تحميل ملخص الزيارة لمشاركته مع الطبيب</span>
          </button>

          <button
            onClick={onReset}
            className="w-full sm:w-auto py-3 px-5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-all flex items-center justify-center gap-2 active:scale-[0.99]"
          >
            <RotateCcw className="w-4 h-4" />
            <span>بدء فرز جديد</span>
          </button>
        </div>
      </div>
    </div>
  );
};
