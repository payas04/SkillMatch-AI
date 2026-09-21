import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema } from "../zod/registerSchema";
import useAuthStore from "../store/authStore";

const RegisterPage = () => {
  const navigate = useNavigate();
  const registerUser = useAuthStore((state) => state.register);
  const [apiError, setApiError] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data) => {
    setApiError(null);
    try {
      const { confirmPassword, ...registrationData } = data;

      await registerUser(registrationData);
      navigate("/home");
    } catch (err) {
      const serverMsg =
        err.response?.data?.message?.trim() ||
        (err.response?.data?.errors &&
          Object.values(err.response.data.errors)[0]?.[0]) ||
        "Registration failed. Please check your details and try again.";
      setApiError(serverMsg);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_BASE_URL}/auth/google`;
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 text-white">
      <div className="w-full max-w-md bg-white/5 border border-white/10 rounded-xl sm:rounded-2xl p-5 sm:p-8 shadow-2xl backdrop-blur-md">
        {/* Brand Header */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            SkillMatch <span className="text-indigo-400">AI</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1.5 sm:mt-2">
            Create an account to start generating tailored interview plans.
          </p>
        </div>

        {/* Server / API Error Banner */}
        {apiError && (
          <div className="mb-6 flex items-start gap-3 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm animate-in fade-in duration-150">
            <svg
              className="w-5 h-5 text-rose-400 shrink-0 mt-0.5"
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
            <div className="flex-1 leading-snug">{apiError}</div>
            <button
              type="button"
              onClick={() => setApiError(null)}
              className="text-rose-400 hover:text-rose-200 text-lg leading-none cursor-pointer"
            >
              &times;
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Username Input */}
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-200 mb-1.5"
            >
              Username
            </label>
            <input
              {...register("username")}
              id="username"
              type="text"
              autoComplete="username"
              placeholder="johndoe"
              onChange={() => apiError && setApiError(null)}
              className="block w-full rounded-xl bg-white/5 border border-white/10 px-3.5 py-2.5 text-sm text-white placeholder:text-gray-500 outline-none transition focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400"
            />
            {errors.username && (
              <p className="text-xs text-rose-400 mt-1.5">
                {errors.username.message}
              </p>
            )}
          </div>

          {/* Email Input */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-200 mb-1.5"
            >
              Email address
            </label>
            <input
              {...register("email")}
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              onChange={() => apiError && setApiError(null)}
              className="block w-full rounded-xl bg-white/5 border border-white/10 px-3.5 py-2.5 text-sm text-white placeholder:text-gray-500 outline-none transition focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400"
            />
            {errors.email && (
              <p className="text-xs text-rose-400 mt-1.5">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password Input */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-200 mb-1.5"
            >
              Password
            </label>
            <input
              {...register("password")}
              id="password"
              type="password"
              autoComplete="new-password"
              placeholder="At least 8 characters"
              onChange={() => apiError && setApiError(null)}
              className="block w-full rounded-xl bg-white/5 border border-white/10 px-3.5 py-2.5 text-sm text-white placeholder:text-gray-500 outline-none transition focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400"
            />
            {errors.password && (
              <p className="text-xs text-rose-400 mt-1.5">
                {errors.password.message}
              </p>
            )}
          </div>
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-200 mb-1.5"
            >
              Confirm password
            </label>

            <input
              {...register("confirmPassword")}
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              placeholder="Re-enter your password"
              className="block w-full rounded-xl bg-white/5 border border-white/10 px-3.5 py-2.5 text-sm text-white placeholder:text-gray-500 outline-none transition focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400"
            />

            {errors.confirmPassword && (
              <p className="text-xs text-rose-400 mt-1.5">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>
          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 rounded-xl font-semibold text-sm text-white bg-indigo-600 hover:bg-indigo-500 active:scale-[0.99] transition-all duration-150 cursor-pointer shadow-lg shadow-indigo-600/20 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Creating account..." : "Sign up"}
            </button>
          </div>

          {/* Divider */}
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-[#121217] px-3 text-gray-400 rounded-full border border-white/5">
                or
              </span>
            </div>
          </div>

          {/* Google Sign-up Button */}
          <button
            onClick={handleGoogleLogin}
            type="button"
            className="w-full py-2.5 px-4 rounded-xl font-medium text-sm text-gray-200 border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 active:scale-[0.99] transition-all duration-150 flex items-center justify-center gap-3 cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            Continue with Google
          </button>
        </form>

        {/* Footer */}
        <p className="mt-6 text-center text-sm text-gray-400">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
