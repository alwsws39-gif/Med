/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Header } from "./components/Header";
import { ProgressBar } from "./components/ProgressBar";
import { ChiefComplaintInput } from "./components/ChiefComplaintInput";
import { QuestionStep } from "./components/QuestionStep";
import { FinalRecommendation } from "./components/FinalRecommendation";
import { HistoryDrawer } from "./components/HistoryDrawer";
import {
  QuestionResponse,
  FinalRecommendationResponse,
  TriageResponse,
  QAPair,
  TriageSession,
} from "./types";
import { AlertCircle, RefreshCw } from "lucide-react";

export default function App() {
  const [currentStep, setCurrentStep] = useState<"complaint" | "questions" | "result">("complaint");
  const [chiefComplaint, setChiefComplaint] = useState<string>("");
  const [history, setHistory] = useState<QAPair[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<QuestionResponse | null>(null);
  const [finalRecommendation, setFinalRecommendation] = useState<FinalRecommendationResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // History Drawer state & localStorage
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [savedSessions, setSavedSessions] = useState<TriageSession[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("medpath_ai_history");
      if (stored) {
        setSavedSessions(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to load history from localStorage", e);
    }
  }, []);

  const saveSessionToStorage = (
    complaintText: string,
    historyList: QAPair[],
    rec: FinalRecommendationResponse
  ) => {
    try {
      const newSession: TriageSession = {
        id: Date.now().toString(),
        chiefComplaint: complaintText,
        history: historyList,
        createdAt: new Date().toISOString(),
      };
      const updated = [newSession, ...savedSessions];
      setSavedSessions(updated);
      localStorage.setItem("medpath_ai_history", JSON.stringify(updated));
    } catch (e) {
      console.error("Failed to save session to localStorage", e);
    }
  };

  const clearHistory = () => {
    setSavedSessions([]);
    localStorage.removeItem("medpath_ai_history");
    setIsHistoryOpen(false);
  };

  // Submit Initial Chief Complaint
  const handleStartTriage = async (complaintText: string) => {
    setChiefComplaint(complaintText);
    setHistory([]);
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch("/api/triage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chiefComplaint: complaintText,
          history: [],
        }),
      });

      if (!res.ok) {
        throw new Error("فشل الاتصال بخدمة التوجيه والفرز الذكي");
      }

      const data: TriageResponse = await res.json();

      if (data.isLast) {
        setFinalRecommendation(data);
        setCurrentStep("result");
        saveSessionToStorage(complaintText, [], data);
      } else {
        setCurrentQuestion(data);
        setCurrentStep("questions");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "حدث خطأ أثناء التواصل مع النظام الذكي. يرجى إعادة المحاولة.");
    } finally {
      setIsLoading(false);
    }
  };

  // Submit Answer for Current Question Step
  const handleSubmitAnswer = async (selectedOption: string, customDetails?: string) => {
    if (!currentQuestion) return;

    const newQA: QAPair = {
      question: currentQuestion.question,
      selectedOption,
      customDetails,
    };

    const updatedHistory = [...history, newQA];
    setHistory(updatedHistory);
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch("/api/triage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chiefComplaint,
          history: updatedHistory,
        }),
      });

      if (!res.ok) {
        throw new Error("فشل الاتصال بخدمة التوجيه والفرز الذكي");
      }

      const data: TriageResponse = await res.json();

      if (data.isLast) {
        setFinalRecommendation(data);
        setCurrentStep("result");
        saveSessionToStorage(chiefComplaint, updatedHistory, data);
      } else {
        setCurrentQuestion(data);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "حدث خطأ أثناء التوجيه للخطوة التالية. يرجى المحاولة مرة أخرى.");
    } finally {
      setIsLoading(false);
    }
  };

  // Go back to previous question in history or initial screen
  const handleBackQuestion = () => {
    if (history.length === 0) {
      setCurrentStep("complaint");
      setCurrentQuestion(null);
      return;
    }

    const newHistory = [...history];
    newHistory.pop(); // remove last answered QA
    setHistory(newHistory);

    // Re-fetch question state for previous step
    handleReFetchForHistory(chiefComplaint, newHistory);
  };

  const handleReFetchForHistory = async (complaintText: string, historyList: QAPair[]) => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/triage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chiefComplaint: complaintText,
          history: historyList,
        }),
      });

      if (!res.ok) {
        throw new Error("فشل العودة للخطوة السابقة");
      }

      const data: TriageResponse = await res.json();
      if (!data.isLast) {
        setCurrentQuestion(data);
        setCurrentStep("questions");
      }
    } catch (err: any) {
      console.error(err);
      setError("حدث خطأ أثناء العودة للخطوة السابقة.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setCurrentStep("complaint");
    setChiefComplaint("");
    setHistory([]);
    setCurrentQuestion(null);
    setFinalRecommendation(null);
    setError(null);
  };

  const handleSelectHistorySession = (session: TriageSession) => {
    setChiefComplaint(session.chiefComplaint);
    setHistory(session.history);
    // Re-trigger final recommendation fetch
    handleReFetchForHistory(session.chiefComplaint, session.history);
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans antialiased selection:bg-teal-500 selection:text-white" dir="rtl">
      {/* Header */}
      <Header
        onReset={handleReset}
        onOpenHistory={() => setIsHistoryOpen(true)}
        historyCount={savedSessions.length}
      />

      {/* Progress Bar */}
      <ProgressBar currentStep={currentStep} questionIndex={history.length} />

      {/* Error Alert Message */}
      {error && (
        <div className="max-w-2xl mx-auto px-4 mt-4">
          <div className="bg-red-50 border border-red-200 text-red-800 rounded-2xl p-4 text-xs flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={() => setError(null)}
              className="p-1 rounded-lg hover:bg-red-100 text-red-700 font-bold"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="pb-12">
        {currentStep === "complaint" && (
          <ChiefComplaintInput onSubmit={handleStartTriage} isLoading={isLoading} />
        )}

        {currentStep === "questions" && currentQuestion && (
          <QuestionStep
            questionData={currentQuestion}
            questionIndex={history.length}
            onSubmitAnswer={handleSubmitAnswer}
            onBack={handleBackQuestion}
            isLoading={isLoading}
            chiefComplaint={chiefComplaint}
            previousHistory={history}
          />
        )}

        {currentStep === "result" && finalRecommendation && (
          <FinalRecommendation
            recommendation={finalRecommendation}
            chiefComplaint={chiefComplaint}
            history={history}
            onReset={handleReset}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-800 text-slate-400 text-xs py-3.5 text-center border-t border-slate-700">
        <p>ميدباث MedPath AI &copy; {new Date().getFullYear()} - نظام الفرز والتوجيه الطبي الذكي</p>
      </footer>

      {/* Saved History Drawer */}
      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        sessions={savedSessions}
        onSelectSession={handleSelectHistorySession}
        onClearHistory={clearHistory}
      />
    </div>
  );
}
