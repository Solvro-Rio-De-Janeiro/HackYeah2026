import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Icon from '../common/Icon';
import { TabItem } from '../../types';

export const navigationTabs: TabItem[] = [
  { id: 'main', label: 'Moja grupa', icon: 'home', path: '/' },
  { id: 'incidents', label: 'Przyłapania', icon: 'shield', path: '/incidents' },
  { id: 'preferences', label: 'Preferencje', icon: 'settings', path: '/preferences' },
  { id: 'profile', label: 'Profil', icon: 'user', path: '/profile' }
];

export function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  const currentPath = location.pathname;

  return (
    <nav className="bottom-nav" aria-label="Główna nawigacja">
      <div className="nav-inner">
        {navigationTabs.map((item) => {
          const isActive =
            item.path === '/'
              ? currentPath === '/' || currentPath === '/dashboard'
              : currentPath.startsWith(item.path);

          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              aria-current={isActive ? 'page' : undefined}
              className={`flex items-center relative gap-2 border-0 bg-transparent py-0 px-1 cursor-pointer transition-colors ${
                isActive ? 'active text-[#010120]' : 'text-[#8b8b93]'
              }`}
            >
              <Icon name={item.icon} size={19} />
              <span className="eyebrow">{item.label}</span>
              {isActive && <span className="nav-dot" />}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

export default BottomNav;
