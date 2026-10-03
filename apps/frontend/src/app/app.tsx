import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthLayout } from './components/AuthLayout';
import { SignUpPage } from './pages/SignUpPage';
import { LoginPage } from './pages/LoginPage';

export function App() {
  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route path="/" element={<Navigate to="/signup" replace />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<Navigate to="/signup" replace />} />
      </Route>
    </Routes>
  );
}

export default App;
