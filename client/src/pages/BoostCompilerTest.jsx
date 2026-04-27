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
    return (
      <div className="h-full flex items-center justify-center text-[var(--text-secondary)] text-[14px] animate-pulse-subtle">
        Loading compiler...
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-6 h-[calc(100vh-8rem)]">
      <Toaster theme="dark" />
      <div>
        <h1 className="text-[24px] font-medium text-[var(--text-primary)] tracking-[-0.01em]">{level.charAt(0).toUpperCase() + level.slice(1)} compiler boost — {skillName}</h1>
        <p className="text-[14px] text-[var(--text-secondary)] mt-1">Pass all test cases to secure the score hike.</p>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 overflow-hidden">
        {/* Problem Statement */}
        <div className="col-span-1 rounded-[var(--radius-lg)] border p-6 overflow-y-auto custom-scrollbar" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}>
          <h2 className="text-[18px] text-[var(--text-primary)] font-medium mb-4">Problem statement</h2>
          <p className="text-[var(--text-secondary)] text-[14px] whitespace-pre-wrap leading-relaxed">
            {codeQuestion?.question}
          </p>

          {codeQuestion?.testCases && (
            <div className="mt-8 pt-6 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
              <h3 className="text-[12px] font-medium text-[var(--accent)] mb-4 tracking-[0.02em]">Expected execution:</h3>
              <div className="flex flex-col gap-3">
                {codeQuestion.testCases.map((tc, idx) => (
                  <div key={idx} className="rounded-[var(--radius-md)] p-3 font-[var(--font-mono)] text-[12px] flex flex-col gap-2" style={{ background: 'var(--bg-raised)', border: '1px solid var(--border-subtle)' }}>
                    <div className="flex items-start">
                      <span className="text-[var(--text-tertiary)] w-20 shrink-0">Input:</span>
                      <span className="text-[var(--text-primary)]">{tc.input}</span>
                    </div>
                    <div className="flex items-start border-t pt-2" style={{ borderColor: 'var(--border-subtle)' }}>
                      <span className="text-[var(--text-tertiary)] w-20 shrink-0">Expected:</span>
                      <span className="text-[var(--success)] font-medium">{tc.output}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Monaco Editor */}
        <div className="col-span-1 lg:col-span-2 flex flex-col border rounded-[var(--radius-lg)] overflow-hidden bg-[#1e1e1e]" style={{ borderColor: 'var(--border-subtle)' }}>
          <div className="h-10 bg-[#252526] border-b border-[#1a1a1a] flex items-center justify-between px-4">
            <span className="text-[12px] text-[var(--text-tertiary)] font-[var(--font-mono)]">index.js</span>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-[13px] font-medium px-4 h-7 rounded-[var(--radius-md)] transition-colors"
            >
              {submitting ? "Executing..." : "Run & submit"}
            </button>
          </div>
          <div className="flex-1">
            <Editor
              height="100%"
              theme="vs-dark"
              defaultLanguage="javascript"
              value={codeAnswer}
              onChange={(v) => setCodeAnswer(v)}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                padding: { top: 16 },
                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
