import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import AuthPage from "./pages/AuthPage";
import Dashboard from "./pages/Dashboard";
import Analytics from "./pages/Analytics";
import ResumeEnhancer from "./pages/ResumeEnhancer";
import AppShell from "./components/AppShell";
import { getToken } from "./lib/api";

function Protected({ children }: { children: React.ReactNode }) {
  const token = getToken();
  if (!token) return <Navigate to="/auth" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to={getToken() ? "/app" : "/auth"} replace />} />
      <Route path="/auth" element={<AuthPage />} />

      <Route
        path="/app"
        element={
          <Protected>
            <AppShell><Dashboard /></AppShell>
          </Protected>
        }
      />
      <Route
        path="/analytics"
        element={
          <Protected>
            <AppShell><Analytics /></AppShell>
          </Protected>
        }
      />
      <Route
        path="/resume"
        element={
          <Protected>
            <AppShell><ResumeEnhancer /></AppShell>
          </Protected>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
