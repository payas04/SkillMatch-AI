import { createBrowserRouter, Navigate } from "react-router";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import Home from "../pages/Home";
import PublicRoute from "../components/PublicRoute";
import ProtectedRoute from "../components/ProtectedRoute";
import Interview from "../pages/Interview";
import OAuthSucces from "../pages/OAuthSuccess";
import VerifyEmailPage from "../pages/VerifyEmailPage";
import ForgotPasswordPage from "../pages/ForgotPasswordPage";
import ResetPasswordPage from "../pages/ResetPasswordPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/login" replace />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      { path: "/home", element: <Home /> },
      { path: "/interview/:interviewId", element: <Interview /> },
    ],
  },
  {
    element: <PublicRoute />,
    children: [
      { path: "/login", element: <LoginPage /> },
      { path: "/register", element: <RegisterPage /> },
      { path: "/verify-email", element: <VerifyEmailPage /> },
      { path: "/forgot-password", element: <ForgotPasswordPage /> },
      { path: "/reset-password", element: <ResetPasswordPage /> },
      { path: "/oauth-success", element: <OAuthSucces /> },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/home" replace />,
  },
]);

export default router;
