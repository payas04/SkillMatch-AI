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
  { id: "technical", label: "Technical Questions" },
  { id: "behavioral", label: "Behavioral Questions" },
  { id: "plan", label: "Preparation Plan" },
];

/* ---------- small pieces ---------- */

function SectionCard({ title, subtitle, children, className = "" }) {
  return (
    <div
      className={`bg-neutral-900/80 border border-white/10 rounded-2xl p-5 ${className}`}
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
    return <p className="text-sm text-gray-500">No gaps identified.</p>;
  }
  return (
    <div className="space-y-2">
      {gaps.map((g, i) => {
        const s = SEVERITY_STYLES[g.severity] || SEVERITY_STYLES.medium;
        return (
          <div
            key={i}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10"
          >
            <span className={`w-1.5 h-1.5 rounded-full ${s.dot} shrink-0`} />
            <span className="text-sm text-gray-200">{g.skill}</span>
          </div>
        );
      })}
    </div>
  );
}

// Left sidebar: section nav
function SectionNav({ active, onSelect }) {
  return (
    <div className="bg-neutral-900/80 border border-white/10 rounded-2xl p-2 sticky top-6">
      {NAV_ITEMS.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => onSelect(item.id)}
          className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
            active === item.id
              ? "bg-indigo-400/15 text-indigo-300 border border-indigo-400/40"
              : "text-gray-400 hover:bg-white/5 border border-transparent"
          }`}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}

// Middle: question list
function QuestionList({ questions }) {
  if (!questions || questions.length === 0) {
    return (
      <div className="bg-neutral-900/80 border border-white/10 rounded-2xl p-8 text-center">
        <p className="text-sm text-gray-500">No questions generated.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {questions.map((q, i) => (
        <div
          key={i}
          className="bg-neutral-900/80 border border-white/10 rounded-2xl p-6"
        >
          <div className="flex gap-3">
            <span className="text-sm font-semibold text-indigo-400 shrink-0">
              {String(i + 1).padStart(2, "0")}
            </span>
            <h3 className="text-base font-medium text-white leading-snug">
              {q.question}
            </h3>
          </div>
          {q.intention && (
            <div className="mt-5 pl-8">
              <p className="text-xs font-medium text-gray-500 mb-1">
                Why they ask this
              </p>
              <p className="text-sm text-gray-400 leading-relaxed">
                {q.intention}
              </p>
            </div>
          )}
          {q.answer && (
            <div className="mt-4 pl-8">
              <p className="text-xs font-medium text-gray-500 mb-1">
                Strong answer covers
              </p>
              <p className="text-sm text-gray-300 leading-relaxed">
                {q.answer}
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// Middle: preparation plan
function FullPreparationPlan({ plan }) {
  if (!plan || plan.length === 0) {
    return (
      <div className="bg-neutral-900/80 border border-white/10 rounded-2xl p-8 text-center">
        <p className="text-sm text-gray-500">No plan generated.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {plan.map((p) => (
        <div
          key={p.day}
          className="bg-neutral-900/80 border border-white/10 rounded-2xl p-6"
        >
          <p className="text-sm font-semibold text-indigo-400">
            Day {p.day} — {p.focus}
          </p>
          <ul className="mt-3 space-y-2">
            {(p.tasks || []).map((task, i) => (
              <li
                key={i}
                className="flex items-start gap-3 text-sm text-gray-300"
              >
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />
                <span>{task}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

/* ---------- page ---------- */

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
    <div className="min-h-screen w-full text-white bg-black/40">
      <nav className="w-full px-8 py-2 flex items-center justify-between border-b border-white/10 bg-neutral-950/60 backdrop-blur-md">
        <h1 className="text-2xl font-bold tracking-tight">
          SkillMatch <span className="text-indigo-400">AI</span>
        </h1>
        <span className="flex items-center">
          {/* Button indicates loading in the background without blocking the page */}
          <button
            onClick={() => {
              getResumePdf(interviewId);
            }}
            disabled={isGeneratingResume}
            className="px-5 py-2 mr-2 text-sm font-semibold text-indigo-300 border border-indigo-400/40 rounded-xl bg-indigo-400/15 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center gap-2 transition-all"
          >
            {isGeneratingResume ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-indigo-300 border-t-transparent rounded-full animate-spin" />
                Generating Resume...
              </>
            ) : (
              "Generate Resume"
            )}
          </button>
          <Link
            to="/home"
            className="px-5 py-2 text-sm font-semibold text-white border border-white/20 rounded-xl bg-black/20 hover:bg-white/10 hover:border-white/40"
          >
            Back to Home
          </Link>
        </span>
      </nav>

      <main className="flex-1 p-6 md:p-10">
        <div className="w-full max-w-7xl mx-auto space-y-6">
          {loading ? (
            <div className="bg-neutral-900/80 border border-white/10 rounded-2xl p-16 flex flex-col items-center justify-center text-center">
              <div className="w-10 h-10 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-sm text-gray-400">
                Building your interview plan
              </p>
            </div>
          ) : !data ? (
            <div className="bg-neutral-900/80 border border-white/10 rounded-2xl p-16 flex flex-col items-center justify-center text-center">
              <p className="text-base font-medium text-gray-200">
                No report found
              </p>
              <p className="text-sm text-gray-500 mt-1 max-w-sm">
                This report doesn't exist or hasn't finished generating. Head
                back and start a new one.
              </p>
              <Link
                to="/home"
                className="mt-6 px-5 py-2 text-sm font-semibold text-white border border-white/20 rounded-xl bg-black/20 hover:bg-white/10"
              >
                Back to Home
              </Link>
            </div>
          ) : (
            <>
              {/* Title */}
              <div>
                <h2 className="text-xl md:text-2xl font-semibold text-white tracking-tight">
                  {data.title}
                </h2>
                {data.createdAt && (
                  <p className="text-xs text-gray-500 mt-1">
                    Generated {formatDate(data.createdAt)}
                  </p>
                )}
              </div>

              {/* Three-column layout */}
              <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr_280px] gap-6 items-start">
                {/* Left: section nav */}
                <SectionNav active={active} onSelect={setActive} />

                {/* Middle: active section */}
                <div>
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

                {/* Right: score + skill gaps */}
                <div className="space-y-6">
                  <div className="bg-neutral-900/80 border border-white/10 rounded-2xl p-6 flex justify-center">
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
