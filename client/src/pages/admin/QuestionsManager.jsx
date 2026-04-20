import React, { useState } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { Plus, Trash2, Save, Code, CheckSquare, ChevronDown } from "lucide-react";
import { adminService } from "../../services/adminServices";
import { toast } from "sonner";
import { CustomSelect } from "../../components/ui/CustomSelect";

export default function QuestionsManager() {
  const [activeTab, setActiveTab] = useState("mcq"); // "mcq" | "code"
  const [loading, setLoading] = useState(false);

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
    validationScript: "function assertEqual(a, b) {\n  if(JSON.stringify(a) === JSON.stringify(b)) console.log('PASS'); \n  else console.log('FAIL'); \n}",
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

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* HEADER & TABS */}
      <div className="flex flex-col md:flex-row md:items-end justify-between items-start gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Questions Bank</h1>
          <p className="text-sm text-slate-500 mt-1">
            Seed new verification challenges for users.
          </p>
        </div>

        {/* Modern Tab Switcher */}
        <div className="relative flex bg-slate-100 p-1 rounded-xl border border-slate-200 shadow-inner w-full md:w-[380px]">
          {/* Animated Sliding Pill */}
          <div
            className="absolute top-1 bottom-1 left-1 bg-white rounded-lg shadow-[0_2px_8px_-2px_rgba(0,0,0,0.1)] border border-slate-200/50 transition-transform duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] z-0"
            style={{
              width: "calc(50% - 4px)",
              transform: activeTab === "mcq" ? "translateX(0)" : "translateX(100%)",
            }}
          />
          <button
            onClick={() => setActiveTab("mcq")}
            className={`relative z-10 flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-300 ${
              activeTab === "mcq" ? "text-indigo-700" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <CheckSquare className="w-4 h-4" /> Multiple Choice
          </button>
          <button
            onClick={() => setActiveTab("code")}
            className={`relative z-10 flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-300 ${
              activeTab === "code" ? "text-indigo-700" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <Code className="w-4 h-4" /> Code Compiler
          </button>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
        {/* --- GLOBAL SETTINGS ROW --- */}
        <div className="p-6 border-b border-slate-100 bg-slate-50/50 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="z-20 relative">
            <CustomSelect
              label="Target Skill"
              value={baseData.skill}
              onChange={(val) => setBaseData({ ...baseData, skill: val })}
              options={[
                { value: "JavaScript", label: "JavaScript" },
                { value: "Node.js", label: "Node.js" },
                { value: "React", label: "React" },
                { value: "MongoDB", label: "MongoDB" },
              ]}
            />
          </div>

          <div className="z-10 relative">
            <CustomSelect
              label="Difficulty Level"
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
            <label className="text-sm font-semibold text-slate-700">
              Topic Area
            </label>
            <input
              type="text"
              placeholder="e.g. Hooks, Promise, Indexing"
              value={baseData.topic}
              onChange={(e) =>
                setBaseData({ ...baseData, topic: e.target.value })
              }
              className="w-full bg-white border border-slate-300 text-slate-800 px-3 py-2 rounded-lg focus:ring-2 focus:ring-indigo-500/50 outline-none text-sm"
            />
          </div>
        </div>

        {/* --- MCQ DYNAMIC AREA --- */}
        {activeTab === "mcq" && (
          <div className="p-6 space-y-6">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-slate-700">
                Question Text
              </label>
              <textarea
                rows="3"
                value={mcqData.question}
                onChange={(e) =>
                  setMcqData({ ...mcqData, question: e.target.value })
                }
                placeholder="What is the output of..."
                className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
              />
            </div>

            <div className="space-y-4">
              <label className="text-sm font-semibold text-slate-700">
                Answer Options & Correct Key
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
                    className="w-5 h-5 text-emerald-500 border-slate-300 focus:ring-emerald-500 cursor-pointer"
                  />
                  <input
                    type="text"
                    placeholder={`Option ${idx + 1}`}
                    value={option}
                    onChange={(e) => handleOptionChange(idx, e.target.value)}
                    className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:border-indigo-500 outline-none"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- CODE DYNAMIC AREA --- */}
        {activeTab === "code" && (
          <div className="p-6 space-y-6">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-slate-700">
                Problem Statement
              </label>
              <textarea
                rows="3"
                value={codeData.question}
                onChange={(e) =>
                  setCodeData({ ...codeData, question: e.target.value })
                }
                placeholder="Write a function that calculates..."
                className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
              />
            </div>

            {/* Smart CodeMirror Editor */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-slate-700 mt-2">
                Starter Code (Sent to User)
              </label>
              <div className="rounded-lg overflow-hidden border border-slate-300">
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
              <label className="text-sm font-semibold text-slate-700 mt-2">
                Validation Script (Hidden)
              </label>
              <div className="rounded-lg overflow-hidden border border-slate-300">
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

            <div className="pt-4 border-t border-slate-100">
              <div className="flex justify-between items-center mb-4">
                <label className="text-sm font-semibold text-slate-800">
                  Compiler Test Cases
                </label>
                <button
                  onClick={handleAddTestCase}
                  className="flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-3 py-1.5 rounded-md"
                >
                  <Plus className="w-4 h-4" /> Add Test
                </button>
              </div>

              <div className="space-y-4">
                {codeData.testCases.map((tc, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-4 p-4 bg-slate-50 border border-slate-200 rounded-lg relative"
                  >
                    <div className="flex-1 space-y-3">
                      <div>
                        <span className="text-xs font-semibold text-slate-400 mb-1 block uppercase tracking-wider">
                          Input
                        </span>
                        <input
                          type="text"
                          value={tc.input}
                          onChange={(e) =>
                            handleTestCaseChange(idx, "input", e.target.value)
                          }
                          placeholder="e.g. getKeys({a:1})"
                          className="w-full bg-white border border-slate-200 rounded px-3 py-1.5 text-sm font-mono focus:border-indigo-500 outline-none"
                        />
                      </div>
                      <div>
                        <span className="text-xs font-semibold text-slate-400 mb-1 block uppercase tracking-wider">
                          Expected Output
                        </span>
                        <input
                          type="text"
                          value={tc.output}
                          onChange={(e) =>
                            handleTestCaseChange(idx, "output", e.target.value)
                          }
                          placeholder="e.g. ['a']"
                          className="w-full bg-white border border-slate-200 rounded px-3 py-1.5 text-sm font-mono focus:border-indigo-500 outline-none"
                        />
                      </div>
                    </div>
                    {/* Delete Test Case */}
                    {codeData.testCases.length > 1 && (
                      <button
                        onClick={() => handleRemoveTestCase(idx)}
                        className="p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 rounded-md transition-colors"
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
        <div className="p-6 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium text-sm transition-all text-white shadow-sm
              ${loading ? "bg-indigo-400 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700 hover:shadow-md"}
            `}
          >
            <Save className="w-4 h-4" />
            {loading ? "Seeding..." : "Seed Question to Database"}
          </button>
        </div>
      </div>
    </div>
  );
}
