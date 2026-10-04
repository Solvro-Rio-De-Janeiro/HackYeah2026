import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { Group, Incident, ThemeMode, SettingsState, Member } from '../types';
import { api } from '../services/api';

export const initialGroup: Group = {
  id: 'odnowa',
  name: 'Moja grupa',
  goal: '',
  target: 0,
  dailyAmount: 30,
  code: 'ODNOWA',
  demo: false,
  deposits: []
};

export function money(value: number): string {
  return new Intl.NumberFormat('pl-PL', {
    style: 'currency',
    currency: 'PLN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(value);
}

export function dailyAmount(group: Group): number {
  return group.dailyAmount ?? 30;
}

export function isRealGoal(goal?: string, target?: number): boolean {
  if (!goal || !goal.trim()) return false;
  if (!target || target <= 0) return false;
  const normalized = goal.trim().toLowerCase();
  const mockNames = [
    'wspólny cel',
    'wspolny cel',
    'niepalenie',
    'wspólny weekend w górach',
    'brak celów',
    'brak celu'
  ];
  return !mockNames.includes(normalized);
}

function sanitizeGroups(loaded: Group[]): Group[] {
  if (!Array.isArray(loaded) || loaded.length === 0) {
    return [initialGroup];
  }
  return loaded.map((group) => {
    const isMock = !isRealGoal(group.goal, group.target);
    return {
      ...group,
      goal: isMock ? '' : group.goal,
      target: isMock ? 0 : (group.target || 0),
      demo: false,
      deposits: Array.isArray(group.deposits) ? group.deposits : []
    };
  });
}

function readSaved<T>(key: string, fallback: T): T {
  try {
    if (typeof localStorage === 'undefined') return fallback;
    return JSON.parse(localStorage.getItem(key) || 'null') ?? fallback;
  } catch {
    return fallback;
  }
}

function writeSaved(key: string, value: unknown): void {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(key, JSON.stringify(value));
    }
  } catch {}
}

interface DashboardContextType {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  currentUser: { name: string; email: string; id?: string } | null;
  setCurrentUser: (user: { name: string; email: string; id?: string } | null) => void;
  groups: Group[];
  activeId: string;
  activeGroup: Group;
  incidents: Incident[];
  settings: SettingsState;
  members: Member[];
  personalTotal: number;
  groupTotal: number;
  percentage: number;
  allDeposits: Array<{ id: string; amount: number; note: string; date: string; kind?: 'subscription-demo' | 'daily-demo' | 'subscription' | 'daily'; group: string }>;
  updateGroups: (next: Group[]) => void;
  selectGroup: (id: string) => void;
  setGoal: (goal: string, target: number, dailyAmount?: number) => void;
  updateIncidents: (next: Incident[]) => void;
  updateSettings: (key: string, value: boolean) => void;
  clearHistory: () => void;
  exportReport: () => void;
}

