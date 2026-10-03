import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

interface HeaderProps {
  onProfile?: () => void;
}

export function Header({ onProfile }: HeaderProps) {
  const navigate = useNavigate();

  const handleProfileClick = () => {
    if (onProfile) {
      onProfile();
    } else {
      navigate('/profile');
    }
  };

  return (
    <header className="relative z-20 flex justify-between items-center h-[4.25rem] px-6 sm:px-10 lg:px-16 border-b border-[#ebebeb] bg-white transition-colors">
      <Link
        to="/"
        aria-label="Sober Home"
        className="text-[#010120] text-xl font-extrabold tracking-tight inline-flex items-center gap-0.5 no-underline hover:opacity-90"
      >
        Sober<span className="text-[#7472d5] font-mono text-sm tracking-tighter font-semibold">//</span>
      </Link>

      <div className="text-[#727279] text-xs tracking-tight flex items-center gap-2">
        <button
          type="button"
          onClick={handleProfileClick}
          className="px-3.5 py-1.5 border border-[#15151a] rounded bg-[#15151a] hover:bg-[#31313a] text-white font-mono text-[10px] tracking-wider uppercase inline-flex items-center gap-1 transition-all duration-150 hover:-translate-y-0.5 cursor-pointer no-underline"
        >
          Profil <span className="text-xs">↗</span>
        </button>
      </div>
    </header>
  );
}

export default Header;
