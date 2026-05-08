import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Editor from "@monaco-editor/react";
import { toast } from "sonner";
import { ArrowLeft, CheckCircle2, XCircle, Clock } from "lucide-react";
import { problemService } from "../services/problemService";
import { SKILL_EDITOR_MAP } from "../utils/skillEditorMap";

const resolveEditorConfig = (skill) => {
  return SKILL_EDITOR_MAP[skill?.toLowerCase()] || SKILL_EDITOR_MAP.javascript;
};

const STATUS_CONFIG = {
  accepted: { label: "Accepted", color: "var(--success)", bg: "var(--success-bg)", icon: CheckCircle2 },
  wrong_answer: { label: "Wrong Answer", color: "var(--danger)", bg: "var(--danger-bg)", icon: XCircle },
  runtime_error: { label: "Runtime Error", color: "var(--danger)", bg: "var(--danger-bg)", icon: XCircle },
  time_limit: { label: "Time Limit", color: "var(--warning)", bg: "var(--warning-bg)", icon: Clock },
};

export default function ProblemWorkspace() {
  const navigate = useNavigate();
  const { questionId } = useParams();

  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [problem, setProblem] = useState(null);
  const [solved, setSolved] = useState(false);
  const [codeAnswer, setCodeAnswer] = useState("");
  const [runResults, setRunResults] = useState(null);
  const [submitResult, setSubmitResult] = useState(null);
  const [editorConfig, setEditorConfig] = useState(SKILL_EDITOR_MAP.javascript);

  // Fetch problem
  useEffect(() => {
    const fetchProblem = async () => {
      try {
        setLoading(true);
        const data = await problemService.getProblem(questionId);
        setProblem(data.problem);
        setSolved(data.solved);

        const config = resolveEditorConfig(data.problem.skill);
        setEditorConfig(config);

        // Use starter code, last submission, or default
        if (data.lastSubmission?.code) {
          setCodeAnswer(data.lastSubmission.code);
        } else if (data.problem.starterCode) {
          setCodeAnswer(data.problem.starterCode);
        } else {
          setCodeAnswer(config.starter);
        }
      } catch (error) {
        toast.error("Failed to load problem.");
        setTimeout(() => navigate("/dashboard/problems"), 2000);
      } finally {
        setLoading(false);
      }
    };
    fetchProblem();
  }, [questionId, navigate]);

  // Run code
  const handleRun = async () => {
    try {
      setRunning(true);
      setRunResults(null);
      setSubmitResult(null);
      toast.loading("Running test cases...", { id: "problem-run" });

      const { result } = await problemService.runProblem(questionId, codeAnswer);
      setRunResults(result);

      if (result.timedOut) {
        toast.error("Execution timed out.", { id: "problem-run" });
      } else if (result.passedCases === result.totalCases) {
        toast.success(`All ${result.passedCases}/${result.totalCases} passed!`, { id: "problem-run" });
      } else {
        toast.error(`Passed ${result.passedCases}/${result.totalCases} cases.`, { id: "problem-run" });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Run failed", { id: "problem-run" });
    } finally {
      setRunning(false);
    }
  };

  // Submit solution
  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      setSubmitResult(null);
      toast.loading("Submitting solution...", { id: "problem-submit" });

      const data = await problemService.submitProblem(questionId, codeAnswer);
      setSubmitResult(data.submission);
      setRunResults({ results: data.results, passedCases: data.submission.passedCases, totalCases: data.submission.totalCases });

      if (data.submission.status === "accepted") {
        setSolved(true);
        toast.success("Accepted! All test cases passed.", { id: "problem-submit" });
        setTimeout(() => navigate("/dashboard/problems"), 1500);
      } else {
        const cfg = STATUS_CONFIG[data.submission.status];
        toast.error(cfg?.label || "Submission failed", { id: "problem-submit" });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Submission failed", { id: "problem-submit" });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center text-[var(--text-secondary)] text-[14px] animate-pulse-subtle">
        Loading problem...
      </div>
    );
  }

  if (!problem) return null;

  const levelColors = {
    beginner: { text: "var(--success)", bg: "var(--success-bg)" },
    intermediate: { text: "var(--warning)", bg: "var(--warning-bg)" },
    advanced: { text: "var(--danger)", bg: "var(--danger-bg)" },
  };
  const lc = levelColors[problem.level] || {};

  return (
    <div className="flex flex-col gap-4 h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/dashboard/problems")}
            className="w-8 h-8 flex items-center justify-center rounded-[var(--radius-md)] border transition-colors"
            style={{ borderColor: "var(--border-base)", color: "var(--text-secondary)" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-raised)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-[18px] font-medium text-[var(--text-primary)] tracking-[-0.01em]">
                {problem.topic}
              </h1>
              {solved && <CheckCircle2 className="w-4 h-4 text-[var(--success)]" />}
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[12px] text-[var(--text-secondary)]">{problem.skill}</span>
              <span className="text-[var(--text-disabled)]">·</span>
              <span
                className="text-[11px] font-medium px-1.5 py-0.5 rounded-[var(--radius-sm)] capitalize"
                style={{ background: lc.bg, color: lc.text }}
              >
                {problem.level}
              </span>
            </div>
          </div>
        </div>

        {/* Submit Status Badge */}
        {submitResult && (
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-[var(--radius-md)]"
            style={{
              background: STATUS_CONFIG[submitResult.status]?.bg,
              color: STATUS_CONFIG[submitResult.status]?.color,
            }}
          >
            {React.createElement(STATUS_CONFIG[submitResult.status]?.icon || XCircle, { className: "w-4 h-4" })}
            <span className="text-[13px] font-medium">
              {STATUS_CONFIG[submitResult.status]?.label} — {submitResult.passedCases}/{submitResult.totalCases}
            </span>
            {submitResult.executionTimeMs && (
              <span className="text-[11px] opacity-70 ml-1">
                ({submitResult.executionTimeMs}ms)
              </span>
            )}
          </div>
        )}
      </div>

      {/* Main Grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 overflow-hidden">
        {/* Problem Description + Run Results */}
        <div
          className="col-span-1 rounded-[var(--radius-lg)] border overflow-y-auto custom-scrollbar flex flex-col"
          style={{ background: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}
        >
          <div className="p-6 flex-1">
            <h2 className="text-[16px] text-[var(--text-primary)] font-medium mb-4">
              Description
            </h2>
            <p className="text-[var(--text-secondary)] text-[14px] whitespace-pre-wrap leading-relaxed">
              {problem.question}
            </p>

            {/* Test cases (show when no run results) */}
            {problem.testCases && problem.testCases.length > 0 && !runResults && (
              <div className="mt-8 pt-6 border-t" style={{ borderColor: "var(--border-subtle)" }}>
                <h3 className="text-[12px] font-medium text-[var(--accent)] mb-4 tracking-[0.02em]">
                  Test cases:
                </h3>
                <div className="flex flex-col gap-3">
                  {problem.testCases.map((tc, idx) => (
                    <div
                      key={idx}
                      className="rounded-[var(--radius-md)] p-3 font-[var(--font-mono)] text-[12px] flex flex-col gap-2"
                      style={{ background: "var(--bg-raised)", border: "1px solid var(--border-subtle)" }}
                    >
                      <div className="flex items-start">
                        <span className="text-[var(--text-tertiary)] w-20 shrink-0">Input:</span>
                        <span className="text-[var(--text-primary)]">{tc.input}</span>
                      </div>
                      <div className="flex items-start border-t pt-2" style={{ borderColor: "var(--border-subtle)" }}>
                        <span className="text-[var(--text-tertiary)] w-20 shrink-0">Expected:</span>
                        <span className="text-[var(--success)] font-medium">{tc.output}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Run Results Panel */}
            {runResults && (
              <div className="mt-8 pt-6 border-t" style={{ borderColor: "var(--border-subtle)" }}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[12px] font-medium text-[var(--accent)] tracking-[0.02em]">
                    Test results:
                  </h3>
                  <span
                    className="text-[12px] font-medium px-2 py-0.5 rounded-[var(--radius-sm)]"
                    style={{
                      background: runResults.passedCases === runResults.totalCases ? "var(--success-bg)" : "var(--danger-bg)",
                      color: runResults.passedCases === runResults.totalCases ? "var(--success)" : "var(--danger)",
                    }}
                  >
                    {runResults.passedCases}/{runResults.totalCases} passed
                  </span>
                </div>
                <div className="flex flex-col gap-3">
                  {runResults.results.map((r, idx) => (
                    <div
                      key={idx}
                      className="rounded-[var(--radius-md)] p-3 font-[var(--font-mono)] text-[12px] flex flex-col gap-2"
                      style={{ background: "var(--bg-raised)", border: `1px solid ${r.passed ? "var(--success)" : "var(--danger)"}` }}
                    >
                      <span className="text-[11px] font-medium" style={{ color: r.passed ? "var(--success)" : "var(--danger)" }}>
                        Case {idx + 1} — {r.passed ? "Passed ✓" : "Failed ✗"}
                      </span>
                      <div className="flex items-start">
                        <span className="text-[var(--text-tertiary)] w-20 shrink-0">Input:</span>
                        <span className="text-[var(--text-primary)]">{r.input}</span>
                      </div>
                      <div className="flex items-start border-t pt-2" style={{ borderColor: "var(--border-subtle)" }}>
                        <span className="text-[var(--text-tertiary)] w-20 shrink-0">Expected:</span>
                        <span className="text-[var(--success)] font-medium">{r.expected}</span>
                      </div>
                      <div className="flex items-start border-t pt-2" style={{ borderColor: "var(--border-subtle)" }}>
                        <span className="text-[var(--text-tertiary)] w-20 shrink-0">Actual:</span>
                        <span className={`font-medium ${r.passed ? "text-[var(--success)]" : "text-[var(--danger)]"}`}>{r.actual}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Monaco Editor */}
        <div
          className="col-span-1 lg:col-span-2 flex flex-col border rounded-[var(--radius-lg)] overflow-hidden bg-[#1e1e1e]"
          style={{ borderColor: "var(--border-subtle)" }}
        >
          {/* Editor Toolbar */}
          <div className="h-11 bg-[#252526] border-b border-[#1a1a1a] flex items-center justify-between px-4">
            <span className="text-[12px] text-[var(--text-tertiary)] font-[var(--font-mono)]">
              {editorConfig.filename}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleRun}
                disabled={running || submitting}
                className="text-[13px] font-medium px-4 h-7 rounded-[var(--radius-md)] transition-colors border"
                style={{ borderColor: "var(--border-base)", color: "var(--text-secondary)", background: "transparent" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-raised)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                {running ? "Running..." : "▶ Run"}
              </button>
              <button
                onClick={handleSubmit}
                disabled={running || submitting}
                className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-[13px] font-medium px-4 h-7 rounded-[var(--radius-md)] transition-colors"
              >
                {submitting ? "Submitting..." : "Submit"}
              </button>
            </div>
          </div>

          {/* Editor */}
          <div className="flex-1">
            <Editor
              height="100%"
              theme="vs-dark"
              defaultLanguage={editorConfig.monacoId}
              value={codeAnswer}
              onChange={(v) => {
                setCodeAnswer(v ?? "");
                setRunResults(null);
                setSubmitResult(null);
              }}
              onMount={(editor, monaco) => {
                document.fonts.ready.then(() => {
                  monaco.editor.remeasureFonts();
                });
              }}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                padding: { top: 16 },
                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
              }}
              className="text-left"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
