import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../store/useAuthStore";
import { verificationService } from "../services/verificationService";
import { toast, Toaster } from "sonner";
import { ChevronDown, Plus, X, Search, Loader2 } from "lucide-react";

const SKILL_OPTIONS = [
  "JavaScript",
  "TypeScript",
  "React",
  "Node.js",
  "Express",
  "MongoDB",
  "Python",
  "GraphQL",
  "Docker",
  "Kubernetes",
  "AWS",
  "Redux",
  "Next.js",
  "Vue.js",
  "Angular",
  "Rust",
  "Go",
  "Java",
  "C++",
  "PostgreSQL",
  "Redis",
  "Firebase",
  "TailwindCSS",
  "SASS",
  "Git",
  "CI/CD",
  "Jest",
  "Cypress",
];

export default function SkillSelect() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const checkAuth = useAuthStore((state) => state.checkAuth);

  const [selectedSkill, setSelectedSkill] = useState("");
  const [confidence, setConfidence] = useState(50);
  const [submittedSkills, setSubmittedSkills] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredOptions = SKILL_OPTIONS.filter(
    (s) =>
      s.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !submittedSkills.find((sub) => sub.name === s),
  );

  // PROTECTED - Redirect to dashboard if already onboarded
  useEffect(() => {
    if (user?.onboardingStatus === "completed") {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const handleAddSkill = () => {
    if (!selectedSkill) return;

    if (submittedSkills.length >= 5) {
      return toast.error("Maximum of 5 skills allowed.");
    }

    if (submittedSkills.find((s) => s.name === selectedSkill)) {
      return toast.error("Skill already added.");
    }

    setSubmittedSkills([
      ...submittedSkills,
      { name: selectedSkill, confidence },
    ]);
    setSelectedSkill("");
    setConfidence(50);
    setSearchTerm("");
  };

  const handleRemoveSkill = (index) => {
    const newList = [...submittedSkills];
    newList.splice(index, 1);
    setSubmittedSkills(newList);
  };

  const handleConfirmAndTest = async () => {
    if (submittedSkills.length < 3) {
      return toast.error("Please add at least 3 skills.");
    }

    setLoading(true);
    try {
      const firstSkill = submittedSkills[0];
      await verificationService.saveSkillsAndStartTest(
        submittedSkills,
        firstSkill.name,
      );
      await checkAuth();
      navigate(`/test?skill=${encodeURIComponent(firstSkill.name)}`);
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to start verification.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="theme-dark min-h-screen flex flex-col items-center justify-center px-6 py-16 font-[var(--font-sans)]" style={{ background: 'var(--bg-canvas)' }}>
      <Toaster theme="dark" position="top-center" richColors />

      <div className="w-full max-w-lg flex flex-col gap-8 relative z-10">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-[24px] font-medium text-[var(--text-primary)] tracking-[-0.01em]">
            Skill discovery
          </h1>
          <p className="text-[14px] text-[var(--text-secondary)] mt-2 max-w-md mx-auto">
            Select your primary tech skills for verification. The first skill will be tested immediately.
          </p>
        </div>

        {/* Selection Card */}
        <div className="rounded-[var(--radius-lg)] border p-6 flex flex-col gap-6" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}>
          {/* Dropdown */}
          <div className="flex flex-col gap-1.5 relative">
            <label className="text-[12px] font-medium text-[var(--text-secondary)]">
              Select skill
            </label>
            {dropdownOpen && (
              <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
            )}
            <div
              className="relative z-50 flex items-center justify-between w-full border h-9 rounded-[var(--radius-md)] px-3 cursor-pointer text-[14px]"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              style={{
                background: 'var(--bg-surface)',
                borderColor: dropdownOpen ? 'var(--accent)' : 'var(--border-base)',
                color: selectedSkill ? 'var(--text-primary)' : 'var(--text-tertiary)',
                boxShadow: dropdownOpen ? '0 0 0 2px rgba(37,99,235,0.15)' : 'none',
              }}
            >
              <span>{selectedSkill || "Choose a skill..."}</span>
              <ChevronDown className={`w-4 h-4 text-[var(--text-tertiary)] transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`} />
            </div>

            {dropdownOpen && (
              <div className="absolute top-[calc(100%+4px)] left-0 w-full z-50 rounded-[var(--radius-lg)] overflow-hidden" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-md)' }}>
                <div className="p-2 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
                  <div className="flex items-center gap-2 px-2">
                    <Search className="w-4 h-4 text-[var(--text-tertiary)]" />
                    <input
                      type="text"
                      placeholder="Search skills..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full bg-transparent text-[14px] outline-none text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)]"
                      autoFocus
                    />
                  </div>
                </div>
                <div className="max-h-56 overflow-y-auto">
                  {filteredOptions.length > 0 ? (
                    filteredOptions.map((skill) => (
                      <div
                        key={skill}
                        onClick={() => {
                          setSelectedSkill(skill);
                          setDropdownOpen(false);
                          setSearchTerm("");
                        }}
                        className="px-3 py-2 text-[14px] cursor-pointer transition-colors text-[var(--text-secondary)] hover:bg-[var(--bg-raised)] hover:text-[var(--text-primary)]"
                      >
                        {skill}
                      </div>
                    ))
                  ) : (
                    <div className="p-3 text-[13px] text-[var(--text-tertiary)] text-center">No skills found</div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Slider */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between text-[12px]">
              <span className="text-[var(--text-secondary)] font-medium">Confidence level</span>
              <span className="text-[var(--accent)] font-medium">{confidence}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={confidence}
              onChange={(e) => setConfidence(Number(e.target.value))}
              className="w-full accent-[#2563EB]"
            />
          </div>

          {/* Add Button */}
          <button
            onClick={handleAddSkill}
            disabled={!selectedSkill}
            className="flex items-center justify-center gap-2 w-full h-9 border rounded-[var(--radius-md)] text-[14px] font-medium transition-colors disabled:opacity-30"
            style={{ borderColor: 'var(--border-base)', color: 'var(--text-secondary)' }}
            onMouseEnter={(e) => { if (selectedSkill) e.currentTarget.style.background = 'var(--bg-raised)'; }}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <Plus className="w-4 h-4" />
            Add skill
          </button>
        </div>

        {/* Selected Skills List */}
        {submittedSkills.length > 0 && (
          <div className="rounded-[var(--radius-lg)] border p-6 flex flex-col gap-4" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}>
            <div className="flex justify-between items-center">
              <h2 className="text-[15px] font-medium text-[var(--text-primary)]">Selected skills</h2>
              <span className="text-[12px] font-medium text-[var(--text-tertiary)]">{submittedSkills.length}/5</span>
            </div>

            <div className="flex flex-col gap-2">
              {submittedSkills.map((skill, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between h-10 px-3 rounded-[var(--radius-md)] border"
                  style={{ background: 'var(--bg-raised)', borderColor: 'var(--border-subtle)' }}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[14px] font-medium text-[var(--text-primary)]">{skill.name}</span>
                    {index === 0 && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-medium" style={{ background: 'var(--accent-bg)', color: 'var(--accent)' }}>Test first</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[12px] text-[var(--text-tertiary)] font-[var(--font-mono)]">
                      {skill.confidence}%
                    </span>
                    <button
                      onClick={() => handleRemoveSkill(index)}
                      className="text-[var(--text-tertiary)] hover:text-[var(--danger)] transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={handleConfirmAndTest}
              disabled={loading || submittedSkills.length < 3}
              className="mt-2 w-full h-10 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-medium rounded-[var(--radius-md)] text-[14px] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Initializing...
                </>
              ) : (
                `Confirm & start verification (${submittedSkills.length}/3 min)`
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
