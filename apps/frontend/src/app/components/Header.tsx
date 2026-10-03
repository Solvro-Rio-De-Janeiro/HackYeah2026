import { LogIn } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { Logo } from "./logo";

export function Header() {
  const location = useLocation();
  const isLoginPage = location.pathname === "/login";

  return (
    <header className="relative z-20 flex justify-between items-center h-17 px-6 sm:px-10 lg:px-16 border-b border-[#e1e1e5] bg-white">
      <Logo />

      <div className="text-[#777781] text-xs tracking-tight flex items-center gap-4">
        <span className="hidden sm:inline">
          {isLoginPage ? "Nie masz konta?" : "Masz już konto?"}
        </span>
        <Link
          to={isLoginPage ? "/signup" : "/login"}
          className="px-3.5 py-1.5 border border-[#15151a] rounded bg-[#15151a] hover:bg-[#31313a] text-white font-mono text-[10px] tracking-wider uppercase inline-flex items-center transition-all duration-150 hover:-translate-y-0.5 cursor-pointer no-underline gap-2"
        >
          <span className="text-xs">
            <LogIn className="size-4" />
          </span>
          {isLoginPage ? "Zarejestruj się" : "Zaloguj się"}
        </Link>
      </div>
    </header>
  );
}

export default Header;
