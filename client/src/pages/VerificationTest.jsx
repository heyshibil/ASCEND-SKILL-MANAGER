import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Editor from "@monaco-editor/react";
import { toast, Toaster } from "sonner";

import { verificationService } from "../services/verificationService";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { Progress } from "../components/ui/progress";

export default function VerificationTest() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const skillName = searchParams.get("skill") || "React";

  // Loading & Test Data States
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [mcqQuestions, setMcqQuestions] = useState([]);
  const [codeQuestion, setCodeQuestion] = useState(null);

  // User Answer States
  const [currentMcqIndex, setCurrentMcqIndex] = useState(0);
  const [mcqAnswers, setMcqAnswers] = useState([]);
  const [codeAnswer, setCodeAnswer] = useState("// Write your solution here\n");

  useEffect(() => {
    const fetchTest = async () => {
      try {
        setLoading(true);
        const data = await verificationService.startTest(
          skillName,
          "Intermediate",
        );
        setMcqQuestions(data.mcqs);
        setCodeQuestion(data.codeTest);
      } catch (error) {
        toast.error(
          error.response?.data?.message ||
            "Failed to load test. Session may already exist.",
        );
      } finally {
        setLoading(false);
      }
    };
    fetchTest();
  }, [skillName]);

  const handleOptionSelect = (index) => {
    const questionId = mcqQuestions[currentMcqIndex].questionId;

    const updatedAnswers = [...mcqAnswers];
    const existingIndex = updatedAnswers.findIndex(
      (a) => a.questionId === questionId,
    );

    if (existingIndex > -1) {
      updatedAnswers[existingIndex].answerIndex = index;
    } else {
      updatedAnswers.push({ questionId, answerIndex: index });
    }

    setMcqAnswers(updatedAnswers);

    if (currentMcqIndex < mcqQuestions.length - 1) {
      setTimeout(() => setCurrentMcqIndex((curr) => curr + 1), 300);
    } else {
      toast.info("MCQs complete! Switch to the Compiler tab.");
    }
  };

  const isOptionSelected = (index) => {
    const qId = mcqQuestions[currentMcqIndex]?.questionId;
    const answer = mcqAnswers.find((a) => a.questionId === qId);
    return answer?.answerIndex === index;
  };

  const handleSubmitTest = async () => {
    if (mcqAnswers.length < 5) {
      toast.error("Please answer all 5 MCQs before submitting!");
      return;
    }

    try {
      setSubmitting(true);
      toast.loading("Analyzing your code & running test cases...", {
        id: "grading",
      });

      const result = await verificationService.submitTest(
        skillName,
        mcqAnswers,
        codeAnswer,
        codeQuestion.questionId,
      );

      // Fixed String Interpolation issue for React!
      toast.success(
        "Verification Complete! Score: " + result.finalScore + "/100",
        { id: "grading" },
      );

      setTimeout(() => {
        navigate("/report", {
          state: { report: result, skillName: skillName },
        });
      }, 3000);
    } catch (error) {
      toast.error(error.response?.data?.message || "Submission failed", {
        id: "grading",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0b0f] flex items-center justify-center text-indigo-400">
        <span className="animate-pulse">
          Initializing Verification Engine...
        </span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0b0f] flex flex-col items-center py-12 px-6 relative overflow-hidden font-sans selection:bg-indigo-500/30">
      <Toaster theme="dark" position="top-center" richColors />

      <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] bg-[#312e81] rounded-full mix-blend-screen filter blur-[150px] opacity-20 pointer-events-none fixed"></div>
      <div className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] bg-[#1a1029] rounded-full mix-blend-screen filter blur-[150px] opacity-25 pointer-events-none fixed"></div>

      <div className="relative z-10 w-full max-w-5xl flex flex-col gap-8">
        <div className="text-center w-full">
          <h1 className="text-3xl font-semibold text-white tracking-tight">
            Verification Test
          </h1>
          <p className="text-sm text-slate-400 mt-2">
            Complete the MCQ theory and Compiler test to authenticate your
            baseline score.
          </p>
        </div>

        <div className="w-full bg-white/[0.02] border border-white/10 backdrop-blur-xl rounded-2xl p-6 sm:p-8 shadow-2xl flex flex-col gap-6">
          <Tabs defaultValue="theory" className="w-full">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 bg-white/5 border border-white/10 p-1 mb-8">
              <TabsTrigger
                value="theory"
                className="text-slate-300 data-[state=active]:bg-indigo-500/20 data-[state=active]:text-white transition-all rounded-lg"
              >
                MCQ Theory ({mcqAnswers.length}/5)
              </TabsTrigger>
              <TabsTrigger
                value="execution"
                className="text-slate-300 data-[state=active]:bg-indigo-500/20 data-[state=active]:text-white transition-all rounded-lg"
              >
                Compiler Challenge
              </TabsTrigger>
            </TabsList>

            <TabsContent
              value="theory"
              className="flex flex-col gap-6 mt-0 focus-visible:outline-none"
            >
              {mcqQuestions.length > 0 && (
                <>
                  <div className="w-full flex items-center gap-4">
                    <Progress
                      value={(mcqAnswers.length / 5) * 100}
                      className="h-2 bg-white/5"
                    />
                  </div>

                  <div className="bg-white/5 border border-white/10 rounded-xl p-6 shadow-inner">
                    <span className="text-indigo-400 text-xs font-bold uppercase tracking-wider mb-2 block">
                      Question {currentMcqIndex + 1} of 5
                    </span>
                    <h2 className="text-xl text-white font-medium leading-relaxed">
                      {mcqQuestions[currentMcqIndex].question}
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {mcqQuestions[currentMcqIndex].options.map(
                      (option, idx) => {
                        const selected = isOptionSelected(idx);
                        // Fixed Template Literals for easy copy pasting!
                        const baseClass =
                          "text-left p-5 rounded-xl border transition-all duration-300 ";
                        const activeClass = selected
                          ? "bg-indigo-500/20 border-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.2)]"
                          : "bg-white/[0.03] border-white/5 hover:bg-white/10 hover:border-white/20";
                        const textClass = selected
                          ? "text-indigo-100"
                          : "text-slate-300";

                        return (
                          <button
                            key={idx}
                            onClick={() => handleOptionSelect(idx)}
                            className={baseClass + activeClass}
                          >
                            <span
                              className={"text-sm font-medium " + textClass}
                            >
                              {option}
                            </span>
                          </button>
                        );
                      },
                    )}
                  </div>

                  <div className="flex justify-between mt-6 pt-6 border-t border-white/5">
                    <button
                      onClick={() =>
                        setCurrentMcqIndex((curr) => Math.max(0, curr - 1))
                      }
                      disabled={currentMcqIndex === 0}
                      className="text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 text-sm font-medium transition-colors cursor-pointer"
                    >
                      ← Previous
                    </button>
                    <button
                      onClick={() =>
                        setCurrentMcqIndex((curr) => Math.min(4, curr + 1))
                      }
                      disabled={currentMcqIndex === 4}
                      className="text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 text-sm font-medium transition-colors cursor-pointer"
                    >
                      Next →
                    </button>
                  </div>
                </>
              )}
            </TabsContent>

            <TabsContent
              value="execution"
              className="flex flex-col gap-6 mt-0 focus-visible:outline-none"
            >
              {codeQuestion && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
                  <div className="col-span-1 bg-white/5 border border-white/10 rounded-xl p-6 overflow-y-auto custom-scrollbar">
                    <span className="text-indigo-400 text-xs font-bold uppercase tracking-wider mb-2 block">
                      Code Execution
                    </span>
                    <h2 className="text-xl text-white font-medium mb-4">
                      Problem Statement
                    </h2>
                    <p className="text-slate-300 text-sm whitespace-pre-wrap leading-relaxed">
                      {codeQuestion.question}
                    </p>

                    <div className="mt-8 pt-6 border-t border-white/5">
                      <h3 className="text-xs font-medium text-slate-400 mb-2">
                        Requirements:
                      </h3>
                      <ul className="list-disc list-inside text-slate-300 text-sm space-y-2">
                        <li>Function must execute efficiently</li>
                        <li>Do not change the function signature</li>
                      </ul>
                    </div>
                  </div>

                  <div className="col-span-1 lg:col-span-2 flex flex-col border border-white/10 rounded-xl overflow-hidden bg-[#1e1e1e]">
                    <div className="h-10 bg-[#252526] border-b border-black/50 flex items-center px-4 justify-between">
                      <span className="text-xs text-slate-400 font-mono">
                        index.js
                      </span>
                    </div>

                    <Editor
                      height="100%"
                      theme="vs-dark"
                      defaultLanguage="javascript"
                      value={codeAnswer}
                      onChange={(value) => setCodeAnswer(value)}
                      options={{
                        minimap: { enabled: false },
                        fontSize: 14,
                        padding: { top: 16 },
                        smoothScrolling: true,
                        cursorBlinking: "smooth",
                        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                      }}
                      className="w-full flex-1"
                    />
                  </div>
                </div>
              )}

              <div className="pt-6 mt-6 border-t border-white/5 flex justify-end">
                <button
                  onClick={handleSubmitTest}
                  disabled={submitting}
                  className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/50 disabled:cursor-not-allowed text-white font-medium px-8 py-3.5 rounded-xl transition-all text-sm shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_25px_rgba(99,102,241,0.5)] cursor-pointer"
                >
                  {submitting
                    ? "Analyzing Test Securely..."
                    : "Submit Complete Verification"}
                </button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255, 255, 255, 0.02); border-radius: 8px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 8px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.2); }
      `,
        }}
      />
    </div>
  );
}
