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

function SessionGuard({
  mode,
}: {
  mode: "authenticated" | "guest";
}) {
  const location = useLocation();
  const token = getStoredToken();
  const [session, setSession] = useState<{
    token: string | null;
    status: "checking" | "authenticated" | "unauthenticated" | "error";
  }>(() => ({
    token,
    status: token ? "checking" : "unauthenticated",
  }));

  useEffect(() => {
    let active = true;

    async function validateSession() {
      if (!token) {
        setSession({ token: null, status: "unauthenticated" });
        return;
      }

      setSession({ token, status: "checking" });
      try {
        const user = await fetchMe();
        if (!active) return;
        setStoredUser(user);
        setSession({ token, status: "authenticated" });
      } catch (error) {
        if (!active) return;
        if (error instanceof UnauthorizedError) {
          clearStoredAuth();
          setSession({ token, status: "unauthenticated" });
          return;
        }
        setSession({ token, status: "error" });
      }
    }

    void validateSession();
    return () => {
      active = false;
    };
  }, [location.pathname, token]);

  const status =
    session.token === token ? session.status : "checking";

  if (status === "error") {
    return (
      <main className="min-h-screen grid place-items-center p-6">
        <p role="alert" className="text-center text-red-600">
          Nie udało się sprawdzić sesji. Sprawdź połączenie i odśwież stronę.
        </p>
      </main>
    );
  }
  if (status !== "authenticated") {
    if (status === "checking") {
      return <p className="p-6 text-center">Sprawdzanie sesji...</p>;
    }
    return mode === "authenticated" ? (
      <Navigate to="/login" replace />
    ) : (
      <Outlet />
    );
  }

  return mode === "authenticated" ? (
    <Outlet />
  ) : (
    <Navigate to="/dashboard" replace />
  );
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
      <Route element={<SessionGuard mode="guest" />}>
        <Route element={<AuthLayout />}>
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/login" element={<LoginPage />} />
        </Route>
      </Route>

      {/* Dashboard routes */}
      <Route element={<SessionGuard mode="authenticated" />}>
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
