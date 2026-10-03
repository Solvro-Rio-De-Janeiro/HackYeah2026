import { Routes, Route, Navigate } from "react-router-dom";
import { AuthLayout } from "./components/auth-layout";
import { SignUpPage } from "./pages/sign-up-page";
import { LoginPage } from "./pages/login-page";

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
