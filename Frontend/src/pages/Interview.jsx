import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router";
import { useInterviewStore } from "../store/interviewStore";
import ScoreGauge from "../components/ScoreGauge";

/* ---------- helpers ---------- */
const SEVERITY_STYLES = {
  high: { dot: "bg-rose-400", text: "text-rose-300" },
  medium: { dot: "bg-amber-400", text: "text-amber-300" },
  low: { dot: "bg-sky-400", text: "text-sky-300" },
};

function formatDate(iso) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const NAV_ITEMS = [
  { id: "technical", label: "Technical", fullLabel: "Technical Questions" },
  { id: "behavioral", label: "Behavioral", fullLabel: "Behavioral Questions" },
  { id: "plan", label: "Prep Plan", fullLabel: "Preparation Plan" },
];

/* ---------- sub-components ---------- */
function SectionCard({ title, subtitle, children, className = "" }) {
  return (
    <div
      className={`bg-neutral-900/80 border border-white/10 rounded-xl sm:rounded-2xl p-4 sm:p-5 ${className}`}
    >
      <div className="mb-3">
        <h3 className="text-sm font-semibold text-gray-200">{title}</h3>
        {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

function SkillGaps({ gaps }) {
  if (!gaps || gaps.length === 0) {
    return (
      <p className="text-xs sm:text-sm text-gray-500">No gaps identified.</p>
    );
  }

  return (
    <div className="space-y-2">
      {gaps.map((g, i) => {
        const s = SEVERITY_STYLES[g.severity] || SEVERITY_STYLES.medium;
        return (
          <div
            key={i}
            className="flex items-center gap-2 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-lg bg-white/5 border border-white/10"
          >
            <span className={`w-1.5 h-1.5 rounded-full ${s.dot} shrink-0`} />
            <span className="text-xs sm:text-sm text-gray-200">{g.skill}</span>
          </div>
        );
      })}
    </div>
  );
}

// Fixed Segmented Nav — Zero horizontal scroll on mobile, vertical column on desktop
function SectionNav({ active, onSelect }) {
  return (
    <div className="bg-neutral-900/90 border border-white/10 rounded-xl lg:rounded-2xl p-1 lg:p-2 sticky top-2 lg:top-6 z-20 backdrop-blur-md">
      <div className="grid grid-cols-3 lg:grid-cols-1 gap-1 w-full">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelect(item.id)}
            className={`text-center lg:text-left px-2 sm:px-4 py-2 sm:py-3 rounded-lg lg:rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer ${
              active === item.id
                ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shadow-sm font-semibold"
                : "text-gray-400 hover:bg-white/5 border border-transparent"
            }`}
          >
            <span className="lg:hidden">{item.label}</span>
            <span className="hidden lg:inline">{item.fullLabel}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// Collapsible Question Accordion to remove infinite scroll
function QuestionList({ questions }) {
  const [openIndices, setOpenIndices] = useState(() => new Set([0]));

  if (!questions || questions.length === 0) {
    return (
      <div className="bg-neutral-900/80 border border-white/10 rounded-xl lg:rounded-2xl p-6 text-center">
        <p className="text-sm text-gray-500">No questions generated.</p>
      </div>
    );
  }

  const toggleQuestion = (idx) => {
    setOpenIndices((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const allOpen = openIndices.size === questions.length;
  const toggleAll = () => {
    if (allOpen) setOpenIndices(new Set());
    else setOpenIndices(new Set(questions.map((_, i) => i)));
  };

  return (
    <div className="space-y-2.5 sm:space-y-3">
      {/* Quick Controls */}
      <div className="flex items-center justify-between px-1 text-xs text-gray-400">
        <span>{questions.length} Questions</span>
        <button
          type="button"
          onClick={toggleAll}
          className="text-indigo-400 hover:text-indigo-300 font-medium cursor-pointer"
        >
          {allOpen ? "Collapse all" : "Expand all"}
        </button>
      </div>

      {questions.map((q, i) => {
        const isOpen = openIndices.has(i);
        return (
          <div
            key={i}
            className="bg-neutral-900/80 border border-white/10 rounded-xl lg:rounded-2xl overflow-hidden transition-colors"
          >
            <button
              type="button"
              onClick={() => toggleQuestion(i)}
              className="w-full text-left p-3.5 sm:p-5 flex items-start gap-3 cursor-pointer hover:bg-white/[0.02]"
            >
              <span className="text-xs sm:text-sm font-semibold text-indigo-400 shrink-0 mt-0.5">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="text-xs sm:text-sm lg:text-base font-medium text-white leading-snug flex-1">
                {q.question}
              </h3>
              <svg
                className={`w-4 h-4 text-gray-400 shrink-0 mt-0.5 transition-transform duration-200 ${
                  isOpen ? "rotate-180 text-indigo-400" : ""
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {isOpen && (
              <div className="px-3.5 sm:px-5 pb-4 sm:pb-5 pt-0 border-t border-white/5 space-y-3 sm:space-y-4">
                {q.intention && (
                  <div className="mt-3 sm:pl-7">
                    <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
                      Why they ask this
                    </p>
                    <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                      {q.intention}
                    </p>
                  </div>
                )}
                {q.answer && (
                  <div className="sm:pl-7">
                    <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-indigo-400 mb-1">
                      Strong answer covers
                    </p>
                    <p className="text-xs sm:text-sm text-gray-300 leading-relaxed bg-white/5 p-3 rounded-lg border border-white/5">
                      {q.answer}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// Collapsible Day Schedule
function FullPreparationPlan({ plan }) {
  const [openDays, setOpenDays] = useState(() => new Set([plan?.[0]?.day]));

  if (!plan || plan.length === 0) {
    return (
      <div className="bg-neutral-900/80 border border-white/10 rounded-xl lg:rounded-2xl p-6 text-center">
        <p className="text-sm text-gray-500">No plan generated.</p>
      </div>
    );
  }

  const toggleDay = (day) => {
    setOpenDays((prev) => {
      const next = new Set(prev);
      if (next.has(day)) next.delete(day);
      else next.add(day);
      return next;
    });
  };

  const allOpen = openDays.size === plan.length;
  const toggleAll = () => {
    if (allOpen) setOpenDays(new Set());
    else setOpenDays(new Set(plan.map((p) => p.day)));
  };

  return (
    <div className="space-y-2.5 sm:space-y-3">
      <div className="flex items-center justify-between px-1 text-xs text-gray-400">
        <span>{plan.length} Days Planned</span>
        <button
          type="button"
          onClick={toggleAll}
          className="text-indigo-400 hover:text-indigo-300 font-medium cursor-pointer"
        >
          {allOpen ? "Collapse all" : "Expand all"}
        </button>
      </div>

      {plan.map((p) => {
        const isOpen = openDays.has(p.day);
        return (
          <div
            key={p.day}
            className="bg-neutral-900/80 border border-white/10 rounded-xl lg:rounded-2xl overflow-hidden"
          >
            <button
              type="button"
              onClick={() => toggleDay(p.day)}
              className="w-full text-left p-3.5 sm:p-5 flex items-center justify-between cursor-pointer hover:bg-white/[0.02]"
            >
              <div className="flex items-center gap-2.5">
                <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Day {p.day}
                </span>
                <span className="text-xs sm:text-sm font-medium text-white">
                  {p.focus}
                </span>
              </div>
              <svg
                className={`w-4 h-4 text-gray-400 shrink-0 transition-transform duration-200 ${
                  isOpen ? "rotate-180 text-indigo-400" : ""
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {isOpen && (
              <div className="px-3.5 sm:px-5 pb-4 pt-1 border-t border-white/5">
                <ul className="space-y-2">
                  {(p.tasks || []).map((task, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2.5 text-xs sm:text-sm text-gray-300"
                    >
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />
                      <span>{task}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ---------- main page ---------- */
const Interview = () => {
  const { interviewId } = useParams();
  const { report, loading, fetchReportById, getResumePdf, isGeneratingResume } =
    useInterviewStore();
  const [active, setActive] = useState("technical");

  useEffect(() => {
    if (interviewId) {
      fetchReportById(interviewId);
    }
  }, [interviewId, fetchReportById]);

  const data = report?.interviewReport || report;

  return (
    <div className="min-h-screen w-full text-white bg-black/40 overflow-x-hidden">
      {/* Top Navbar: Compact with zero overflow */}
      <nav className="w-full px-3.5 sm:px-8 py-2.5 sm:py-3 flex items-center justify-between border-b border-white/10 bg-neutral-950/70 backdrop-blur-md">
        <h1 className="text-lg sm:text-2xl font-bold tracking-tight shrink-0">
          SkillMatch <span className="text-indigo-400">AI</span>
        </h1>
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <button
            onClick={() => getResumePdf(interviewId)}
            disabled={isGeneratingResume}
            className="px-2.5 sm:px-4 py-1.5 text-xs sm:text-sm font-semibold text-indigo-300 border border-indigo-400/40 rounded-lg sm:rounded-xl bg-indigo-400/15 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center gap-1.5 transition-all active:scale-[0.98]"
          >
            {isGeneratingResume ? (
              <>
                <span className="w-3 h-3 border-2 border-indigo-300 border-t-transparent rounded-full animate-spin shrink-0" />
                <span>Generating...</span>
              </>
            ) : (
              <>
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <span>Resume</span>
              </>
            )}
          </button>
          <Link
            to="/home"
            className="px-2.5 sm:px-4 py-1.5 text-xs sm:text-sm font-semibold text-white border border-white/20 rounded-lg sm:rounded-xl bg-black/20 hover:bg-white/10 transition-colors active:scale-[0.98]"
          >
            Home
          </Link>
        </div>
      </nav>

      {/* Main Container */}
      <main className="flex-1 p-3.5 sm:p-6 md:p-10">
        <div className="w-full max-w-7xl mx-auto space-y-4 sm:space-y-6">
          {loading ? (
            <div className="bg-neutral-900/80 border border-white/10 rounded-2xl p-10 flex flex-col items-center justify-center text-center">
              <div className="w-8 h-8 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin mb-3" />
              <p className="text-xs sm:text-sm text-gray-400">
                Building your interview plan...
              </p>
            </div>
          ) : !data ? (
            <div className="bg-neutral-900/80 border border-white/10 rounded-2xl p-8 text-center">
              <p className="text-base font-medium text-gray-200">
                No report found
              </p>
              <Link
                to="/home"
                className="mt-4 inline-block px-4 py-2 text-xs sm:text-sm font-semibold text-white border border-white/20 rounded-xl bg-black/20"
              >
                Back to Home
              </Link>
            </div>
          ) : (
            <>
              {/* Report Header */}
              <div>
                <h2 className="text-base sm:text-2xl font-semibold text-white tracking-tight break-words">
                  {data.title}
                </h2>
                {data.createdAt && (
                  <p className="text-[11px] sm:text-xs text-gray-500 mt-0.5">
                    Generated {formatDate(data.createdAt)}
                  </p>
                )}
              </div>

              {/* MOBILE ONLY: Top Score & Skill Gaps card (avoids scrolling to the bottom) */}
              <div className="lg:hidden bg-neutral-900/80 border border-white/10 rounded-xl p-3.5 flex items-center gap-4">
                <div className="shrink-0">
                  <ScoreGauge score={data.matchScore} size={68} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                    Priority Skill Gaps
                  </p>
                  <SkillGaps gaps={data.skillGaps?.slice(0, 3)} />
                </div>
              </div>

              {/* Layout: Single column stacked on mobile, 3-column on desktop */}
              <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr_280px] gap-4 sm:gap-6 items-start">
                {/* Fixed Non-Scrolling Nav Tabs */}
                <SectionNav active={active} onSelect={setActive} />

                {/* Section Content Accordions */}
                <div className="min-w-0">
                  {active === "technical" && (
                    <QuestionList questions={data.technicalQuestions} />
                  )}
                  {active === "behavioral" && (
                    <QuestionList questions={data.behavioralQuestions} />
                  )}
                  {active === "plan" && (
                    <FullPreparationPlan plan={data.preparationPlan} />
                  )}
                </div>

                {/* DESKTOP ONLY: Sidebar score & skill gaps */}
                <div className="hidden lg:block space-y-6">
                  <div className="bg-neutral-900/80 border border-white/10 rounded-2xl p-6 flex justify-center items-center">
                    <ScoreGauge score={data.matchScore} />
                  </div>
                  <SectionCard
                    title="Skill gaps to close"
                    subtitle="Ranked by priority"
                  >
                    <SkillGaps gaps={data.skillGaps} />
                  </SectionCard>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default Interview;
