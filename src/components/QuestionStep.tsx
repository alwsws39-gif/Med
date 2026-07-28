import React, { useState } from "react";
import { QuestionResponse, QAPair } from "../types";
import { HelpCircle, PenLine, ArrowLeft, ArrowRight, Check, MessageCircle, AlertCircle } from "lucide-react";

interface QuestionStepProps {
  questionData: QuestionResponse;
  questionIndex: number;
  totalQuestionsEstimated?: number;
  onSubmitAnswer: (selectedOption: string, customDetails?: string) => void;
  onBack: () => void;
  isLoading: boolean;
  chiefComplaint: string;
  previousHistory: QAPair[];
}

export const QuestionStep: React.FC<QuestionStepProps> = ({
  questionData,
  questionIndex,
  onSubmitAnswer,
  onBack,
  isLoading,
  chiefComplaint,
  previousHistory,
}) => {
  const [selectedOption, setSelectedOption] = useState<string>("");
  const [isCustomSelected, setIsCustomSelected] = useState<boolean>(false);
  const [customText, setCustomText] = useState<string>("");

  const handleSelectChoice = (opt: string) => {
    setSelectedOption(opt);
    setIsCustomSelected(false);
  };

  const handleSelectCustom = () => {
    setIsCustomSelected(true);
    setSelectedOption("أخرى / كتابة تفاصيل خاصة");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    const finalOption = isCustomSelected
      ? customText.trim() ? `تفاصيل خاصة: ${customText.trim()}` : "أخرى / تفاصيل إضافية"
      : selectedOption;

    if (!finalOption) return;

    onSubmitAnswer(finalOption, isCustomSelected ? customText : undefined);
  };

  const isSubmitDisabled = isLoading || (!selectedOption && !isCustomSelected) || (isCustomSelected && !customText.trim());

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Context Badge Summary */}
      <div className="bg-slate-100/80 border border-slate-200/80 rounded-2xl p-3.5 mb-5 text-xs text-slate-700 flex items-center justify-between">
        <div className="flex items-center gap-2 overflow-hidden">
          <MessageCircle className="w-4 h-4 text-teal-600 shrink-0" />
          <span className="font-semibold text-slate-900 shrink-0">الشكوى:</span>
          <span className="truncate text-slate-600">"{chiefComplaint}"</span>
        </div>
        <span className="bg-slate-200 text-slate-700 px-2.5 py-0.5 rounded-full font-bold text-[10px] shrink-0">
          خطوة {questionIndex + 1}
        </span>
      </div>

      {/* Question Container Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm mb-6 overflow-hidden">
        {/* Step Header */}
        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <span className="text-xs font-bold text-teal-600 bg-teal-50 border border-teal-200/50 px-3 py-1 rounded-md">
            المرحلة 2: تقييم الأعراض والتفاصيل (سؤال {questionIndex + 1})
          </span>
          <div className="flex gap-1.5 items-center">
            <div className="w-2.5 h-2.5 rounded-full bg-teal-200"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-teal-600"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-slate-200"></div>
          </div>
        </div>

        <div className="p-6">
          {/* Question Title */}
          <div className="mb-6">
            <h3 className="text-base font-bold text-slate-800 leading-snug">
              {questionData.question}
            </h3>
          </div>

          {/* Options List */}
          <div className="space-y-3 mb-6">
            {questionData.options.map((option, idx) => {
              const isSelected = selectedOption === option && !isCustomSelected;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectChoice(option)}
                  className={`w-full text-right p-4 rounded-xl border-2 transition-all flex items-center justify-between gap-3 active:scale-[0.99] ${
                    isSelected
                      ? "border-teal-600 bg-teal-50 text-slate-900 shadow-xs font-semibold"
                      : "border-slate-100 hover:border-teal-500 bg-white text-slate-700 font-medium"
                  }`}
                >
                  <span className="text-sm leading-relaxed">{option}</span>
                  <div
                    className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                      isSelected ? "border-teal-600 bg-teal-600 text-white" : "border-slate-300 bg-white"
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                </button>
              );
            })}

            {/* CRITICAL FEATURE: Dedicated Custom Input Option */}
            <div
              onClick={handleSelectCustom}
              className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                isCustomSelected
                  ? "border-teal-600 bg-teal-50/80 shadow-xs"
                  : "border-slate-100 hover:border-teal-500 bg-white"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2 text-sm font-bold text-teal-800">
                  <PenLine className="w-4 h-4 text-teal-600" />
                  <span>أخرى / كتابة تفاصيل خاصة بكلماتك...</span>
                </div>
                <div
                  className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                    isCustomSelected ? "border-teal-600 bg-teal-600 text-white" : "border-slate-300 bg-white"
                  }`}
                >
                  {isCustomSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
              </div>

              {isCustomSelected && (
                <div className="mt-3 pt-2 border-t border-teal-200">
                  <textarea
                    rows={2}
                    value={customText}
                    onChange={(e) => setCustomText(e.target.value)}
                    placeholder="اكتب أية تفاصيل إضافية غير مذكورة بالأعلى هنا..."
                    className="w-full p-3 rounded-lg border border-slate-300 bg-white text-xs text-slate-800 focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600"
                    autoFocus
                  />
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-2">
            {questionIndex > 0 && (
              <button
                type="button"
                onClick={onBack}
                disabled={isLoading}
                className="py-3 px-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs transition-all flex items-center gap-1.5 shrink-0"
              >
                <ArrowRight className="w-4 h-4" />
                <span>السابق</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitDisabled}
              className="flex-1 py-3.5 px-6 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-xs disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 active:scale-[0.99]"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>جاري معالجة الإجابة والتحليل...</span>
                </>
              ) : (
                <>
                  <span>تأكيد الإجابة والمتابعة</span>
                  <ArrowLeft className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Dynamic Questions History Summary Accordion/Preview */}
      {previousHistory.length > 0 && (
        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 text-xs">
          <p className="font-bold text-slate-800 mb-2.5">الإجابات السابقة المعتمدة:</p>
          <div className="space-y-2">
            {previousHistory.map((item, idx) => (
              <div key={idx} className="bg-white p-2.5 rounded-xl border border-slate-200/60 flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <div className="overflow-hidden">
                  <p className="text-slate-500 truncate">{item.question}</p>
                  <p className="font-semibold text-slate-900">{item.selectedOption}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
