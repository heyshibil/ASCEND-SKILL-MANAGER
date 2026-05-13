import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import useAuthStore from "../store/useAuthStore";
import { toast } from "sonner";
import { ChevronDown, ChevronUp, Plus, X, Search, Loader2, Upload, FileText, CheckCircle2, AlertCircle } from "lucide-react";
import { createPortal } from "react-dom";
import { initSkills, parseResume } from "../services/skillService";
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

const getLevelFromConfidence = (confidence) => {
  if (confidence > 70) return "advanced";
  if (confidence > 35) return "intermediate";
  return "beginner";
};

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

  // ── CV panel toggle ───────────────────────────────────────────────────────
  const [cvPanelOpen, setCvPanelOpen] = useState(false);
  const [resumeParsing, setResumeParsing] = useState(false);
  const [resumeResult, setResumeResult] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  // ── Dropdown anchor ref for fixed positioning ─────────────────────────────
  const dropdownAnchorRef = useRef(null);
  const [dropdownRect, setDropdownRect] = useState(null);

  const openDropdown = useCallback(() => {
    if (dropdownAnchorRef.current) {
      setDropdownRect(dropdownAnchorRef.current.getBoundingClientRect());
    }
    setDropdownOpen(true);
  }, []);

  const closeDropdown = useCallback(() => {
    setDropdownOpen(false);
    setDropdownRect(null);
  }, []);

  const [selectedCoreLanguage, setSelectedCoreLanguage] = useState("");

  const availableCores = useMemo(
    () => submittedSkills.length > 0 ? deriveCoresFromSkills(submittedSkills) : [],
    [submittedSkills],
  );

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
  }, [coresParam]);

  // 3b. Keep selection valid as skills are added/removed.
  useEffect(() => {
    if (availableCores.length === 0) return;
    if (!availableCores.includes(selectedCoreLanguage)) {
      setSelectedCoreLanguage(availableCores[0]);
    }
  }, [availableCores]);

  // 4. Pre-populate skills from URL predicted param
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

  // 5. Scan polling
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

      // Determine the max confidence from the skills they entered
      const maxConfidence = submittedSkills.reduce((max, s) => Math.max(max, s.confidence), 0);
      const chosenLevel = getLevelFromConfidence(maxConfidence)

      navigate(`/test?skill=${encodeURIComponent(selectedCoreLanguage || "JavaScript")}&level=${chosenLevel}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to start verification.");
    } finally {
      setLoading(false);
    }
  };

  // ── Resume Handlers ─────────────────────────────────────────────────────

  const handleResumeFile = useCallback(async (file) => {
    if (!file) return;

    const validTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (!validTypes.includes(file.type)) {
      return toast.error("Only PDF and DOCX files are allowed.");
    }
    if (file.size > 5 * 1024 * 1024) {
      return toast.error("File must be under 5MB.");
    }

    setResumeParsing(true);
    setResumeResult(null);
    try {
      const data = await parseResume(file);
      setResumeResult(data);

      const totalNew = data.newSkills?.length || 0;
      const totalDetected = data.allDetected?.length || 0;

      if (totalDetected === 0) {
        toast.error("No recognized skills found in this file.");
      } else if (totalNew === 0) {
        toast.info(`Found ${totalDetected} skills — all already added.`);
      } else {
        toast.success(`Detected ${totalNew} new skill${totalNew > 1 ? "s" : ""} from your resume!`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to parse resume.");
      setResumeResult(null);
    } finally {
      setResumeParsing(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer?.files?.[0];
    if (file) handleResumeFile(file);
  }, [handleResumeFile]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleAddResumeSkill = (skillName) => {
    if (submittedSkills.some((s) => s.name === skillName)) {
      return toast.error("Skill already added.");
    }
    setSubmittedSkills((prev) => [...prev, { name: skillName, confidence: 50 }]);
    setResumeResult((prev) => ({
      ...prev,
      newSkills: prev.newSkills.filter((s) => s.name !== skillName),
      alreadyOwned: (prev.alreadyOwned || 0) + 1,
    }));
  };

  const handleAddAllResumeSkills = () => {
    if (!resumeResult?.newSkills?.length) return;
    const existingNames = new Set(submittedSkills.map((s) => s.name));
    const toAdd = resumeResult.newSkills
      .filter((s) => !existingNames.has(s.name))
      .map((s) => ({ name: s.name, confidence: 50 }));

    if (toAdd.length === 0) return toast.info("All skills already added.");

    setSubmittedSkills((prev) => [...prev, ...toAdd]);
    setResumeResult((prev) => ({
      ...prev,
      newSkills: [],
      alreadyOwned: (prev.alreadyOwned || 0) + toAdd.length,
    }));
    toast.success(`Added ${toAdd.length} skill${toAdd.length > 1 ? "s" : ""}.`);
  };

  if (isScanning) return <ScanningScreen />;

  return (
    <div
      className="theme-dark min-h-screen flex flex-col items-center justify-center px-8 py-12 font-[var(--font-sans)]"
      style={{ background: "var(--bg-canvas)" }}
    >
      <div className="w-full max-w-5xl flex flex-col gap-10 relative z-10">

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div>
          <h1 className="text-[26px] font-medium text-[var(--text-primary)] tracking-[-0.02em]">
            Skill discovery
          </h1>
          <p className="text-[14px] text-[var(--text-secondary)] mt-2 max-w-lg leading-relaxed">
            Select your primary tech skills for verification. The first skill will be tested immediately.
          </p>
        </div>

        {/* ── Two-column body ─────────────────────────────────────────────── */}
        {/* Changed from items-stretch to items-start to prevent columns from stretching continuously */}
        <div className="grid grid-cols-[1fr_1.2fr] gap-8 items-start">

          {/* ══ LEFT COLUMN — CV import + core language ══════════════════ */}
          {/* Added `sticky top-10` to keep it firmly fixed in viewport as the right side scrolls */}
          <div className="flex flex-col gap-6 sticky top-10">

            {/* CV / Resume panel */}
            {/* Swapped `flex-1` for `min-h-[340px]` to maintain initial equal heights without scaling */}
            <div
              className="rounded-[var(--radius-lg)] border p-6 flex flex-col gap-5 min-h-[340px]"
              style={{ background: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}
            >
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4" style={{ color: "var(--accent)" }} />
                  <h2 className="text-[14px] font-medium text-[var(--text-primary)]">
                    Extract from CV / Resume
                  </h2>
                </div>
                <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed">
                  Auto-detect skills from your resume. Supports PDF and DOCX, max 5 MB.
                </p>
              </div>

              {/* Drop Zone */}
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center justify-center gap-3 rounded-[var(--radius-md)] border-2 border-dashed cursor-pointer transition-all flex-1"
                style={{
                  minHeight: "140px",
                  borderColor: dragOver ? "var(--accent)" : "var(--border-base)",
                  background: dragOver ? "var(--accent-bg)" : "var(--bg-raised)",
                  boxShadow: dragOver ? "0 0 0 3px rgba(37,99,235,0.1)" : "none",
                }}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.docx"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleResumeFile(file);
                    e.target.value = "";
                  }}
                  className="hidden"
                />
                {resumeParsing ? (
                  <>
                    <Loader2 className="w-6 h-6 text-[var(--accent)] animate-spin" />
                    <span className="text-[13px] text-[var(--text-secondary)]">Parsing resume…</span>
                  </>
                ) : (
                  <>
                    <Upload
                      className="w-6 h-6 transition-colors"
                      style={{ color: dragOver ? "var(--accent)" : "var(--text-tertiary)" }}
                    />
                    <div className="text-center px-4">
                      <p className="text-[13px] text-[var(--text-secondary)]">
                        {dragOver ? "Release to upload" : (
                          <>Drop here or{" "}
                            <span style={{ color: "var(--accent)", fontWeight: 500 }}>click to browse</span>
                          </>
                        )}
                      </p>
                      <p className="text-[11px] text-[var(--text-tertiary)] mt-1">PDF · DOCX · Max 5 MB</p>
                    </div>
                  </>
                )}
              </div>

              {/* Detected Skills */}
              {resumeResult && (resumeResult.newSkills?.length > 0 || resumeResult.alreadyOwned > 0) && (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
                      Detected
                    </span>
                    {resumeResult.newSkills?.length > 0 && (
                      <button
                        onClick={handleAddAllResumeSkills}
                        className="text-[12px] font-medium text-[var(--accent)] hover:underline"
                      >
                        Add all ({resumeResult.newSkills.length})
                      </button>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {resumeResult.newSkills?.map((s) => (
                      <button
                        key={s.name}
                        onClick={() => handleAddResumeSkill(s.name)}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-[var(--radius-md)] border text-[12px] font-medium transition-all"
                        style={{ borderColor: "var(--accent)", color: "var(--accent)", background: "var(--accent-bg)" }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = "var(--accent)"; e.currentTarget.style.color = "#fff"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = "var(--accent-bg)"; e.currentTarget.style.color = "var(--accent)"; }}
                      >
                        <Plus className="w-3 h-3" />
                        {s.name}
                        <span className="text-[10px] opacity-60">{s.category}</span>
                      </button>
                    ))}
                    {resumeResult.alreadyOwned > 0 && (
                      <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-[var(--radius-md)] text-[12px] text-[var(--text-tertiary)]">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {resumeResult.alreadyOwned} already added
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* No skills found */}
              {resumeResult && resumeResult.allDetected?.length === 0 && (
                <div
                  className="flex items-center gap-2 px-3 py-2.5 rounded-[var(--radius-md)] text-[12px]"
                  style={{ background: "var(--warning-bg)", color: "var(--warning)" }}
                >
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  No platform-supported skills detected. Try adding manually.
                </div>
              )}
            </div>

            {/* Core Language — only shown once skills exist */}
            {availableCores.length > 0 && (
              <div
                className="rounded-[var(--radius-lg)] border p-6 flex flex-col gap-4"
                style={{ background: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}
              >
                <div className="flex flex-col gap-1">
                  <label className="text-[14px] font-medium text-[var(--text-primary)]">
                    Core language
                  </label>
                  <p className="text-[12px] text-[var(--text-secondary)]">
                    Calibrates your compiler verification tests.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {availableCores.map((lang) => (
                    <button
                      key={lang}
                      onClick={() => setSelectedCoreLanguage(lang)}
                      className={`px-4 py-2 rounded-[var(--radius-md)] text-[13px] font-medium border transition-all duration-200 ${
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
            )}
          </div>

          {/* ══ RIGHT COLUMN — skill selector + selected list ════════════ */}
          <div className="flex flex-col gap-6">

            {/* Skill selector card */}
            {/* Added `min-h-[340px]` so it matches the initial visual height of the left column */}
            <div
              className="rounded-[var(--radius-lg)] border p-6 flex flex-col gap-6 min-h-[340px]"
              style={{ background: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}
            >
              <div className="flex flex-col gap-1">
                <h2 className="text-[14px] font-medium text-[var(--text-primary)]">Add a skill</h2>
                <p className="text-[12px] text-[var(--text-secondary)]">
                  Choose from the catalog and set your confidence level.
                </p>
              </div>

              {/* Dropdown trigger */}
              <div className="flex flex-col gap-1.5 relative">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
                  Select skill
                </label>
                <div
                  ref={dropdownAnchorRef}
                  className="flex items-center justify-between w-full border h-10 rounded-[var(--radius-md)] px-3.5 cursor-pointer text-[14px]"
                  onClick={() => dropdownOpen ? closeDropdown() : openDropdown()}
                  style={{
                    background: "var(--bg-raised)",
                    borderColor: dropdownOpen ? "var(--accent)" : "var(--border-base)",
                    color: selectedSkill ? "var(--text-primary)" : "var(--text-tertiary)",
                    boxShadow: dropdownOpen ? "0 0 0 2px rgba(37,99,235,0.15)" : "none",
                  }}
                >
                  <span>{selectedSkill || "Choose a skill…"}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-[var(--text-tertiary)] transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`}
                  />
                </div>

                {/* Fixed-position dropdown panel & backdrop */}
                {dropdownOpen && dropdownRect && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={closeDropdown} />
                    
                    <div
                      className="z-50 rounded-[var(--radius-lg)] overflow-hidden"
                      style={{
                        position: "fixed",
                        top: dropdownRect.bottom + 4,
                        left: dropdownRect.left,
                        width: dropdownRect.width,
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
                            placeholder="Search skills…"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-transparent text-[14px] outline-none text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)]"
                            autoFocus
                          />
                        </div>
                      </div>
                      <div className="max-h-[300px] overflow-y-auto overscroll-contain">
                        {filteredOptions.length > 0 ? (
                          filteredOptions.map((skill) => (
                            <div
                              key={skill._id}
                              onClick={() => { setSelectedSkill(skill.name); closeDropdown(); setSearchTerm(""); }}
                              className="px-3.5 py-2.5 text-[14px] cursor-pointer transition-colors text-[var(--text-secondary)] hover:bg-[var(--bg-raised)] hover:text-[var(--text-primary)]"
                            >
                              <div className="flex items-center justify-between gap-3">
                                <span>{skill.name}</span>
                                <span className="text-[11px] text-[var(--text-tertiary)]">{skill.category}</span>
                              </div>
                            </div>
                          ))
                        ) : catalogLoading ? (
                          <div className="p-4 text-[13px] text-[var(--text-tertiary)] text-center">Loading presets…</div>
                        ) : (
                          <div className="p-4 text-[13px] text-[var(--text-tertiary)] text-center">No skills found</div>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Confidence Slider */}
              {selectedSkill && (
                <div className="flex flex-col gap-2.5">
                  <div className="flex justify-between text-[12px]">
                    <span className="text-[var(--text-secondary)] font-medium">Confidence level</span>
                    <span className="font-medium" style={{ color: "var(--accent)" }}>{confidence}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={confidence}
                    onChange={(e) => setConfidence(Number(e.target.value))}
                    className="w-full accent-[#2563EB]"
                  />
                  <div className="flex justify-between text-[10px] text-[var(--text-tertiary)]">
                    <span>Beginner</span>
                    <span>Expert</span>
                  </div>
                </div>
              )}

              {/* Add Button */}
              <button
                onClick={handleAddSkill}
                disabled={!selectedSkill}
                className="flex items-center justify-center gap-2 w-full h-10 border rounded-[var(--radius-md)] text-[13px] font-medium transition-colors disabled:opacity-30 mt-auto"
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
                className="rounded-[var(--radius-lg)] border p-6 flex flex-col gap-5"
                style={{ background: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}
              >
                <div className="flex justify-between items-center">
                  <h2 className="text-[14px] font-medium text-[var(--text-primary)]">Selected skills</h2>
                  <span
                    className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                    style={{
                      background: submittedSkills.length >= 3 ? "rgba(37,99,235,0.12)" : "var(--bg-raised)",
                      color: submittedSkills.length >= 3 ? "var(--accent)" : "var(--text-tertiary)",
                    }}
                  >
                    {submittedSkills.length} / 3 min
                  </span>
                </div>

                <div className="flex flex-col gap-2">
                  {submittedSkills.map((skill, index) => (
                    <div
                      key={skill.name}
                      className="flex flex-col gap-2.5 py-3 px-4 rounded-[var(--radius-md)] border"
                      style={{ background: "var(--bg-raised)", borderColor: "var(--border-subtle)" }}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[13px] font-medium text-[var(--text-primary)]">{skill.name}</span>
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
                  className="w-full h-11 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-medium rounded-[var(--radius-md)] text-[14px] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <><Loader2 className="w-4 h-4 animate-spin" />Initializing…</>
                  ) : submittedSkills.length < 3 ? (
                    `Add ${3 - submittedSkills.length} more skill${3 - submittedSkills.length > 1 ? "s" : ""} to continue`
                  ) : (
                    "Confirm & start verification"
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
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