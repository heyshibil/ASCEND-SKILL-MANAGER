import React, { useState, useRef, useEffect } from "react";
import * as skillService from "../services/skillService";
import { useNavigate } from "react-router-dom";

export default function SkillSelect({ initialSkills = [] }) {
  // initialSkills would be populated if coming from the GitHub scan prediction
  const [selectedSkills, setSelectedSkills] = useState(initialSkills);
  const [inputValue, setInputValue] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Pre-populated suggestions
  const defaultSuggestions = [
    "React",
    "Node.js",
    "Express",
    "MongoDB",
    "JavaScript",
    "TypeScript",
    "Zustand",
    "Redux",
    "HTML",
    "CSS",
    "Python",
    "Django",
    ".NET",
    "C#",
    "PostreSQL",
    "SQL",
  ];

  // Filter out already selected skills
  const availableSuggestions = defaultSuggestions.filter(
    (skill) =>
      !selectedSkills.some((s) => s.name.toLowerCase() === skill.toLowerCase()),
  );

  const filteredSuggestions = availableSuggestions.filter((skill) =>
    skill.toLowerCase().includes(inputValue.toLowerCase()),
  );

  // Handle outside click for dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAddSkill = (skillName) => {
    const trimmed = skillName.trim();
    if (!trimmed) return;

    // Prevent duplicates
    if (
      !selectedSkills.some(
        (s) => s.name.toLowerCase() === trimmed.toLowerCase(),
      )
    ) {
      setSelectedSkills([...selectedSkills, { name: trimmed, confidence: 50 }]);
    }
    setInputValue("");
    setIsDropdownOpen(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddSkill(inputValue);
    }
  };

  const handleRemoveSkill = (skillName) => {
    setSelectedSkills(selectedSkills.filter((s) => s.name !== skillName));
  };

  const handleConfidenceChange = (skillName, value) => {
    setSelectedSkills(
      selectedSkills.map((s) =>
        s.name === skillName ? { ...s, confidence: parseInt(value) } : s,
      ),
    );
  };

  const handleConfirm = async () => {
    setLoading(true);

    try {
      await skillService.initSkills(selectedSkills);
      navigate("/test?skill=JavaScript");
    } catch (error) {
      console.error("Failed to save skills:", error);
      alert("Failed to save skills. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Helper to calculate the slider's gradient color based on confidence (20 to 80)
  const getSliderBackground = (confidence) => {
    const percentage = ((confidence - 20) / (80 - 20)) * 100;
    // Shifts smoothly from indigo-500 to violet-400
    return `linear-gradient(to right, #6366f1 0%, #a78bfa ${percentage}%, rgba(255,255,255,0.05) ${percentage}%)`;
  };

  return (
    <div className="min-h-screen bg-[#0b0b0f] flex flex-col items-center py-20 px-6 relative overflow-hidden font-sans selection:bg-indigo-500/30">
      {/* Background Ambient Gradients */}
      <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] bg-[#312e81] rounded-full mix-blend-screen filter blur-[150px] opacity-20 pointer-events-none fixed"></div>
      <div className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] bg-[#1a1029] rounded-full mix-blend-screen filter blur-[150px] opacity-25 pointer-events-none fixed"></div>

      <div className="relative z-10 w-full max-w-2xl flex flex-col items-center">
        {/* Header Section */}
        <div className="text-center mb-8 w-full">
          <h1 className="text-3xl font-semibold text-white tracking-tight mb-2">
            Configure Your Skills
          </h1>
          <p className="text-sm text-slate-400 tracking-tight">
            Select your technologies and set your current confidence level.
          </p>
        </div>

        {/* Main Card */}
        <div className="w-full bg-white/[0.02] border border-white/10 backdrop-blur-xl rounded-2xl p-6 sm:p-8 shadow-2xl flex flex-col gap-8">
          {/* Input / Dropdown Section */}
          <div className="relative z-20" ref={dropdownRef}>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-medium text-slate-400 ml-1">
                Add a skill
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => {
                    setInputValue(e.target.value);
                    setIsDropdownOpen(true);
                  }}
                  onKeyDown={handleKeyDown}
                  onFocus={() => setIsDropdownOpen(true)}
                  placeholder="e.g. GraphQL, Docker..."
                  className="w-full bg-white/5 border border-white/10 text-white px-4 py-3.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-sm placeholder:text-slate-600"
                />
                <button
                  onClick={() => handleAddSkill(inputValue)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white p-1.5 rounded-lg transition-colors cursor-pointer"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Dropdown Menu */}
            {isDropdownOpen &&
              (inputValue || filteredSuggestions.length > 0) && (
                <div className="absolute top-full left-0 w-full mt-2 bg-[#12121a] border border-white/10 rounded-xl shadow-2xl overflow-hidden max-h-48 overflow-y-auto z-50 py-1">
                  {filteredSuggestions.length > 0 ? (
                    filteredSuggestions.map((skill) => (
                      <button
                        key={skill}
                        onClick={() => handleAddSkill(skill)}
                        className="w-full text-left px-4 py-2.5 text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-colors cursor-pointer"
                      >
                        {skill}
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-3 text-sm text-slate-500">
                      Press Enter to add "{inputValue}"
                    </div>
                  )}
                </div>
              )}
          </div>

          {/* Selected Skills List */}
          <div className="flex flex-col gap-3">
            <h3 className="text-xs font-medium text-slate-400 ml-1 border-b border-white/5 pb-2">
              Selected Skills ({selectedSkills.length})
            </h3>

            {selectedSkills.length === 0 ? (
              <div className="py-8 text-center text-sm text-slate-500 border border-dashed border-white/10 rounded-xl bg-white/[0.01]">
                No skills added yet. Search or type above.
              </div>
            ) : (
              <div className="flex flex-col gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {selectedSkills.map((skill) => (
                  <div
                    key={skill.name}
                    className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.05] transition-colors group"
                  >
                    {/* Skill Name & Remove */}
                    <div className="flex items-center justify-between sm:w-1/3">
                      <span className="text-sm font-medium text-slate-200">
                        {skill.name}
                      </span>
                      <button
                        onClick={() => handleRemoveSkill(skill.name)}
                        className="text-slate-500 hover:text-red-400 transition-colors sm:hidden"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>

                    {/* Slider Section */}
                    <div className="flex items-center gap-4 flex-1">
                      <span className="text-xs text-slate-500 w-8">20%</span>

                      <div className="relative flex-1 flex items-center h-5">
                        <input
                          type="range"
                          min="20"
                          max="80"
                          value={skill.confidence}
                          onChange={(e) =>
                            handleConfidenceChange(skill.name, e.target.value)
                          }
                          className="absolute w-full h-1.5 appearance-none rounded-full cursor-pointer z-10 bg-transparent [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(167,139,250,0.6)] [&::-webkit-slider-thumb]:transition-transform hover:[&::-webkit-slider-thumb]:scale-110"
                        />
                        {/* Custom Track Background */}
                        <div
                          className="absolute w-full h-1.5 rounded-full pointer-events-none"
                          style={{
                            background: getSliderBackground(skill.confidence),
                          }}
                        ></div>
                      </div>

                      <div className="flex items-center gap-3 w-16 justify-end">
                        <span className="text-xs font-medium text-indigo-300 w-8 text-right">
                          {skill.confidence}%
                        </span>
                        <button
                          onClick={() => handleRemoveSkill(skill.name)}
                          className="text-slate-500 hover:text-red-400 transition-colors hidden sm:block opacity-0 group-hover:opacity-100 cursor-pointer"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Footer */}
          <div className="pt-4 border-t border-white/5">
            <button
              onClick={handleConfirm}
              disabled={selectedSkills.length === 0}
              className="w-full bg-white text-black hover:bg-slate-200 disabled:bg-white/20 disabled:text-white/40 disabled:cursor-not-allowed font-medium px-4 py-3.5 rounded-xl transition-all text-sm shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:shadow-[0_0_20px_rgba(255,255,255,0.2)] cursor-pointer"
            >
              Confirm Skills
            </button>
          </div>
        </div>
      </div>

      {/* Optional: Add custom scrollbar styling to your global CSS */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.02);
          border-radius: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `,
        }}
      />
    </div>
  );
}
