import React, { useEffect, useState } from "react";
import {
  Routes,
  Route,
  Navigate,
  useLocation,
  Outlet,
} from "react-router-dom";
import { AuthLayout } from "./components/auth-layout";
import { SignUpPage } from "./pages/sign-up-page";
import { LoginPage } from "./pages/login-page";

import { DashboardProvider } from "./context/DashboardContext";
import Header from "./components/layout/Header";
import BottomNav from "./components/layout/BottomNav";
import DashboardPage from "./pages/DashboardPage";
import PreferencesPage from "./pages/PreferencesPage";
import ProfilePage from "./pages/ProfilePage";
import {
  clearStoredAuth,
  fetchMe,
  getStoredToken,
  setStoredUser,
  UnauthorizedError,
} from "./services/api";

function RequireAuth() {
  const [status, setStatus] = useState<
    "checking" | "authenticated" | "unauthenticated" | "error"
  >("checking");

  useEffect(() => {
    let active = true;

    async function validateSession() {
      if (!getStoredToken()) {
        setStatus("unauthenticated");
        return;
      }

      try {
        const user = await fetchMe();
        if (!active) return;
        setStoredUser(user);
        setStatus("authenticated");
      } catch (error) {
        if (!active) return;
        if (error instanceof UnauthorizedError) {
          clearStoredAuth();
          setStatus("unauthenticated");
          return;
        }
        setStatus("error");
      }
    }

    void validateSession();
    return () => {
      active = false;
    };
  }, []);

  if (status === "unauthenticated") {
    return <Navigate to="/login" replace />;
  }
  if (status === "error") {
    return (
      <p role="alert" className="p-6 text-center text-red-600">
        Nie udało się sprawdzić sesji. Sprawdź połączenie i odśwież stronę.
      </p>
    );
  }
  if (status !== "authenticated") {
    return <p className="p-6 text-center">Sprawdzanie sesji...</p>;
  }

  return <Outlet />;
}

function DashboardLayout() {
  const location = useLocation();

  return (
    <DashboardProvider>
      <div className="app-shell overflow-x-clip">
        <a href="#main-content" className="skip-link">
          Przejdź do treści głównej
        </a>
        <Header />
        <main
          id="main-content"
          tabIndex={-1}
          key={location.pathname}
          className="screen-transition px-4 sm:px-8 lg:px-12 outline-none"
        >
          <Outlet />
        </main>
        <BottomNav />
      </div>
    </DashboardProvider>
  );
}

export function App() {
  const location = useLocation();

  useEffect(() => {
    const titles: Record<string, string> = {
      "/": "Sober // Moja grupa",
      "/dashboard": "Sober // Moja grupa",
      "/preferences": "Sober // Preferencje",
      "/profile": "Sober // Profil",
      "/signup": "Sober // Rejestracja",
      "/login": "Sober // Logowanie",
    };
    document.title = titles[location.pathname] || "Sober // Dashboard";
  }, [location.pathname]);

  return (
    <Routes>
      {/* Auth routes */}
      <Route element={<AuthLayout />}>
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/login" element={<LoginPage />} />
      </Route>

      {/* Dashboard routes */}
      <Route element={<RequireAuth />}>
        <Route element={<DashboardLayout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/preferences" element={<PreferencesPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
