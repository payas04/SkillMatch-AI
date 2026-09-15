import React from "react";
import { Navigate, Outlet } from "react-router";
import useAuthStore from "../store/authStore";

const ProtectedRoute = () => {
  const user = useAuthStore((state) => state.user);
  const isLoading = useAuthStore((state) => state.isLoading);

  // 1. While verifying session on page refresh, show a loader
  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-slate-900 text-white">
        <div className="text-xl font-semibold animate-pulse">
          Loading SkillMatch AI...
        </div>
      </div>
    );
  }
  // 2. If not logged in, redirect to /login
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  // 3. If logged in, render child route (e.g. Home)
  return <Outlet />;
};

export default ProtectedRoute;
