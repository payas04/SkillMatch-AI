// frontend/src/pages/OAuthSuccess.jsx
import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";
import useAuthStore from "../store/authStore";
import { authService } from "../services/authService";

const OAuthSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const setAccessToken = useAuthStore((state) => state.setAccessToken);

  useEffect(() => {
    const token = searchParams.get("token");

    if (token) {
      // 1. Store the token in Zustand
      setAccessToken(token);

      // 2. Fetch user profile with the token
      authService
        .getMe()
        .then((data) => {
          useAuthStore.setState({ user: data.user, isLoading: false });
          navigate("/home", { replace: true });
        })
        .catch(() => {
          navigate("/login", { replace: true });
        });
    } else {
      navigate("/login", { replace: true });
    }
  }, [searchParams, navigate, setAccessToken]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-neutral-950 text-white">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-gray-400">Completing sign-in...</p>
      </div>
    </div>
  );
};

export default OAuthSuccess;
