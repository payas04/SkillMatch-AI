import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { authService } from "../services/authService";

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!token) {
      setError("This password reset link is invalid.");
      return;
    }

    setIsSubmitting(true);
    try {
      const data = await authService.resetPassword({ token, password });
      setMessage(data.message);
      setTimeout(() => navigate("/login"), 1200);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to reset your password. Please request a new link.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 text-white">
      <div className="w-full max-w-md bg-white/5 border border-white/10 rounded-xl sm:rounded-2xl p-5 sm:p-8 shadow-2xl backdrop-blur-md">
        <div className="text-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Reset <span className="text-indigo-400">password</span>
          </h1>
          <p className="text-sm text-gray-400 mt-2">
            Choose a new password for your account.
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

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-200 mb-1.5"
            >
              New password
            </label>
            <input
              id="password"
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="At least 8 characters"
              className="block w-full rounded-xl bg-white/5 border border-white/10 px-3.5 py-2.5 text-sm text-white placeholder:text-gray-500 outline-none transition focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400"
            />
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-200 mb-1.5"
            >
              Confirm password
            </label>
            <input
              id="confirmPassword"
              type="password"
              required
              minLength={8}
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="Re-enter your password"
              className="block w-full rounded-xl bg-white/5 border border-white/10 px-3.5 py-2.5 text-sm text-white placeholder:text-gray-500 outline-none transition focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 px-4 rounded-xl font-semibold text-sm text-white bg-indigo-600 hover:bg-indigo-500 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Resetting..." : "Reset password"}
          </button>
        </form>

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
export default ResetPasswordPage;