const DashboardContext = createContext<DashboardContextType | null>(null);

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>(() =>
    readSaved<ThemeMode>('odnowa-theme', 'light') === 'dark' ? 'dark' : 'light'
  );

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    try {
      localStorage.setItem('odnowa-theme', JSON.stringify(theme));
    } catch {}
  }, [theme]);

  const setTheme = (next: ThemeMode) => {
    setThemeState(next);
  };

  const [groups, setGroups] = useState<Group[]>(() => {
    const saved = readSaved<Group[]>('odnowa-groups', [initialGroup]);
    const cleaned = sanitizeGroups(saved);
    writeSaved('odnowa-groups', cleaned);
    return cleaned;
  });

  const [activeId, setActiveId] = useState(() => {
    const saved = readSaved('odnowa-active-group', 'odnowa');
    return saved === 'demo' ? 'odnowa' : saved;
  });

  useEffect(() => {
    async function syncBackendGroups() {
      try {
        if (typeof localStorage === 'undefined') return;
        const token = localStorage.getItem('odnowa-auth-token');
        const userRaw = localStorage.getItem('odnowa-user');
        if (!token || !userRaw) return;
        const user = JSON.parse(userRaw);
        if (!user?.id) return;

        const backendGroups = await api.getUserGroups(user.id);
        if (Array.isArray(backendGroups) && backendGroups.length > 0) {
          setGroups((prev) => {
            const prevMap = new Map(prev.map((g) => [g.id, g]));
            const next = backendGroups.map((bg) => {
              const existing = prevMap.get(bg.id);
              if (existing) {
                return { ...existing, name: bg.name };
              }
              return {
                id: bg.id,
                name: bg.name,
                goal: '',
                target: 0,
                dailyAmount: 30,
                code: bg.id.slice(0, 8).toUpperCase(),
                demo: false,
                deposits: []
              };
            });
            writeSaved('odnowa-groups', next);
            return next;
          });
        }
      } catch {}
    }
    syncBackendGroups();
  }, []);

  const [settings, setSettings] = useState<SettingsState>(() =>
    readSaved('odnowa-settings', {
      reminder: true,
      privacy: true,
      highContrast: false,
      largeText: false,
      reduceMotion: false
    })
  );

  useEffect(() => {
    document.documentElement.dataset.contrast = settings.highContrast ? 'high' : 'normal';
    document.documentElement.dataset.fontSize = settings.largeText ? 'large' : 'normal';
    document.documentElement.dataset.reduceMotion = settings.reduceMotion ? 'true' : 'false';
  }, [settings.highContrast, settings.largeText, settings.reduceMotion]);

  const [incidents, setIncidents] = useState<Incident[]>(() =>
    readSaved('odnowa-incidents', [])
  );

  const activeGroup = useMemo(() => {
    return groups.find(group => group.id === activeId) || groups[0] || initialGroup;
  }, [groups, activeId]);

  const personalTotal = useMemo(() => {
    return activeGroup.deposits.reduce((total, deposit) => total + deposit.amount, 0);
  }, [activeGroup]);

  const groupTotal = useMemo(() => {
    return personalTotal;
  }, [personalTotal]);

  const percentage = useMemo(() => {
    if (!activeGroup.target || activeGroup.target <= 0) return 0;
    return Math.min(100, Math.round((groupTotal / activeGroup.target) * 100));
  }, [groupTotal, activeGroup.target]);

  const [currentUser, setCurrentUser] = useState<{ name: string; email: string; id?: string } | null>(() =>
    readSaved<{ name: string; email: string; id?: string } | null>('odnowa-user', null)
  );

  useEffect(() => {
    async function loadUser() {
      try {
        if (typeof localStorage === 'undefined') return;
        const token = localStorage.getItem('odnowa-auth-token');
        if (!token) return;
        const me = await api.getMe();
        if (me) {
          setCurrentUser(me);
          writeSaved('odnowa-user', me);
        }
      } catch {}
    }
    loadUser();
  }, []);

  const members = useMemo<Member[]>(() => {
    const name = currentUser?.name?.trim() || (currentUser?.email ? currentUser.email.split('@')[0] : 'Twój profil');
    const initials = name
      .split(' ')
      .filter(Boolean)
      .map((part) => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() || 'TP';
    return [
      { name, initials, amount: personalTotal, color: 'ink' }
    ];
  }, [personalTotal, currentUser]);

  const allDeposits = useMemo(() => {
    return groups.flatMap(group =>
      group.deposits.map(deposit => ({ ...deposit, group: group.name }))
    );
  }, [groups]);

  const updateGroups = (next: Group[]) => {
    setGroups(next);
    writeSaved('odnowa-groups', next);
  };

  const selectGroup = (id: string) => {
    setActiveId(id);
    writeSaved('odnowa-active-group', id);
  };

  const setGoal = (goal: string, target: number, dailyAmount?: number) => {
    const next = groups.map(g => {
      if (g.id === activeId) {
        return {
          ...g,
          goal: goal.trim(),
          target: target,
          dailyAmount: dailyAmount ?? g.dailyAmount ?? 30,
        };
      }
      return g;
    });
    updateGroups(next);
  };

  const updateIncidents = (next: Incident[]) => {
    writeSaved('odnowa-incidents', next);
    setIncidents(next);
  };

  const updateSettings = (key: string, value: boolean) => {
    const next = { ...settings, [key]: value };
    setSettings(next);
    writeSaved('odnowa-settings', next);
  };

  const clearHistory = () => {
    updateGroups(groups.map(group => ({ ...group, deposits: [] })));
  };

  const exportReport = () => {
    const rows = allDeposits.map(deposit => [
      deposit.date,
      deposit.group,
      deposit.amount.toFixed(2),
      deposit.note
    ]);
    const csv =
      '\uFEFFData,Grupa,Kwota PLN,Notatka\n' +
      rows
        .map(row => row.map(value => '"' + (value || '').replace(/"/g, '""') + '"').join(','))
        .join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'sober-historia.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <DashboardContext.Provider
      value={{
        theme,
        setTheme,
        currentUser,
        setCurrentUser,
        groups,
        activeId,
        activeGroup,
        incidents,
        settings,
        members,
        personalTotal,
        groupTotal,
        percentage,
        allDeposits,
        updateGroups,
        selectGroup,
        setGoal,
        updateIncidents,
        updateSettings,
        clearHistory,
        exportReport
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
}
