import React, { useState } from "react";
import { FinalRecommendationResponse, QAPair } from "../types";
import { generateVisitSummaryPDF, downloadTextSummary, triggerBrowserPrint } from "../utils/pdfGenerator";
import {
  Clock,
  Download,
  Share2,
  RotateCcw,
  Stethoscope,
  Check,
  Ban,
  Printer,
  ShieldCheck,
  AlertOctagon,
  Building,
  PhoneCall,
  CheckCircle2,
  Calendar,
  Sparkles,
  HeartPulse
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

  const isEmergency = recommendation.triageLevel === "LEVEL_1_EMERGENCY";
  const isUrgent = recommendation.triageLevel === "LEVEL_2_URGENT";

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
    let summaryText = `*تقرير الفرز والتوجيه الطبي - MedPath AI*\n`;
    summaryText += `المستوى: ${recommendation.triageLevelLabel}\n`;
    summaryText += `الشكوى: ${chiefComplaint}\n\n`;
    summaryText += `1. التوقيت الموصى به: ${recommendation.appointmentTimeline}\n\n`;
    summaryText += `2. التخصص والعيادة المستهدفة: ${recommendation.targetSpecialty.specialtyName} (${recommendation.targetSpecialty.departmentType})\n`;
    summaryText += `المسار: ${recommendation.targetSpecialty.saudiHealthcareRouting}\n\n`;
    summaryText += `3. إرشادات السلامة ما قبل الاستشارة:\n`;
    summaryText += `ما يجب فعله (DO):\n${recommendation.safetyDirectives.dos.map((d) => `• ${d}`).join("\n")}\n\n`;
    summaryText += `ما يجب تجنبه (DON'T):\n${recommendation.safetyDirectives.donts.map((d) => `• ${d}`).join("\n")}\n\n`;
    summaryText += `4. ملخص سريري للطبيب:\n${recommendation.clinicalSummary.clinicalNotesForPhysician}\n\n`;
    summaryText += `امتثال الأنظمة: متوافق مع لوائح MOH و SDAIA PDPL و SFDA SaMD.`;

    navigator.clipboard.writeText(summaryText);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      {/* Emergency Immediate Action Banner if Level 1 */}
      {isEmergency && (
        <div className="bg-red-600 text-white p-5 rounded-2xl shadow-md mb-6 animate-pulse">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-white/20 rounded-xl shrink-0">
                <AlertOctagon className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="font-extrabold text-lg text-white mb-1">
                  تنبيه أحمر: توجيه فوري لقسم الطوارئ (Level 1 Emergency)
                </h3>
                <p className="text-xs text-red-100 leading-relaxed font-medium">
                  وفق معايير وزارة الصحة وهيئة الغذاء والدواء، تتطلب الأعراض فحصاً إسعافياً عاجلاً. لا تقم بالقيادة بنفسك.
                </p>
              </div>
            </div>
            <a
              href="tel:997"
              className="shrink-0 bg-white text-red-700 font-extrabold text-xs px-4 py-2.5 rounded-xl shadow hover:bg-red-50 flex items-center gap-1.5 transition-transform active:scale-95"
            >
              <PhoneCall className="w-4 h-4" />
              <span>اتصل بالإسعاف (997)</span>
            </a>
          </div>
        </div>
      )}

      {/* Main Report Container Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-6">
        {/* Step Header */}
        <div className="p-5 border-b border-slate-100 flex flex-wrap justify-between items-center bg-slate-50/70 gap-3">
          <div className="flex items-center gap-2">
            <span
              className={`text-xs font-bold px-3 py-1 rounded-lg border ${
                isEmergency
                  ? "bg-red-50 border-red-200 text-red-700"
                  : isUrgent
                  ? "bg-amber-50 border-amber-200 text-amber-800"
                  : "bg-teal-50 border-teal-200 text-teal-800"
              }`}
            >
              {recommendation.triageLevelLabel}
            </span>
            <span className="text-[11px] font-semibold text-slate-500 bg-white border border-slate-200 px-2.5 py-0.5 rounded-md">
              معايير MOH السعودية
            </span>
          </div>

          <div className="flex gap-2">
            <button
              onClick={triggerBrowserPrint}
              className="py-1.5 px-3 rounded-lg bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-all border border-slate-200 flex items-center gap-1.5 shadow-xs"
              title="طباعة التقرير"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">طباعة</span>
            </button>
            <button
              onClick={handleCopySummary}
              className="py-1.5 px-3 rounded-lg bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-all border border-slate-200 flex items-center gap-1.5 shadow-xs"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5 text-slate-500" />}
              <span>{copied ? "تم النسخ" : "مشاركة"}</span>
            </button>
          </div>
        </div>

        {/* Printable/Exportable Content Card Body */}
        <div id="summary-report-card" className="p-6 space-y-6">
          
          {/* Header Badge inside Report */}
          <div className="border-b border-slate-100 pb-4">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span className="font-bold text-teal-700 flex items-center gap-1">
                <HeartPulse className="w-4 h-4 text-teal-600" />
                <span>MedPath AI • تقرير الفرز والتوجيه الطبي السريري</span>
              </span>
              <span className="text-[11px]">{new Date().toLocaleDateString("ar-SA", { year: "numeric", month: "short", day: "numeric" })}</span>
            </div>
            <p className="text-xs text-slate-600">
              تقرير ما قبل الاستشارة معد وفق معايير اللوائح الصحية الرقمية بالمملكة العربية السعودية (MOH / SDAIA / SFDA)
            </p>
          </div>

          {/* COMPONENT 1: Recommended Appointment Timeline */}
          <div>
            <h4 className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-slate-100 border border-slate-300 text-slate-700 flex items-center justify-center text-[11px] font-bold">1</span>
              <span>الموعد الزمني الموصى به للمراجعة (Recommended Appointment Timeline)</span>
            </h4>
            <div
              className={`p-4 rounded-xl border flex items-start gap-3.5 ${
                isEmergency
                  ? "bg-red-50/80 border-red-200 text-red-900"
                  : isUrgent
                  ? "bg-amber-50/80 border-amber-200 text-amber-900"
                  : "bg-teal-50/80 border-teal-200 text-teal-900"
              }`}
            >
              <Clock className={`w-5 h-5 shrink-0 mt-0.5 ${isEmergency ? "text-red-600" : isUrgent ? "text-amber-600" : "text-teal-600"}`} />
              <div>
                <span className="text-xs block font-bold mb-0.5 opacity-80">التوقيت الموصى به:</span>
                <span className="font-extrabold text-base block">{recommendation.appointmentTimeline}</span>
              </div>
            </div>
          </div>

          {/* COMPONENT 2: Target Medical Clinic / Specialty */}
          <div>
            <h4 className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-slate-100 border border-slate-300 text-slate-700 flex items-center justify-center text-[11px] font-bold">2</span>
              <span>العيادة والتخصص الطبي المستهدف (Target Medical Specialty)</span>
            </h4>
            <div className="p-5 bg-slate-50/80 border border-slate-200 rounded-xl space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/80 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-teal-600 text-white flex items-center justify-center shrink-0">
                    <Stethoscope className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500 font-semibold block">التخصص المستهدف:</span>
                    <span className="font-bold text-base text-slate-900">{recommendation.targetSpecialty.specialtyName}</span>
                  </div>
                </div>
                <span className="text-xs bg-white border border-slate-200 text-slate-700 px-3 py-1 rounded-lg font-medium self-start sm:self-auto">
                  {recommendation.targetSpecialty.departmentType}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="bg-white p-3 rounded-lg border border-slate-200/70 text-xs">
                  <span className="font-bold text-teal-800 block mb-1 flex items-center gap-1">
                    <Building className="w-3.5 h-3.5 text-teal-600" />
                    <span>المسار بالمنظومة السعودية:</span>
                  </span>
                  <p className="text-slate-600 leading-relaxed font-medium">{recommendation.targetSpecialty.saudiHealthcareRouting}</p>
                </div>

                <div className="bg-white p-3 rounded-lg border border-slate-200/70 text-xs">
                  <span className="font-bold text-slate-800 block mb-1 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>نطاق الفحص السريري المتوقع:</span>
                  </span>
                  <p className="text-slate-600 leading-relaxed">{recommendation.targetSpecialty.clinicalFocus}</p>
                </div>
              </div>
            </div>
          </div>

          {/* COMPONENT 3: Pre-Consultation Safety Directives (DO & DON'T) */}
          <div>
            <h4 className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-slate-100 border border-slate-300 text-slate-700 flex items-center justify-center text-[11px] font-bold">3</span>
              <span>إرشادات السلامة ما قبل الاستشارة (Pre-Consultation Safety Directives)</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* DO Directives */}
              <div className="p-4 bg-emerald-50/60 border border-emerald-200/80 rounded-xl">
                <h5 className="text-xs font-bold text-emerald-800 mb-2.5 flex items-center gap-1.5">
                  <span className="px-2 py-0.5 bg-emerald-600 text-white rounded text-[10px] font-extrabold">DO</span>
                  <span>ما يجب فعله أثناء الانتظار:</span>
                </h5>
                <ul className="text-xs text-slate-700 space-y-2 pr-1 leading-relaxed">
                  {recommendation.safetyDirectives.dos.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 mt-1.5"></span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* DON'T Directives */}
              <div className="p-4 bg-rose-50/60 border border-rose-200/80 rounded-xl">
                <h5 className="text-xs font-bold text-rose-800 mb-2.5 flex items-center gap-1.5">
                  <span className="px-2 py-0.5 bg-rose-600 text-white rounded text-[10px] font-extrabold">DON'T</span>
                  <span>ما يجب تجنبه والامتناع عنه:</span>
                </h5>
                <ul className="text-xs text-slate-700 space-y-2 pr-1 leading-relaxed">
                  {recommendation.safetyDirectives.donts.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Ban className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* COMPONENT 4: Printable Clinical Summary for Physician */}
          <div className="border border-slate-200 bg-slate-50/60 rounded-xl p-5">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-3">
              <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-800 flex items-center justify-center text-[11px] font-bold">4</span>
                <span>الملخص السريري للطبيب المعالج (Printable Clinical Summary)</span>
              </h4>
              <span className="text-[10px] font-mono bg-white border border-slate-200 px-2 py-0.5 rounded text-slate-500">
                جاهز للطباعة والمشاركة
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-white p-3 rounded-lg border border-slate-200/70">
                <span className="font-bold text-slate-900 block mb-1">الشكوى الأولية (Chief Complaint):</span>
                <p className="text-slate-700 leading-relaxed font-medium">"{recommendation.clinicalSummary.chiefComplaintSummary}"</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-white p-3 rounded-lg border border-slate-200/70">
                  <span className="font-bold text-slate-900 block mb-1">التسلسل الزمني وتطور الأعراض (HPI):</span>
                  <p className="text-slate-600 leading-relaxed">{recommendation.clinicalSummary.hpiTimeline}</p>
                </div>

                <div className="bg-white p-3 rounded-lg border border-slate-200/70">
                  <span className="font-bold text-slate-900 block mb-1">الأعراض المرصودة ونفي الخطورة:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {recommendation.clinicalSummary.reportedSymptoms.map((sym, idx) => (
                      <span key={idx} className="bg-slate-100 text-slate-700 text-[11px] px-2 py-0.5 rounded border border-slate-200">
                        {sym}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-blue-50/70 border border-blue-100 p-3.5 rounded-lg">
                <span className="font-bold text-blue-900 block mb-1 flex items-center gap-1">
                  <Stethoscope className="w-3.5 h-3.5 text-blue-600" />
                  <span>ملاحظات الفرز الموجهة للطبيب المعالج:</span>
                </span>
                <p className="text-slate-700 leading-relaxed font-mono text-[11px]">
                  {recommendation.clinicalSummary.clinicalNotesForPhysician}
                </p>
              </div>
            </div>
          </div>

          {/* Regulatory Compliance & Data Privacy Footer Notice */}
          <div className="p-4 bg-slate-100/70 border border-slate-200 rounded-xl space-y-2 text-[11px] text-slate-600">
            <div className="flex items-center gap-2 font-bold text-slate-800">
              <ShieldCheck className="w-4 h-4 text-teal-600" />
              <span>الامتثال للأنظمة واللوائح الصحية الرقمية السعودية:</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-slate-500 pt-1">
              <div className="bg-white p-2 rounded border border-slate-200/80">
                <span className="font-bold text-slate-700 block text-[10px] mb-0.5">SDAIA PDPL:</span>
                <p className="leading-snug">{recommendation.regulatoryCompliance.sdaiaPdplNotice}</p>
              </div>
              <div className="bg-white p-2 rounded border border-slate-200/80">
                <span className="font-bold text-slate-700 block text-[10px] mb-0.5">SFDA SaMD:</span>
                <p className="leading-snug">{recommendation.regulatoryCompliance.sfdaSamdNotice}</p>
              </div>
              <div className="bg-white p-2 rounded border border-slate-200/80">
                <span className="font-bold text-slate-700 block text-[10px] mb-0.5">Saudi MOH Guidelines:</span>
                <p className="leading-snug">{recommendation.regulatoryCompliance.mohFramework}</p>
              </div>
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/60 flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={handleDownloadPDF}
            disabled={isExporting}
            className="w-full sm:w-auto flex-1 py-3 px-5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2 active:scale-[0.99]"
          >
            {isExporting ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            <span>تحميل التقرير والملخص الطبي للزيارة (PDF)</span>
          </button>

          <button
            onClick={triggerBrowserPrint}
            className="w-full sm:w-auto py-3 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs border border-slate-200 transition-all flex items-center justify-center gap-2 active:scale-[0.99]"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>طباعة</span>
          </button>

          <button
            onClick={onReset}
            className="w-full sm:w-auto py-3 px-5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-all flex items-center justify-center gap-2 active:scale-[0.99]"
          >
            <RotateCcw className="w-4 h-4" />
            <span>تقييم حالة جديدة</span>
          </button>
        </div>
      </div>
    </div>
  );
};

