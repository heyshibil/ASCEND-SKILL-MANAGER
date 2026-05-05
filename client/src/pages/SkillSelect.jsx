import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import useAuthStore from "../store/useAuthStore";
import { toast } from "sonner";
import { ChevronDown, Plus, X, Search, Loader2 } from "lucide-react";
import { initSkills } from "../services/skillService";
import { useSkillCatalogStore } from "../store/useSkillCatalogStore";
import { useScanPolling } from "../hooks/useScanPolling";

/**
 * Derives which core languages are implied by a list of submitted skills.
 */
function deriveCoresFromSkills(skills) {
  const cores = new Set();
  skills.forEach(({ name }) => {
    const n = name.toLowerCase();
    if (/react|express|node|next|vue|javascript|typescript/.test(n)) cores.add("JavaScript");
    if (/django|flask|python|pandas/.test(n)) cores.add("Python");
    if (n === "java" || /spring/.test(n)) cores.add("Java");
    if (/\.net|c#|entity/.test(n)) cores.add("C#");
  });
  if (cores.size === 0) cores.add("JavaScript");
  return Array.from(cores);
}

export default function SkillSelect() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const predictedParam = searchParams.get("predicted");
  const coresParam     = searchParams.get("cores");
  const scanJobId      = searchParams.get("scanJobId");

  const user       = useAuthStore((s) => s.user);
  const checkAuth  = useAuthStore((s) => s.checkAuth);

  const catalogSkills  = useSkillCatalogStore((s) => s.skills);
  const catalogLoading = useSkillCatalogStore((s) => s.isLoading);
  const fetchCatalog   = useSkillCatalogStore((s) => s.fetchCatalog);

  // ── UI state ──────────────────────────────────────────────────────────────
  const [submittedSkills,    setSubmittedSkills]    = useState([]);
  const [selectedSkill,      setSelectedSkill]      = useState("");
  const [confidence,         setConfidence]         = useState(50);
  const [loading,            setLoading]            = useState(false);
  const [dropdownOpen,       setDropdownOpen]       = useState(false);
  const [searchTerm,         setSearchTerm]         = useState("");

  const [selectedCoreLanguage, setSelectedCoreLanguage] = useState("");

  const availableCores = useMemo(
    () => submittedSkills.length > 0 ? deriveCoresFromSkills(submittedSkills) : [],
    [submittedSkills],
  );

  /**
   * Filtered skill list for the dropdown — memoised so it doesn't recalculate
   */
  const filteredOptions = useMemo(
    () =>
      catalogSkills.filter(
        (skill) =>
          skill.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !submittedSkills.some((s) => s.name === skill.name),
      ),
    [catalogSkills, searchTerm, submittedSkills],
  );

  // 1. Fetch catalog once on mount
  useEffect(() => { fetchCatalog(); }, [fetchCatalog]);

  // 2. Redirect already-onboarded users
  useEffect(() => {
    if (user?.onboardingStatus === "completed") navigate("/dashboard");
  }, [user, navigate]);

  // 3a. One-time seed: use coresParam from URL as the initial selectedCoreLanguage.
  useEffect(() => {
    if (!coresParam || selectedCoreLanguage) return;
    const first = coresParam.split(",").filter(Boolean)[0];
    if (first) setSelectedCoreLanguage(first);
  }, [coresParam]); // selectedCoreLanguage omitted — seed once only

  // 3b. Keep selection valid as skills are added/removed.
  //     If the selected core no longer exists in the derived list, fall back.
  useEffect(() => {
    if (availableCores.length === 0) return;
    if (!availableCores.includes(selectedCoreLanguage)) {
      setSelectedCoreLanguage(availableCores[0]);
    }
  }, [availableCores]);

  // 4. Pre-populate skills from URL predicted param (runs once catalog is ready)
  useEffect(() => {
    if (!predictedParam || catalogSkills.length === 0 || submittedSkills.length > 0) return;

    const initial = predictedParam
      .split(",")
      .reduce((acc, raw) => {
        const found = catalogSkills.find(
          (s) => s.name.toLowerCase() === raw.trim().toLowerCase(),
        );
        if (found && !acc.some((s) => s.name === found.name)) {
          acc.push({ name: found.name, confidence: 50 });
        }
        return acc;
      }, []);

    if (initial.length > 0) setSubmittedSkills(initial);
  }, [predictedParam, catalogSkills]);

  // 5. Scan polling — extracted into a focused custom hook
  const isScanning = useScanPolling(scanJobId, searchParams, setSearchParams);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleAddSkill = () => {
    if (!selectedSkill) return;
    if (submittedSkills.some((s) => s.name === selectedSkill)) {
      return toast.error("Skill already added.");
    }
    setSubmittedSkills((prev) => [...prev, { name: selectedSkill, confidence }]);
    setSelectedSkill("");
    setConfidence(50);
    setSearchTerm("");
  };

  const handleRemoveSkill = (index) => {
    setSubmittedSkills((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpdateConfidence = (index, newConfidence) => {
    setSubmittedSkills((prev) =>
      prev.map((s, i) => (i === index ? { ...s, confidence: newConfidence } : s)),
    );
  };

  const handleConfirmAndTest = async () => {
    if (submittedSkills.length < 3) return toast.error("Please add at least 3 skills.");

    setLoading(true);
    try {
      await initSkills({
        skills: submittedSkills,
        coreLanguage: selectedCoreLanguage || "JavaScript",
      });
      await checkAuth();
      navigate(`/test?skill=${encodeURIComponent(selectedCoreLanguage || "JavaScript")}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to start verification.");
    } finally {
      setLoading(false);
    }
  };

  if (isScanning) return <ScanningScreen />;

  return (
    <div
      className="theme-dark min-h-screen flex flex-col items-center justify-center px-6 py-16 font-[var(--font-sans)]"
      style={{ background: "var(--bg-canvas)" }}
    >
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

        {/* Core Language Selection */}
        {availableCores.length > 0 && (
          <div
            className="rounded-[var(--radius-lg)] border p-6 flex flex-col gap-4"
            style={{ background: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}
          >
            <div className="flex flex-col gap-1.5">
              <label className="text-[14px] font-medium text-[var(--text-primary)]">
                Confirm your core language
              </label>
              <p className="text-[12px] text-[var(--text-secondary)]">
                This language will be used to calibrate your compiler verification tests.
              </p>
              <div className="flex flex-wrap gap-3 mt-2">
                {availableCores.map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setSelectedCoreLanguage(lang)}
                    className={`px-4 py-2 rounded-[var(--radius-md)] text-[14px] font-medium border transition-all duration-200 ${
                      selectedCoreLanguage === lang
                        ? "bg-[#2563EB] text-white border-[#2563EB]"
                        : "bg-transparent text-[var(--text-secondary)] border-[var(--border-base)] hover:bg-[var(--bg-raised)] hover:text-[var(--text-primary)]"
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Selection Card */}
        <div
          className="rounded-[var(--radius-lg)] border p-6 flex flex-col gap-6"
          style={{ background: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}
        >
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
              onClick={() => setDropdownOpen((o) => !o)}
              style={{
                background: "var(--bg-surface)",
                borderColor: dropdownOpen ? "var(--accent)" : "var(--border-base)",
                color: selectedSkill ? "var(--text-primary)" : "var(--text-tertiary)",
                boxShadow: dropdownOpen ? "0 0 0 2px rgba(37,99,235,0.15)" : "none",
              }}
            >
              <span>{selectedSkill || "Choose a skill..."}</span>
              <ChevronDown
                className={`w-4 h-4 text-[var(--text-tertiary)] transition-transform duration-200 ${
                  dropdownOpen ? "rotate-180" : ""
                }`}
              />
            </div>

            {dropdownOpen && (
              <div
                className="absolute top-[calc(100%+4px)] left-0 w-full z-50 rounded-[var(--radius-lg)] overflow-hidden"
                style={{
                  background: "var(--bg-surface)",
                  border: "1px solid var(--border-subtle)",
                  boxShadow: "var(--shadow-md)",
                }}
              >
                <div className="p-2 border-b" style={{ borderColor: "var(--border-subtle)" }}>
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
                        key={skill._id}
                        onClick={() => {
                          setSelectedSkill(skill.name);
                          setDropdownOpen(false);
                          setSearchTerm("");
                        }}
                        className="px-3 py-2 text-[14px] cursor-pointer transition-colors text-[var(--text-secondary)] hover:bg-[var(--bg-raised)] hover:text-[var(--text-primary)]"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <span>{skill.name}</span>
                          <span className="text-[11px] text-[var(--text-tertiary)]">{skill.category}</span>
                        </div>
                      </div>
                    ))
                  ) : catalogLoading ? (
                    <div className="p-3 text-[13px] text-[var(--text-tertiary)] text-center">
                      Loading presets...
                    </div>
                  ) : (
                    <div className="p-3 text-[13px] text-[var(--text-tertiary)] text-center">
                      No skills found
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Confidence Slider */}
          {selectedSkill && (
            <div className="flex flex-col gap-2 transition-all">
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
          )}

          {/* Add Button */}
          <button
            onClick={handleAddSkill}
            disabled={!selectedSkill}
            className="flex items-center justify-center gap-2 w-full h-9 border rounded-[var(--radius-md)] text-[14px] font-medium transition-colors disabled:opacity-30"
            style={{ borderColor: "var(--border-base)", color: "var(--text-secondary)" }}
            onMouseEnter={(e) => { if (selectedSkill) e.currentTarget.style.background = "var(--bg-raised)"; }}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            <Plus className="w-4 h-4" />
            Add skill
          </button>
        </div>

        {/* Selected Skills List */}
        {submittedSkills.length > 0 && (
          <div
            className="rounded-[var(--radius-lg)] border p-6 flex flex-col gap-4"
            style={{ background: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}
          >
            <div className="flex justify-between items-center">
              <h2 className="text-[15px] font-medium text-[var(--text-primary)]">Selected skills</h2>
              <span className="text-[12px] font-medium text-[var(--text-tertiary)]">
                {submittedSkills.length} selected
              </span>
            </div>

            <div className="flex flex-col gap-2">
              {submittedSkills.map((skill, index) => (
                <div
                  key={skill.name}
                  className="flex flex-col gap-2 py-2 px-3 rounded-[var(--radius-md)] border"
                  style={{ background: "var(--bg-raised)", borderColor: "var(--border-subtle)" }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[14px] font-medium text-[var(--text-primary)]">{skill.name}</span>
                    <button
                      onClick={() => handleRemoveSkill(index)}
                      className="text-[var(--text-tertiary)] hover:text-[var(--danger)] transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={skill.confidence}
                      onChange={(e) => handleUpdateConfidence(index, Number(e.target.value))}
                      className="w-full accent-[#2563EB] h-1"
                    />
                    <span className="text-[12px] text-[var(--text-tertiary)] font-[var(--font-mono)] w-8 text-right shrink-0">
                      {skill.confidence}%
                    </span>
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
                <><Loader2 className="w-4 h-4 animate-spin" />Initializing...</>
              ) : submittedSkills.length < 3 ? (
                `Confirm & start verification (${submittedSkills.length}/3 min)`
              ) : (
                "Confirm & start verification"
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function ScanningScreen() {
  return (
    <div
      className="theme-dark min-h-screen flex flex-col items-center justify-center px-6 py-16 font-[var(--font-sans)]"
      style={{ background: "var(--bg-canvas)" }}
    >
      <div className="flex flex-col items-center gap-6 max-w-sm text-center">
        <div className="w-16 h-16 rounded-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex items-center justify-center shadow-lg relative">
          <Loader2 className="w-8 h-8 text-[#2563EB] animate-spin absolute" />
          <svg className="w-4 h-4 text-[var(--text-secondary)]" fill="currentColor" viewBox="0 0 24 24">
            <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
          </svg>
        </div>
        <div>
          <h2 className="text-[18px] font-medium text-[var(--text-primary)]">Scanning Repositories</h2>
          <p className="text-[13px] text-[var(--text-secondary)] mt-2 leading-relaxed">
            We're analyzing your GitHub profile to extract your tech stack and framework proficiencies. This usually takes a few seconds.
          </p>
        </div>
      </div>
    </div>
  );
}