import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useDashboard } from '../../context/DashboardContext';

interface HeaderProps {
  onProfile?: () => void;
}

export function Header({ onProfile }: HeaderProps) {
  const location = useLocation();
  const { currentUser } = useDashboard();

  const displayName = currentUser?.name?.trim();
  const firstName = displayName ? displayName.split(' ')[0] : null;
  const isProfileActive = location.pathname === '/profile';

  return (
    <header className="relative z-20 flex justify-between items-center h-[4.25rem] px-6 sm:px-10 lg:px-16 border-b border-[#ebebeb] dark:border-[#323145] bg-white dark:bg-[#161622] transition-colors">
      <Link
        to="/"
        aria-label="Sober Home"
        className="text-[#010120] dark:text-white text-xl font-extrabold tracking-tight inline-flex items-center gap-0.5 no-underline hover:opacity-90"
      >
        Sober<span className="text-[#7472d5] font-mono text-sm tracking-tighter font-semibold">//</span>
      </Link>

      <div className="text-[#727279] text-xs tracking-tight flex items-center gap-2.5">
        {currentUser ? (
          <Link
            to="/profile"
            aria-label={`Profil użytkownika: ${displayName}`}
            className={`px-3.5 py-1.5 border rounded font-mono text-[10px] tracking-wider uppercase inline-flex items-center gap-1.5 transition-all duration-150 hover:-translate-y-0.5 cursor-pointer no-underline ${
              isProfileActive
                ? 'border-[#7472d5] bg-[#eeedfc] text-[#4338ca] dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-600'
                : 'border-[#15151a] bg-[#15151a] hover:bg-[#31313a] text-white dark:bg-white dark:text-[#010120] dark:hover:bg-slate-200'
            }`}
          >
            <span className="w-4 h-4 rounded-full bg-white/20 dark:bg-black/20 text-[9px] grid place-items-center font-bold">
              {firstName?.[0] || 'U'}
            </span>
            <span>Profil ({firstName})</span>
            <span className="text-xs">↗</span>
          </Link>
        ) : (
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="px-3 py-1.5 border border-[#ebebeb] dark:border-white/10 rounded hover:border-[#15151a] text-[#010120] dark:text-white font-mono text-[10px] tracking-wider uppercase inline-flex items-center transition-all duration-150 cursor-pointer no-underline"
            >
              Zaloguj się
            </Link>
            <Link
              to="/profile"
              aria-label="Profil"
              className={`px-3.5 py-1.5 border rounded font-mono text-[10px] tracking-wider uppercase inline-flex items-center gap-1 transition-all duration-150 hover:-translate-y-0.5 cursor-pointer no-underline ${
                isProfileActive
                  ? 'border-[#7472d5] bg-[#eeedfc] text-[#4338ca] dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-600'
                  : 'border-[#15151a] bg-[#15151a] hover:bg-[#31313a] text-white dark:bg-white dark:text-[#010120] dark:hover:bg-slate-200'
              }`}
            >
              <span>Profil</span>
              <span className="text-xs">↗</span>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}

export default Header;
