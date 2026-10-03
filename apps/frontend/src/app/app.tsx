import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation, Outlet } from 'react-router-dom';
import { AuthLayout } from './components/auth-layout';
import { SignUpPage } from './pages/sign-up-page';
import { LoginPage } from './pages/login-page';

import { DashboardProvider } from '../context/DashboardContext';
import Header from '../components/layout/Header';
import BottomNav from '../components/layout/BottomNav';
import DashboardPage from '../pages/DashboardPage';
import IncidentsPage from '../pages/IncidentsPage';
import PreferencesPage from '../pages/PreferencesPage';
import ProfilePage from '../pages/ProfilePage';

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
      '/': 'Sober // Moja grupa',
      '/dashboard': 'Sober // Moja grupa',
      '/incidents': 'Sober // Przyłapania',
      '/preferences': 'Sober // Preferencje',
      '/profile': 'Sober // Profil',
      '/signup': 'Sober // Rejestracja',
      '/login': 'Sober // Logowanie'
    };
    document.title = titles[location.pathname] || 'Sober // Dashboard';
  }, [location.pathname]);

  return (
    <Routes>
      {/* Auth routes */}
      <Route element={<AuthLayout />}>
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/login" element={<LoginPage />} />
      </Route>

      {/* Dashboard routes */}
      <Route element={<DashboardLayout />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/incidents" element={<IncidentsPage />} />
        <Route path="/preferences" element={<PreferencesPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
