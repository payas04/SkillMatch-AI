import React from "react";
import useAuthStore from "../store/authStore";
import { Navigate, Outlet } from "react-router";

const PublicRoute = () => {
  const { user, isLoading } = useAuthStore();
  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-slate-900 text-white">
        <div className="text-xl font-semibold animate-pulse">Loading...</div>
      </div>
    );
  }
  if (user) {
    return <Navigate to="/home" replace></Navigate>;
  }

  return <Outlet />;
};

export default PublicRoute;
