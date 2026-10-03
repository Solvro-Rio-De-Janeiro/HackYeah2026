import { Link, useLocation } from 'react-router-dom';

export function Header() {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';

  return (
    <header className="relative z-20 flex justify-between items-center h-[4.25rem] px-6 sm:px-10 lg:px-16 border-b border-[#e1e1e5] bg-white">
      <Link
        to="/signup"
        aria-label="Sober Home"
        className="text-[#05051d] text-lg font-bold tracking-tight inline-flex items-center gap-0.5 no-underline"
      >
        Sober<span className="text-[#7472d5] font-mono text-xs tracking-tighter">//</span>
      </Link>

      <div className="text-[#777781] text-xs tracking-tight flex items-center gap-2">
        <span className="hidden sm:inline">
          {isLoginPage ? "Don't have an account?" : 'Already a member?'}
        </span>
        <Link
          to={isLoginPage ? '/signup' : '/login'}
          className="px-3.5 py-1.5 border border-[#15151a] rounded bg-[#15151a] hover:bg-[#31313a] text-white font-mono text-[10px] tracking-wider uppercase inline-flex items-center gap-1 transition-all duration-150 hover:-translate-y-0.5 cursor-pointer no-underline"
        >
          {isLoginPage ? 'Sign up' : 'Log in'} <span className="text-xs">↗</span>
        </Link>
      </div>
    </header>
  );
}

export default Header;
