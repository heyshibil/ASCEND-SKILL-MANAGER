import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Editor from "@monaco-editor/react";
import { toast, Toaster } from "sonner";
import { verificationService } from "../services/verificationService";

export default function BoostCompilerTest() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const skillName = searchParams.get("skill");
  const level = searchParams.get("level");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [codeQuestion, setCodeQuestion] = useState(null);
  const [codeAnswer, setCodeAnswer] = useState("// Write your solution here\n");

  useEffect(() => {
    if (!skillName || !level) return navigate("/dashboard/skill-control");
    
    const fetchTest = async () => {
      try {
        setLoading(true);
        const data = await verificationService.generateBoostTest(skillName, "compiler", level);
        setCodeQuestion(data.codeTest);
        if (data.codeTest?.starterCode) setCodeAnswer(data.codeTest.starterCode);
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to load compiler test.");
        setTimeout(() => navigate("/dashboard/skill-control"), 2000);
      } finally {
        setLoading(false);
      }
    };
    fetchTest();
  }, [skillName, level, navigate]);

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      toast.loading("Executing on AWS Lambda...", { id: "code-grading" });
      const { result } = await verificationService.submitCompilerBoost(
        skillName,
        codeAnswer,
        codeQuestion.questionId
      );

      if (result.passedCases === result.totalCases && result.totalCases > 0) {
         toast.success(`Success! All ${result.passedCases} cases passed. (+${result.hikeApplied}% hike applied)`, { id: "code-grading" });
      } else {
         toast.error(`Execution failed. Passed ${result.passedCases}/${result.totalCases} cases. No hike applied.`, { id: "code-grading" });
      }

      setTimeout(() => navigate("/dashboard/skill-control"), 3500);
    } catch (error) {
      toast.error(error.response?.data?.message || "Code Execution failed", { id: "code-grading" });
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="h-full flex items-center justify-center text-indigo-400">Loading Compiler...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-6 h-[calc(100vh-8rem)]">
      <Toaster theme="dark" />
      <div>
        <h1 className="text-2xl font-semibold text-white">{level.toUpperCase()} Compiler Boost - {skillName}</h1>
        <p className="text-sm text-slate-400 mt-1">Pass all test cases to secure the score hike.</p>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-hidden">
        <div className="col-span-1 bg-white/[0.02] border border-white/10 rounded-2xl p-6 overflow-y-auto">
          <h2 className="text-xl text-white font-medium mb-4">Problem Statement</h2>
          <p className="text-slate-300 text-sm whitespace-pre-wrap leading-relaxed">
            {codeQuestion?.question}
          </p>

          {codeQuestion?.testCases && (
            <div className="mt-8 pt-6 border-t border-white/5">
              <h3 className="text-xs font-medium text-indigo-300 mb-4 uppercase tracking-wider">Expected Execution:</h3>
              <div className="flex flex-col gap-3">
                {codeQuestion.testCases.map((tc, idx) => (
                  <div key={idx} className="bg-black/30 border border-white/5 p-4 rounded-xl font-mono text-xs flex flex-col gap-2">
                    <div className="flex items-start">
                      <span className="text-slate-500 w-20 shrink-0">Input:</span>
                      <span className="text-blue-200">{tc.input}</span>
                    </div>
                    <div className="flex items-start border-t border-white/5 pt-2">
                      <span className="text-slate-500 w-20 shrink-0">Expected:</span>
                      <span className="text-emerald-300 font-bold">{tc.output}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="col-span-1 lg:col-span-2 flex flex-col border border-white/10 rounded-2xl overflow-hidden bg-[#1e1e1e]">
          <div className="h-12 bg-[#252526] border-b border-black/50 flex items-center justify-between px-4">
            <span className="text-xs text-slate-400 font-mono">index.js</span>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium px-4 py-1.5 rounded-lg transition-colors"
            >
              {submitting ? "Executing..." : "Run & Submit"}
            </button>
          </div>
          <div className="flex-1">
            <Editor
              height="100%"
              theme="vs-dark"
              defaultLanguage="javascript"
              value={codeAnswer}
              onChange={(v) => setCodeAnswer(v)}
              options={{ minimap: { enabled: false }, fontSize: 14, padding: { top: 16 } }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
