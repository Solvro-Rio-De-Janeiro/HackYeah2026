import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { DashboardProvider } from '../context/DashboardContext';
import Header from '../components/layout/Header';
import BottomNav from '../components/layout/BottomNav';
import DashboardPage from '../pages/DashboardPage';
import IncidentsPage from '../pages/IncidentsPage';
import PreferencesPage from '../pages/PreferencesPage';
import ProfilePage from '../pages/ProfilePage';

export function App() {
  const location = useLocation();

  React.useEffect(() => {
    const titles: Record<string, string> = {
      '/': 'Sober // Moja grupa',
      '/incidents': 'Sober // Przyłapania',
      '/preferences': 'Sober // Preferencje',
      '/profile': 'Sober // Profil'
    };
    document.title = titles[location.pathname] || 'Sober // Dashboard';
  }, [location.pathname]);

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
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/incidents" element={<IncidentsPage />} />
            <Route path="/preferences" element={<PreferencesPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <BottomNav />
      </div>
    </DashboardProvider>
  );
}

export default App;
