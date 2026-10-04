import { useEffect, useState } from "react";
import { LogIn, LogOut } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { clearStoredAuth, isAuthenticated } from "../auth";
import { Logo } from "./logo";

export function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const isLoginPage = location.pathname === "/login";
  const [loggedIn, setLoggedIn] = useState(isAuthenticated);

  useEffect(() => {
    const syncAuthState = () => setLoggedIn(isAuthenticated());
    window.addEventListener("storage", syncAuthState);
    return () => window.removeEventListener("storage", syncAuthState);
  }, []);

  function handleLogout() {
    clearStoredAuth();
    setLoggedIn(false);
    navigate("/login");
  }

  return (
    <header className="relative z-20 flex justify-between items-center h-17 px-6 sm:px-10 lg:px-16 border-b border-[#e1e1e5] bg-white">
      <Logo />

      <div className="text-[#777781] text-xs tracking-tight flex items-center gap-4">
        {loggedIn ? (
          <button
            type="button"
            onClick={handleLogout}
            className="px-3.5 py-1.5 border !border-[#15151a] rounded !bg-[#15151a] !text-white hover:!bg-[#31313a] font-mono text-[10px] tracking-wider uppercase inline-flex items-center transition-all duration-150 hover:-translate-y-0.5 cursor-pointer gap-2"
          >
            <LogOut className="size-4" />
            Wyloguj się
          </button>
        ) : (
          <>
            <span className="hidden sm:inline">
              {isLoginPage ? "Nie masz konta?" : "Masz już konto?"}
            </span>
            <Link
              to={isLoginPage ? "/signup" : "/login"}
              className="px-3.5 py-1.5 border rounded   font-mono text-[10px] tracking-wider uppercase inline-flex items-center transition-all duration-150 hover:-translate-y-0.5 cursor-pointer no-underline gap-2"
            >
              <LogIn className="size-4" />
              {isLoginPage ? "Zarejestruj się" : "Zaloguj się"}
            </Link>
          </>
        )}
      </div>
    </header>
  );
}

export default Header;
