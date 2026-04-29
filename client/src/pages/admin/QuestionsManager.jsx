import React, { useState } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import {
  Plus,
  Trash2,
  Save,
  Code,
  CheckSquare,
} from "lucide-react";
import { adminService } from "../../services/adminServices";
import { toast } from "sonner";
import { CustomSelect } from "../../components/ui/CustomSelect";
import { Database } from "lucide-react";
import BulkSeedModal from "../../components/admin/BulkSeedModal";

export default function QuestionsManager() {
  const [activeTab, setActiveTab] = useState("mcq"); // "mcq" | "code"
  const [loading, setLoading] = useState(false);
  const [isBulkOpen, setIsBulkOpen] = useState(false);

  // --- SHARED FORM DATA ---
  const [baseData, setBaseData] = useState({
    skill: "JavaScript",
    level: "beginner",
    topic: "",
  });

  // --- MCQ SPECIFIC DATA ---
  const [mcqData, setMcqData] = useState({
    question: "",
    options: ["", "", "", ""],
    correctAnswerIndex: 0,
  });

  // --- CODE SPECIFIC DATA ---
  const [codeData, setCodeData] = useState({
    question: "",
    starterCode: "// Write starter code here\n",
    validationScript:
      "function assertEqual(a, b) {\n  if(JSON.stringify(a) === JSON.stringify(b)) console.log('PASS'); \n  else console.log('FAIL'); \n}",
    testCases: [{ input: "", output: "" }],
  });

  // --- HANDLERS ---
  const handleOptionChange = (index, value) => {
    const newOptions = [...mcqData.options];
    newOptions[index] = value;
    setMcqData({ ...mcqData, options: newOptions });
  };

  const handleAddTestCase = () => {
    setCodeData({
      ...codeData,
      testCases: [...codeData.testCases, { input: "", output: "" }],
    });
  };

  const handleTestCaseChange = (index, field, value) => {
    const newTests = [...codeData.testCases];
    newTests[index][field] = value;
    setCodeData({ ...codeData, testCases: newTests });
  };

  const handleRemoveTestCase = (index) => {
    const newTests = codeData.testCases.filter((_, i) => i !== index);
    setCodeData({ ...codeData, testCases: newTests });
  };

  // --- SUBMISSION LOGIC ---
  const handleSubmit = async () => {
    if (!baseData.skill || !baseData.topic) {
      return toast.error("Skill and Topic are required.");
    }

    setLoading(true);

    // Merge base data with the active tab data
    const payload = {
      ...baseData,
      type: activeTab,
      ...(activeTab === "mcq" ? mcqData : codeData),
    };

    try {
      const response = await adminService.createQuestion(payload);

      toast.success(response.message || "Question seeded successfully!");

      // Reset form fields here
      if (activeTab === "mcq") {
        setMcqData({
          question: "",
          options: ["", "", "", ""],
          correctAnswerIndex: 0,
        });
      } else {
        setCodeData({
          question: "",
          starterCode: "// Write your solution here\n",
          validationScript: "function validate(userCode) {\n  return true;\n}",
          testCases: [{ input: "", output: "" }],
        });
      }
      setBaseData({ ...baseData, topic: "" }); // Clear topic for fresh entry
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to seed question");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full border rounded-[var(--radius-md)] p-3 text-[14px] outline-none transition-all focus:border-[var(--accent)] focus:ring-2 focus:ring-[rgba(37,99,235,0.15)]";

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-6">
      {/* HEADER & TABS */}
      <div className="flex flex-col md:flex-row md:items-end justify-between items-start gap-4">
        <div>
          <h1 className="text-[24px] font-medium text-[var(--text-primary)] tracking-[-0.01em]">Questions bank</h1>
          <p className="text-[14px] text-[var(--text-secondary)] mt-1">
            Seed new verification challenges for users.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          {/* Bulk Button */}
          <button
            onClick={() => setIsBulkOpen(true)}
            className="flex items-center gap-2 px-4 h-9 rounded-[var(--radius-md)] text-[var(--accent)] text-[14px] font-medium transition-colors border hover:bg-[var(--accent-bg)]"
            style={{ borderColor: 'var(--accent)', background: 'var(--accent-bg)' }}
          >
             <Database className="w-4 h-4" /> Bulk JSON seed
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="relative flex p-1 rounded-[var(--radius-lg)] w-full md:w-[380px]" style={{ background: 'var(--bg-raised)', border: '1px solid var(--border-subtle)' }}>
          {/* Sliding Pill */}
          <div
            className="absolute top-1 bottom-1 left-1 rounded-[var(--radius-md)] transition-transform duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] z-0"
            style={{
              width: "calc(50% - 4px)",
              transform: activeTab === "mcq" ? "translateX(0)" : "translateX(100%)",
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              boxShadow: 'var(--shadow-sm)',
            }}
          />
          <button
            onClick={() => setActiveTab("mcq")}
            className={`relative z-10 flex-1 flex items-center justify-center gap-2 px-4 py-1.5 text-[13px] font-medium rounded-[var(--radius-md)] transition-colors duration-300 ${
              activeTab === "mcq"
                ? "text-[var(--text-primary)]"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            <CheckSquare className="w-4 h-4" /> Multiple choice
          </button>
          <button
            onClick={() => setActiveTab("code")}
            className={`relative z-10 flex-1 flex items-center justify-center gap-2 px-4 py-1.5 text-[13px] font-medium rounded-[var(--radius-md)] transition-colors duration-300 ${
              activeTab === "code"
                ? "text-[var(--text-primary)]"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            <Code className="w-4 h-4" /> Code compiler
          </button>
        </div>
      </div>

      <div className="rounded-[var(--radius-lg)] border overflow-hidden flex flex-col" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}>
        {/* --- GLOBAL SETTINGS ROW --- */}
        <div className="p-6 border-b grid grid-cols-1 md:grid-cols-3 gap-6" style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-raised)' }}>
          <div className="z-20 relative">
            <CustomSelect
              label="Target skill"
              value={baseData.skill}
              onChange={(val) => setBaseData({ ...baseData, skill: val })}
              options={[
                { value: "JavaScript", label: "JavaScript" },
                { value: "Node.js", label: "Node.js" },
                { value: "React", label: "React" },
                { value: "MongoDB", label: "MongoDB" },
                { value: "PostgreSQL", label: "PostgreSQL" },
              ]}
            />
          </div>

          <div className="z-10 relative">
            <CustomSelect
              label="Difficulty level"
              value={baseData.level}
              onChange={(val) => setBaseData({ ...baseData, level: val })}
              options={[
                { value: "beginner", label: "Beginner" },
                { value: "intermediate", label: "Intermediate" },
                { value: "advanced", label: "Advanced" },
              ]}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-medium text-[var(--text-secondary)]">
              Topic area
            </label>
            <input
              type="text"
              placeholder="e.g. Hooks, Promise, Indexing"
              value={baseData.topic}
              onChange={(e) =>
                setBaseData({ ...baseData, topic: e.target.value })
              }
              className={inputClass}
              style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-base)', color: 'var(--text-primary)' }}
            />
          </div>
        </div>

        {/* --- MCQ DYNAMIC AREA --- */}
        {activeTab === "mcq" && (
          <div className="p-6 flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-[12px] font-medium text-[var(--text-secondary)]">
                Question text
              </label>
              <textarea
                rows="3"
                value={mcqData.question}
                onChange={(e) =>
                  setMcqData({ ...mcqData, question: e.target.value })
                }
                placeholder="What is the output of..."
                className={inputClass + " resize-none"}
                style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-base)', color: 'var(--text-primary)' }}
              />
            </div>

            <div className="flex flex-col gap-4">
              <label className="text-[12px] font-medium text-[var(--text-secondary)]">
                Answer options & correct key
              </label>
              {mcqData.options.map((option, idx) => (
                <div key={idx} className="flex items-center gap-4">
                  <input
                    type="radio"
                    name="correctAnswer"
                    checked={mcqData.correctAnswerIndex === idx}
                    onChange={() =>
                      setMcqData({ ...mcqData, correctAnswerIndex: idx })
                    }
                    className="w-5 h-5 accent-[var(--success)] cursor-pointer"
                  />
                  <input
                    type="text"
                    placeholder={`Option ${idx + 1}`}
                    value={option}
                    onChange={(e) => handleOptionChange(idx, e.target.value)}
                    className="flex-1 border rounded-[var(--radius-md)] px-3 py-2 text-[14px] outline-none transition-all focus:border-[var(--accent)]"
                    style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-base)', color: 'var(--text-primary)' }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- CODE DYNAMIC AREA --- */}
        {activeTab === "code" && (
          <div className="p-6 flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-[12px] font-medium text-[var(--text-secondary)]">
                Problem statement
              </label>
              <textarea
                rows="3"
                value={codeData.question}
                onChange={(e) =>
                  setCodeData({ ...codeData, question: e.target.value })
                }
                placeholder="Write a function that calculates..."
                className={inputClass + " resize-none"}
                style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-base)', color: 'var(--text-primary)' }}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[12px] font-medium text-[var(--text-secondary)]">
                Starter code (sent to user)
              </label>
              <div className="rounded-[var(--radius-lg)] overflow-hidden border" style={{ borderColor: 'var(--border-base)' }}>
                <CodeMirror
                  value={codeData.starterCode}
                  height="150px"
                  extensions={[javascript()]}
                  onChange={(val) =>
                    setCodeData({ ...codeData, starterCode: val })
                  }
                  theme="light"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[12px] font-medium text-[var(--text-secondary)]">
                Validation script (hidden)
              </label>
              <div className="rounded-[var(--radius-lg)] overflow-hidden border" style={{ borderColor: 'var(--border-base)' }}>
                <CodeMirror
                  value={codeData.validationScript}
                  height="150px"
                  extensions={[javascript()]}
                  onChange={(val) =>
                    setCodeData({ ...codeData, validationScript: val })
                  }
                  theme="light"
                />
              </div>
            </div>

            <div className="pt-4 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
              <div className="flex justify-between items-center mb-4">
                <label className="text-[14px] font-medium text-[var(--text-primary)]">
                  Compiler test cases
                </label>
                <button
                  onClick={handleAddTestCase}
                  className="flex items-center gap-1.5 text-[13px] font-medium text-[var(--accent)] px-3 py-1.5 rounded-[var(--radius-md)]"
                  style={{ background: 'var(--accent-bg)' }}
                >
                  <Plus className="w-4 h-4" /> Add test
                </button>
              </div>

              <div className="flex flex-col gap-4">
                {codeData.testCases.map((tc, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-4 p-4 rounded-[var(--radius-lg)] border relative"
                    style={{ background: 'var(--bg-raised)', borderColor: 'var(--border-subtle)' }}
                  >
                    <div className="flex-1 flex flex-col gap-3">
                      <div>
                        <span className="text-[11px] font-medium text-[var(--text-tertiary)] mb-1 block tracking-[0.02em]">
                          Input
                        </span>
                        <input
                          type="text"
                          value={tc.input}
                          onChange={(e) =>
                            handleTestCaseChange(idx, "input", e.target.value)
                          }
                          placeholder="e.g. getKeys({a:1})"
                          className="w-full border rounded-[var(--radius-md)] px-3 py-1.5 text-[14px] font-[var(--font-mono)] outline-none focus:border-[var(--accent)]"
                          style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-base)', color: 'var(--text-primary)' }}
                        />
                      </div>
                      <div>
                        <span className="text-[11px] font-medium text-[var(--text-tertiary)] mb-1 block tracking-[0.02em]">
                          Expected output
                        </span>
                        <input
                          type="text"
                          value={tc.output}
                          onChange={(e) =>
                            handleTestCaseChange(idx, "output", e.target.value)
                          }
                          placeholder="e.g. ['a']"
                          className="w-full border rounded-[var(--radius-md)] px-3 py-1.5 text-[14px] font-[var(--font-mono)] outline-none focus:border-[var(--accent)]"
                          style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-base)', color: 'var(--text-primary)' }}
                        />
                      </div>
                    </div>
                    {codeData.testCases.length > 1 && (
                      <button
                        onClick={() => handleRemoveTestCase(idx)}
                        className="p-2 text-[var(--text-tertiary)] hover:bg-[var(--danger-bg)] hover:text-[var(--danger)] rounded-[var(--radius-md)] transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* --- GLOBAL SUBMIT ACTION --- */}
        <div className="p-6 border-t flex justify-end" style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-raised)' }}>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex items-center gap-2 px-5 h-9 rounded-[var(--radius-md)] font-medium text-[14px] transition-all text-white bg-[var(--accent)] hover:bg-[var(--accent-hover)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4" />
            {loading ? "Seeding..." : "Seed question"}
          </button>
        </div>
      </div>
      {/* Mount Modal */}
      <BulkSeedModal isOpen={isBulkOpen} onClose={() => setIsBulkOpen(false)} />
    </div>
  );
}
