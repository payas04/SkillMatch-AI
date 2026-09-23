import { useState, useEffect } from "react";
import OtpInput from "react-otp-input";
import { useLocation, useNavigate } from "react-router";
import { authService } from "../services/authService";

const VerifyEmailPage = () => {
  const [otp, setOtp] = useState("");
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email;
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  useEffect(() => {
    if (resendCooldown === 0) {
      return;
    }
    const timer = setInterval(() => {
      setResendCooldown((previous) => previous - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleVerifyEmail = async () => {
    setError("");
    setSuccess("");

    if (!email) {
      setError("Email address is missing. Please register again.");
      return;
    }

    if (otp.length !== 6) {
      setError("Please enter the 6-digit verification code.");
      return;
    }

    try {
      setIsLoading(true);

      const data = await authService.verifyEmail({
        email,
        code: otp,
      });

      setSuccess(data.message);

      setTimeout(() => {
        navigate("/login");
      }, 1000);
    } catch (err) {
      setError(
        err.response?.data?.message || "Verification failed. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };
  const handleResendCode = async () => {
    setError("");
    setSuccess("");

    if (!email) {
      setError("Email address is missing. Please register again.");
      return;
    }

    try {
      setIsResending(true);

      const data = await authService.resendVerification({
        email,
      });
      setSuccess(data.message);
      setOtp("");
      setResendCooldown(60);
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to resend verification code.",
      );
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md bg-white/5 border border-white/10 rounded-xl sm:rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">
            Verify Email
          </h1>

          <p className="text-sm text-gray-400 mt-2">
            Enter the 6-digit verification code sent to your email.
            <span>{email}</span>
          </p>
        </div>
        {error && (
          <p className="text-center text-sm text-red-400 mb-4">{error}</p>
        )}

        {success && (
          <p className="text-center text-sm text-green-400 mb-4">{success}</p>
        )}
        <OtpInput
          value={otp}
          onChange={setOtp}
          numInputs={6}
          inputType="tel"
          shouldAutoFocus
          containerStyle={{
            display: "flex",
            justifyContent: "center",
            gap: "10px",
          }}
          renderInput={(props) => (
            <input
              {...props}
              inputMode="numeric"
              autoComplete="one-time-code"
              className="w-12! h-14! sm:w-14! sm:h-16! bg-transparent text-white text-2xl font-bold text-center border border-indigo-400 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          )}
        />

        <button
          type="button"
          disabled={otp.length !== 6}
          onClick={handleVerifyEmail}
          className="w-full mt-8 py-3 rounded-xl font-semibold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          {isLoading ? "Verifying..." : "Verify Email"}
        </button>

        <button
          type="button"
          onClick={handleResendCode}
          disabled={isResending || resendCooldown > 0}
          className="w-full mt-3 py-3 rounded-xl font-medium text-gray-300 border border-white/10 bg-white/5 hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          {isResending
            ? "Sending..."
            : resendCooldown > 0
              ? `Resend Code in ${resendCooldown}s`
              : "Resend Code"}
        </button>
      </div>
    </div>
  );
};

export default VerifyEmailPage;
