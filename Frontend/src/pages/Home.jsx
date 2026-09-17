import { Link, useNavigate } from "react-router";
import { useInterviewStore } from "../store/interviewStore";
import useAuthStore from "../store/authStore";
import { useEffect, useState } from "react";
import ScoreGauge from "../components/ScoreGauge";

function formatDate(iso) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

const Home = () => {
  const [jd, setJd] = useState("");
  const [selfDescription, setSelfDescription] = useState("");
  const [file, setFile] = useState(null);
  const [formError, setFormError] = useState(null);
  const navigate = useNavigate();
  const logoutUser = useAuthStore((state) => state.logout);

  const {
    generateReport,
    loading,
    reports,
    reportsLoading,
    reportsError,
    fetchAllReports,
  } = useInterviewStore();

  useEffect(() => {
    fetchAllReports().catch(() => {});
  }, []);

  async function onSubmit() {
    setFormError(null);
    if (!jd.trim()) {
      setFormError("Please provide a job description to generate your plan.");
      return;
    }
    if (!file) {
      setFormError("Please upload your resume (PDF) to proceed.");
      return;
    }

    try {
      const newReport = await generateReport(jd, selfDescription, file);
      const reportId = newReport?._id || newReport?.id;
      if (reportId) {
        navigate(`/interview/${reportId}`);
      }
    } catch (err) {
      const msg =
        err.response?.data?.message?.trim() ||
        err.response?.data?.error ||
        "Failed to generate interview report. Please check your inputs and try again.";
      setFormError(msg);
    }
  }

  return (
    <div className="min-h-screen w-full flex flex-col text-white bg-black/40">
      {/* Top Navbar */}
      <nav className="cursor-default w-full px-4 sm:px-8 py-3 flex items-center justify-between border-b border-white/10 bg-neutral-950/60 backdrop-blur-md">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
          SkillMatch <span className="text-indigo-400">AI</span>
        </h1>
        <button
          onClick={logoutUser}
          type="button"
          className="px-3.5 sm:px-5 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold text-white border border-white/20 rounded-xl bg-black/20 hover:bg-white/10 hover:border-white/40 cursor-pointer transition-colors active:scale-[0.98]"
        >
          Logout
        </button>
      </nav>

      {/* Main content */}
      <main className="flex-1 p-4 sm:p-6 md:p-10">
        <div className="w-full max-w-5xl mx-auto space-y-6 sm:space-y-10">
          {/* Create report card */}
          <div className="bg-neutral-900/70 border border-white/10 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 shadow-2xl backdrop-blur-md">
            <div className="mb-6 text-center">
              <h2 className="text-xl sm:text-3xl font-semibold text-white">
                Create your custom{" "}
                <span className="text-indigo-400">interview plan</span>
              </h2>
              <p className="text-xs sm:text-sm text-gray-400 mt-1 max-w-md mx-auto">
                Let AI analyze the job requirements and your profile to build a
                winning strategy
              </p>
            </div>

            {/* Error Banner */}
            {formError && (
              <div className="mb-6 flex items-start gap-3 p-3 sm:p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs sm:text-sm">
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5 text-rose-400 shrink-0 mt-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                <div className="flex-1 leading-snug">{formError}</div>
                <button
                  type="button"
                  onClick={() => setFormError(null)}
                  className="text-rose-400 hover:text-rose-200 text-lg leading-none cursor-pointer"
                >
                  &times;
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {/* Left Column: Text Inputs */}
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="jobDescription"
                    className="block text-xs sm:text-sm font-medium text-gray-200"
                  >
                    Job Description <span className="text-rose-400">*</span>
                  </label>
                  <textarea
                    id="jobDescription"
                    rows={4}
                    value={jd}
                    placeholder="Paste the target job description here..."
                    className="mt-2 block w-full rounded-lg sm:rounded-md bg-white/5 p-3 text-xs sm:text-sm text-white outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 resize-none"
                    onChange={(e) => {
                      setJd(e.target.value);
                      if (formError) setFormError(null);
                    }}
                  />
                </div>

                <div>
                  <label
                    htmlFor="selfDescription"
                    className="block text-xs sm:text-sm font-medium text-gray-200"
                  >
                    Self Description
                  </label>
                  <textarea
                    id="selfDescription"
                    rows={3}
                    value={selfDescription}
                    placeholder="Briefly describe your experience, skills, and background..."
                    className="mt-2 block w-full rounded-lg sm:rounded-md bg-white/5 p-3 text-xs sm:text-sm text-white outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 resize-none"
                    onChange={(e) => setSelfDescription(e.target.value)}
                  />
                </div>
              </div>

              {/* Right Column: Resume Upload & Action */}
              <div className="flex flex-col justify-between space-y-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-200 mb-2">
                    Upload Resume <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative border-2 border-dashed border-white/20 hover:border-indigo-400 rounded-xl p-6 sm:p-8 text-center flex flex-col items-center justify-center cursor-pointer bg-white/5 transition-colors">
                    <input
                      type="file"
                      name="resume"
                      id="resume"
                      accept=".pdf"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      onChange={(e) => {
                        setFile(e.target.files[0]);
                        if (formError) setFormError(null);
                      }}
                    />
                    <div className="space-y-1">
                      <p className="text-xs sm:text-sm font-medium text-gray-200">
                        Click to browse or drag & drop
                      </p>
                      <p className="text-[11px] sm:text-xs text-gray-400">
                        Only PDF files up to 5MB
                      </p>
                      {file && (
                        <p className="text-xs text-indigo-300 font-medium break-all mt-2">
                          Selected: {file.name}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={onSubmit}
                    disabled={loading}
                    className="w-full py-2.5 sm:py-3 px-6 sm:px-8 text-xs sm:text-sm md:text-base text-white bg-indigo-500 sm:hover:scale-[1.02] active:scale-[0.98] rounded-xl font-semibold cursor-pointer shadow-lg shadow-indigo-600/20 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                  >
                    {loading ? "Generating Plan..." : "Generate Report"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Recent reports */}
          <div>
            <h2 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4">
              Recent Reports
            </h2>
            {reportsLoading && (
              <p className="text-xs sm:text-sm text-gray-400">
                Loading reports...
              </p>
            )}
            {reportsError && (
              <p className="text-xs sm:text-sm text-rose-400">{reportsError}</p>
            )}
            {!reportsLoading && !reportsError && reports?.length === 0 && (
              <div className="bg-neutral-900/70 border border-white/10 rounded-xl sm:rounded-2xl p-6 sm:p-10 text-center">
                <p className="text-xs sm:text-sm text-gray-400">
                  No reports yet — generate one above to get started.
                </p>
              </div>
            )}
            {!reportsLoading && reports?.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                {reports.map((report) => (
                  <Link
                    key={report._id}
                    to={`/interview/${report._id}`}
                    className="bg-neutral-900/70 border border-white/10 rounded-xl sm:rounded-2xl p-4 sm:p-6 hover:border-white/30 hover:bg-neutral-900 sm:hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center gap-3.5 sm:gap-5"
                  >
                    <ScoreGauge
                      score={report.matchScore}
                      size={52}
                      showLabel={false}
                    />
                    <div className="min-w-0 flex-1">
                      <h3 className="text-xs sm:text-sm font-medium text-white truncate">
                        {report.title}
                      </h3>
                      <p className="text-[11px] sm:text-xs text-gray-500 mt-0.5">
                        {formatDate(report.createdAt)}
                      </p>
                      <p className="text-[11px] sm:text-xs text-gray-400 mt-1 line-clamp-2">
                        {report.jobDescription}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;
