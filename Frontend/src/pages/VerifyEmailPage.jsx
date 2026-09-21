import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { authService } from "../services/authService";

const VerifyEmailPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const emailFromState = location.state?.email || "";
  const [email, setEmail] = useState(emailFromState);
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const handleVerify = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    setIsSubmitting(true);
    try {
      const data = await authService.verifyEmail({
        email: email.trim(),
        code,
      });
      setMessage(data.message);
      setTimeout(() => navigate("/login"), 900);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Verification failed. Please check the code and try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    setError("");
    setMessage("");

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    setIsResending(true);
    try {
      const data = await authService.resendVerification(email.trim());
      setMessage(data.message);
    } catch {
      setError("Unable to resend the code. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 text-white">
      <div className="w-full max-w-md bg-white/5 border border-white/10 rounded-xl sm:rounded-2xl p-5 sm:p-8 shadow-2xl backdrop-blur-md">
        <div className="text-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Verify your <span className="text-indigo-400">email</span>
          </h1>
          <p className="text-sm text-gray-400 mt-2">
            We sent a 6-digit verification code to your email.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm">
            {error}
          </div>
        )}

        {message && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm">
            {message}
          </div>
        )}

        <form onSubmit={handleVerify} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-200 mb-1.5"
            >
              Email address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              className="block w-full rounded-xl bg-white/5 border border-white/10 px-3.5 py-2.5 text-sm text-white placeholder:text-gray-500 outline-none transition focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400"
            />
          </div>

          <div>
            <label
              htmlFor="code"
              className="block text-sm font-medium text-gray-200 mb-1.5"
            >
              Verification code
            </label>
            <input
              id="code"
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={code}
              onChange={(event) =>
                setCode(event.target.value.replace(/\D/g, "").slice(0, 6))
              }
              placeholder="123456"
              className="block w-full rounded-xl bg-white/5 border border-white/10 px-3.5 py-2.5 text-sm tracking-[0.35em] text-white placeholder:text-gray-500 placeholder:tracking-normal outline-none transition focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 px-4 rounded-xl font-semibold text-sm text-white bg-indigo-600 hover:bg-indigo-500 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Verifying..." : "Verify email"}
          </button>
        </form>

        <button
          type="button"
          onClick={handleResend}
          disabled={isResending}
          className="w-full mt-3 py-2.5 px-4 rounded-xl font-medium text-sm text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer disabled:opacity-60"
        >
          {isResending ? "Sending..." : "Resend code"}
        </button>

        <p className="mt-5 text-center text-sm text-gray-400">
          <Link
            to="/login"
            className="font-semibold text-indigo-400 hover:text-indigo-300"
          >
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default VerifyEmailPage;
