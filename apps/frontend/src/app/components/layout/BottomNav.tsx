import React from 'react';
import { useLocation, Link } from 'react-router-dom';
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
            <Link
              key={item.id}
              to={item.path}
              aria-current={isActive ? 'page' : undefined}
              className={`flex items-center relative gap-2 border-0 bg-transparent py-0 px-1 cursor-pointer transition-colors no-underline ${
                isActive ? 'active text-[#010120] dark:text-white' : 'text-[#8b8b93]'
              }`}
            >
              <Icon name={item.icon} size={19} />
              <span className="eyebrow">{item.label}</span>
              {isActive && <span className="nav-dot" />}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export default BottomNav;
