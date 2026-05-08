import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Code2,
  CheckCircle2,
  Circle,
  Flame,
} from "lucide-react";
import { toast } from "sonner";
import { problemService } from "../services/problemService";
import SelectDropdown from "../components/ui/SelectDropdown";

const SKILLS = [
  { value: "", label: "All skills" },
  { value: "JavaScript", label: "JavaScript" },
  { value: "Python", label: "Python" },
  // { value: "TypeScript", label: "TypeScript" },
  // { value: "React", label: "React" },
  // { value: "Node.js", label: "Node.js" },
  // { value: "Express", label: "Express" },
  // { value: "MongoDB", label: "MongoDB" },
];

const LEVELS = ["all", "beginner", "intermediate", "advanced"];
const LEVEL_COLORS = {
  beginner: { text: "var(--success)", bg: "var(--success-bg)" },
  intermediate: { text: "var(--warning)", bg: "var(--warning-bg)" },
  advanced: { text: "var(--danger)", bg: "var(--danger-bg)" },
};

export default function Problems() {
  const navigate = useNavigate();

  // Filters
  const [search, setSearch] = useState("");
  const [skill, setSkill] = useState("");
  const [level, setLevel] = useState("all");
  const [page, setPage] = useState(1);

  // Data
  const [problems, setProblems] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
  });
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [skillDropdownOpen, setSkillDropdownOpen] = useState(false);
  const skillDropdownRef = useRef(null);

  // Fetch problems
  const fetchProblems = useCallback(async () => {
    try {
      setLoading(true);
      const params = { page, limit: 20 };
      if (search) params.search = search;
      if (skill) params.skill = skill;
      if (level !== "all") params.level = level;

      const data = await problemService.listProblems(params);
      setProblems(data.problems);
      setPagination(data.pagination);
    } catch (error) {
      toast.error("Failed to load problems.");
    } finally {
      setLoading(false);
    }
  }, [page, search, skill, level]);

  // Fetch stats
  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await problemService.getUserStats();
        setStats(data.stats);
      } catch {
        // Stats are optional, fail silently
      }
    };
    loadStats();
  }, []);

  useEffect(() => {
    fetchProblems();
  }, [fetchProblems]);

  // Debounced search
  const [searchInput, setSearchInput] = useState("");
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  return (
    <div className="flex flex-col gap-6">
      {/* Header + Stats */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-[24px] font-medium text-[var(--text-primary)] tracking-[-0.01em]">
            Problem solving
          </h1>
          <p className="text-[14px] text-[var(--text-secondary)] mt-1">
            Practice coding problems to sharpen your skills.
          </p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="flex items-center gap-3">
            <div
              className="flex flex-col items-center px-4 py-2 rounded-[var(--radius-lg)] border"
              style={{
                background: "var(--bg-surface)",
                borderColor: "var(--border-subtle)",
              }}
            >
              <span className="text-[18px] font-medium text-[var(--text-primary)] font-[var(--font-mono)]">
                {stats.totalSolved}
              </span>
              <span className="text-[11px] text-[var(--text-tertiary)]">
                Solved
              </span>
            </div>
            <div
              className="flex flex-col items-center px-4 py-2 rounded-[var(--radius-lg)] border"
              style={{
                background: "var(--bg-surface)",
                borderColor: "var(--border-subtle)",
              }}
            >
              <div className="flex items-center gap-1">
                <Flame className="w-4 h-4 text-[var(--warning)]" />
                <span className="text-[18px] font-medium text-[var(--text-primary)] font-[var(--font-mono)]">
                  {stats.currentStreak}
                </span>
              </div>
              <span className="text-[11px] text-[var(--text-tertiary)]">
                Streak
              </span>
            </div>
            <div
              className="flex flex-col items-center px-4 py-2 rounded-[var(--radius-lg)] border"
              style={{
                background: "var(--bg-surface)",
                borderColor: "var(--border-subtle)",
              }}
            >
              <span className="text-[18px] font-medium text-[var(--text-primary)] font-[var(--font-mono)]">
                {stats.totalSubmissions}
              </span>
              <span className="text-[11px] text-[var(--text-tertiary)]">
                Submissions
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Difficulty Breakdown */}
      {stats && (
        <div className="flex items-center gap-4">
          {[
            { label: "Easy", count: stats.easySolved, color: "var(--success)" },
            {
              label: "Medium",
              count: stats.mediumSolved,
              color: "var(--warning)",
            },
            { label: "Hard", count: stats.hardSolved, color: "var(--danger)" },
          ].map((d) => (
            <div key={d.label} className="flex items-center gap-2 text-[13px]">
              <div
                className="w-2 h-2 rounded-full"
                style={{ background: d.color }}
              />
              <span className="text-[var(--text-secondary)]">{d.label}</span>
              <span className="font-medium text-[var(--text-primary)] font-[var(--font-mono)]">
                {d.count}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Filters Bar */}
      <div
        className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 p-4 rounded-[var(--radius-lg)] border"
        style={{
          background: "var(--bg-surface)",
          borderColor: "var(--border-subtle)",
        }}
      >
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
          <input
            type="text"
            placeholder="Search problems..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full border rounded-[var(--radius-md)] pl-9 pr-4 h-9 text-[13px] outline-none transition-all focus:border-[var(--accent)] focus:ring-2 focus:ring-[rgba(37,99,235,0.15)]"
            style={{
              background: "var(--bg-raised)",
              borderColor: "var(--border-base)",
              color: "var(--text-primary)",
            }}
          />
        </div>

        {/* Skill Filter — Custom Dropdown */}
        <SelectDropdown
          options={SKILLS}
          value={skill}
          onChange={(val) => {
            setSkill(val);
            setPage(1);
          }}
          placeholder="All skills"
        />

        {/* Level Tabs */}
        <div
          className="flex items-center gap-1 p-1 rounded-[var(--radius-md)]"
          style={{ background: "var(--bg-raised)" }}
        >
          {LEVELS.map((l) => (
            <button
              key={l}
              onClick={() => {
                setLevel(l);
                setPage(1);
              }}
              className="px-3 h-7 rounded-[var(--radius-sm)] text-[12px] font-medium transition-colors capitalize"
              style={{
                background: level === l ? "var(--bg-surface)" : "transparent",
                color:
                  level === l ? "var(--text-primary)" : "var(--text-tertiary)",
                boxShadow: level === l ? "var(--shadow-sm)" : "none",
              }}
            >
              {l === "all" ? "All" : l}
            </button>
          ))}
        </div>
      </div>

      {/* Problems Table */}
      <div
        className="rounded-[var(--radius-lg)] border overflow-hidden"
        style={{
          background: "var(--bg-surface)",
          borderColor: "var(--border-subtle)",
        }}
      >
        {/* Table Header */}
        <div
          className="grid grid-cols-[40px_1fr_120px_120px_80px] items-center h-10 px-4 text-[11px] font-medium tracking-wide text-[var(--text-tertiary)] border-b"
          style={{
            borderColor: "var(--border-subtle)",
            background: "var(--bg-raised)",
          }}
        >
          <span>#</span>
          <span>Problem</span>
          <span>Skill</span>
          <span>Difficulty</span>
          <span className="text-center">Status</span>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center h-32 text-[14px] text-[var(--text-secondary)] animate-pulse-subtle">
            Loading problems...
          </div>
        )}

        {/* Empty State */}
        {!loading && problems.length === 0 && (
          <div className="flex flex-col items-center justify-center h-40 gap-2">
            <Code2 className="w-8 h-8 text-[var(--text-tertiary)]" />
            <p className="text-[14px] text-[var(--text-secondary)]">
              No problems found.
            </p>
            <p className="text-[12px] text-[var(--text-tertiary)]">
              Try adjusting your filters.
            </p>
          </div>
        )}

        {/* Problem Rows */}
        {!loading &&
          problems.map((problem, idx) => {
            const levelStyle = LEVEL_COLORS[problem.level] || {};
            const rowIndex = (pagination.page - 1) * 20 + idx + 1;

            return (
              <div
                key={problem.questionId}
                onClick={() =>
                  navigate(`/dashboard/problems/${problem.questionId}`)
                }
                className="grid grid-cols-[40px_1fr_120px_120px_80px] items-center h-12 px-4 cursor-pointer transition-colors border-b last:border-b-0"
                style={{ borderColor: "var(--border-subtle)" }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "var(--bg-raised)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "transparent")
                }
              >
                <span className="text-[12px] text-[var(--text-tertiary)] font-[var(--font-mono)]">
                  {rowIndex}
                </span>
                <div className="flex flex-col gap-0.5 min-w-0">
                  <span className="text-[13px] text-[var(--text-primary)] font-medium truncate">
                    {problem.topic}
                  </span>
                  <span className="text-[11px] text-[var(--text-tertiary)] truncate">
                    {problem.question?.slice(0, 60)}
                    {problem.question?.length > 60 ? "..." : ""}
                  </span>
                </div>
                <span className="text-[12px] text-[var(--text-secondary)]">
                  {problem.skill}
                </span>
                <span
                  className="text-[11px] font-medium px-2 py-0.5 rounded-[var(--radius-sm)] w-fit capitalize"
                  style={{ background: levelStyle.bg, color: levelStyle.text }}
                >
                  {problem.level}
                </span>
                <div className="flex justify-center">
                  {problem.solved ? (
                    <CheckCircle2 className="w-4 h-4 text-[var(--success)]" />
                  ) : (
                    <Circle className="w-4 h-4 text-[var(--text-disabled)]" />
                  )}
                </div>
              </div>
            );
          })}
      </div>

      {/* Pagination */}
      {!loading && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-[12px] text-[var(--text-tertiary)]">
            Showing {(pagination.page - 1) * 20 + 1}–
            {Math.min(pagination.page * 20, pagination.total)} of{" "}
            {pagination.total}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="w-8 h-8 flex items-center justify-center rounded-[var(--radius-md)] border disabled:opacity-30 transition-colors"
              style={{
                borderColor: "var(--border-base)",
                color: "var(--text-secondary)",
              }}
              onMouseEnter={(e) => {
                if (!e.currentTarget.disabled)
                  e.currentTarget.style.background = "var(--bg-raised)";
              }}
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "transparent")
              }
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-[13px] text-[var(--text-primary)] font-medium font-[var(--font-mono)] min-w-[60px] text-center">
              {pagination.page} / {pagination.totalPages}
            </span>
            <button
              onClick={() =>
                setPage((p) => Math.min(pagination.totalPages, p + 1))
              }
              disabled={page === pagination.totalPages}
              className="w-8 h-8 flex items-center justify-center rounded-[var(--radius-md)] border disabled:opacity-30 transition-colors"
              style={{
                borderColor: "var(--border-base)",
                color: "var(--text-secondary)",
              }}
              onMouseEnter={(e) => {
                if (!e.currentTarget.disabled)
                  e.currentTarget.style.background = "var(--bg-raised)";
              }}
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "transparent")
              }
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
