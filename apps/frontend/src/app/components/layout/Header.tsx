import { useEffect, useState } from "react";
import { LogOut, User } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDashboard } from "../../context/DashboardContext";
import { clearStoredAuth, getStoredUser, isAuthenticated } from "../../auth";

interface HeaderProps {
  onProfile?: () => void;
}

export function Header({ onProfile }: HeaderProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, setCurrentUser } = useDashboard();
  const [hasAuthToken, setHasAuthToken] = useState(isAuthenticated);

  const displayName = currentUser?.name?.trim();
  const firstName = displayName ? displayName.split(" ")[0] : null;
  const isProfileActive = location.pathname === "/profile";
  const loggedIn = hasAuthToken && Boolean(currentUser?.email);

  useEffect(() => {
    function syncAuthState() {
      setHasAuthToken(isAuthenticated());
      setCurrentUser(
        getStoredUser<{ name: string; email: string; id?: string }>(),
      );
    }

    window.addEventListener("storage", syncAuthState);
    return () => window.removeEventListener("storage", syncAuthState);
  }, [setCurrentUser]);

  function handleLogout() {
    clearStoredAuth();
    setHasAuthToken(false);
    setCurrentUser(null);
    navigate("/login");
  }

  return (
    <header className="relative z-20 flex justify-between items-center h-[4.25rem] px-6 sm:px-10 lg:px-16 border-b border-[#ebebeb] dark:border-[#323145] bg-white dark:bg-[#161622] transition-colors">
      <Link
        to="/"
        aria-label="Sober Home"
        className="text-[#010120] dark:text-white text-xl font-extrabold tracking-tight inline-flex items-center gap-0.5 no-underline hover:opacity-90"
      >
        Sober
        <span className="text-[#7472d5] font-mono text-sm tracking-tighter font-semibold">
          //
        </span>
      </Link>

      <div className="text-[#727279] text-xs tracking-tight flex items-center gap-2.5">
        {loggedIn ? (
          <div className="flex items-center gap-2">
            <Link
              to="/profile"
              aria-label={`Profil użytkownika: ${displayName}`}
              className={`px-3 py-1.5 border rounded font-mono text-[10px] tracking-wider uppercase inline-flex items-center gap-1.5 transition-all duration-150 hover:-translate-y-0.5 cursor-pointer no-underline ${
                isProfileActive
                  ? "border-[#7472d5] bg-[#eeedfc] text-[#4338ca] dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-600"
                  : "border-[#ebebeb] dark:border-white/10 text-[#010120] dark:text-white hover:border-[#15151a]"
              }`}
            >
              <User className="size-3.5" />
              <span>Profil ({firstName})</span>
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="px-3 py-1.5 border border-[#ebebeb] dark:border-white/10 rounded text-[#010120] dark:text-white font-mono text-[10px] tracking-wider uppercase inline-flex items-center gap-1.5 transition-all duration-150 hover:border-[#15151a] cursor-pointer"
            >
              <LogOut className="size-3.5" />
              Wyloguj
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="px-3 py-1.5 border border-[#ebebeb] dark:border-white/10 rounded hover:border-[#15151a] text-[#010120] dark:text-white font-mono text-[10px] tracking-wider uppercase inline-flex items-center transition-all duration-150 cursor-pointer no-underline"
            >
              Zaloguj się
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}

export default Header;
