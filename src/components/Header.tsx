import React from "react";
import { Stethoscope, Building2, History, RotateCcw } from "lucide-react";

interface HeaderProps {
  onReset: () => void;
  onOpenHistory: () => void;
  historyCount: number;
}

export const Header: React.FC<HeaderProps> = ({ onReset, onOpenHistory, historyCount }) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md text-slate-800 border-b border-slate-200 shadow-xs">
      <div className="max-w-4xl mx-auto px-4 py-3.5 flex items-center justify-between">
        {/* Brand & Logo */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={onReset}>
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-teal-600 text-white shadow-sm">
            <Building2 className="w-5 h-5 stroke-[2.2]" />
            <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-slate-900 text-[9px] text-white font-bold border border-white">
              <Stethoscope className="w-2.5 h-2.5" />
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-xl text-slate-800 tracking-tight">
                ميدباث <span className="text-teal-600 font-extrabold">MedPath AI</span>
              </h1>
              <span className="text-[11px] font-bold text-teal-600 bg-teal-50 border border-teal-200/60 px-2 py-0.5 rounded-md">
                الفرز الذكي
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">نظام التوجيه والمسار الطبي الفوري</p>
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-2">
          {historyCount > 0 && (
            <button
              onClick={onOpenHistory}
              className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors border border-slate-200 active:scale-95"
              title="السجلات السابقة"
            >
              <History className="w-3.5 h-3.5 text-teal-600" />
              <span className="hidden sm:inline">السجلات</span>
              <span className="bg-teal-600 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                {historyCount}
              </span>
            </button>
          )}

          <button
            onClick={onReset}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white transition-colors shadow-xs active:scale-95"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>جلسة جديدة</span>
          </button>
        </div>
      </div>
    </header>
  );
};

