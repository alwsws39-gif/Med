import React from "react";
import { MessageSquareText, HelpCircle, Compass, CheckCircle2 } from "lucide-react";

interface ProgressBarProps {
  currentStep: "complaint" | "questions" | "result";
  questionIndex?: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ currentStep, questionIndex = 0 }) => {
  const steps = [
    { id: "complaint", label: "الشكوى الأساسية", icon: MessageSquareText },
    { id: "questions", label: "أسئلة التوضيح", icon: HelpCircle },
    { id: "result", label: "التوجيه والمسار", icon: Compass },
  ];

  const getStepStatus = (stepId: string) => {
    if (stepId === "complaint") {
      return currentStep === "complaint" ? "current" : "completed";
    }
    if (stepId === "questions") {
      if (currentStep === "complaint") return "upcoming";
      if (currentStep === "questions") return "current";
      return "completed";
    }
    if (stepId === "result") {
      return currentStep === "result" ? "current" : "upcoming";
    }
    return "upcoming";
  };

  return (
    <div className="bg-white border-b border-slate-200/80 py-3 px-4 shadow-2xs">
      <div className="max-w-xl mx-auto flex items-center justify-between relative">
        {/* Background Connecting Bar */}
        <div className="absolute top-1/2 left-8 right-8 -translate-y-1/2 h-1 bg-slate-100 rounded-full z-0" />
        
        {/* Progress active bar overlay */}
        <div
          className="absolute top-1/2 right-8 -translate-y-1/2 h-1 bg-teal-600 rounded-full z-0 transition-all duration-500 ease-out"
          style={{
            width:
              currentStep === "complaint"
                ? "0%"
                : currentStep === "questions"
                ? "50%"
                : "100%",
          }}
        />

        {steps.map((step) => {
          const status = getStepStatus(step.id);
          const Icon = step.icon;

          return (
            <div key={step.id} className="relative z-10 flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs transition-all duration-300 ${
                  status === "completed"
                    ? "bg-teal-600 text-white shadow-2xs"
                    : status === "current"
                    ? "bg-slate-800 text-teal-300 ring-4 ring-teal-50 shadow-xs"
                    : "bg-slate-100 text-slate-400"
                }`}
              >
                {status === "completed" ? (
                  <CheckCircle2 className="w-4 h-4 text-white" />
                ) : (
                  <Icon className="w-3.5 h-3.5" />
                )}
              </div>
              <span
                className={`text-[11px] mt-1 font-semibold transition-colors ${
                  status === "current"
                    ? "text-slate-800 font-bold"
                    : status === "completed"
                    ? "text-teal-700"
                    : "text-slate-400"
                }`}
              >
                {step.label}
                {step.id === "questions" && currentStep === "questions" && (
                  <span className="text-[10px] block text-center text-teal-600 font-medium">
                    (سؤال {questionIndex + 1})
                  </span>
                )}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
