import { createBrowserRouter, Navigate } from "react-router";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import Home from "../pages/Home";
import PublicRoute from "../components/PublicRoute";
import ProtectedRoute from "../components/ProtectedRoute";
import Interview from "../pages/Interview";
import OAuthSuccess from "../pages/OauthSuccess";
const router = createBrowserRouter([
  // Redirect root "/" to "/home"
  {
    path: "/",
    element: <Navigate to="/login" replace />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: "/home",
        element: <Home />,
      },
      {
        path: "/interview/:interviewId",
        element: <Interview />,
      },
    ],
  },
  {
    element: <PublicRoute />,
    children: [
      {
        path: "/login",
        element: <LoginPage />,
      },
      {
        path: "/register",
        element: <RegisterPage />,
      },
      {
        path: "/oauth-success",
        element: <OAuthSuccess />,
      },
    ],
  },
  // 404 Catch-all
  {
    path: "*",
    element: <Navigate to="/home" replace />,
  },
]);

export default router;
