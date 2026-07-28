import React from "react";
import { TriageSession } from "../types";
import { X, History, Trash2, Calendar, ChevronLeft, ArrowLeftRight } from "lucide-react";

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: TriageSession[];
  onSelectSession: (session: TriageSession) => void;
  onClearHistory: () => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  sessions,
  onSelectSession,
  onClearHistory,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/60 backdrop-blur-xs transition-opacity">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between overflow-hidden animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-700 flex items-center justify-between bg-slate-800 text-white">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-teal-400" />
            <h3 className="font-bold text-base">سجلات الفرز السابقة</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-700 hover:bg-slate-600 flex items-center justify-center text-slate-300 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* List of Sessions */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {sessions.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              <History className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>لا توجد سجلات فرز سابقة حتى الآن.</p>
            </div>
          ) : (
            sessions.map((sess) => (
              <div
                key={sess.id}
                onClick={() => {
                  onSelectSession(sess);
                  onClose();
                }}
                className="bg-slate-50 hover:bg-teal-50/60 p-4 rounded-2xl border border-slate-200/80 transition-all cursor-pointer group hover:border-teal-300"
              >
                <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1.5">
                  <span className="flex items-center gap-1 font-medium text-slate-500">
                    <Calendar className="w-3 h-3 text-teal-600" />
                    {new Date(sess.createdAt).toLocaleDateString("ar-SA", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  <span className="text-teal-700 font-semibold group-hover:translate-x-[-2px] transition-transform flex items-center gap-0.5">
                    <span>عرض</span>
                    <ChevronLeft className="w-3 h-3" />
                  </span>
                </div>

                <p className="text-xs font-bold text-slate-900 line-clamp-2 leading-relaxed">
                  "{sess.chiefComplaint}"
                </p>

                <div className="mt-2 text-[10px] text-slate-500 bg-white px-2.5 py-1 rounded-lg border border-slate-200/60 inline-block font-medium">
                  {sess.history.length} أسئلة توضيحية
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Actions */}
        {sessions.length > 0 && (
          <div className="p-4 border-t border-slate-100 bg-slate-50">
            <button
              onClick={onClearHistory}
              className="w-full py-2.5 px-4 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>مسح جميع السجلات</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
