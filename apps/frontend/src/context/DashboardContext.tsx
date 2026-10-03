import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { Group, Incident, ThemeMode, SettingsState, Member } from '../types';

export const initialGroup: Group = {
  id: 'demo',
  name: 'Małe kroki, wielkie plany',
  goal: 'Niepalenie',
  target: 6000,
  dailyAmount: 30,
  code: 'ODNOWA',
  demo: true,
  deposits: []
};

export const demoMembers: Member[] = [
  { name: 'Spokojna Fala', initials: 'SF', amount: 840, color: 'mint' },
  { name: 'Dzielny Lis', initials: 'DL', amount: 620, color: 'peach' },
  { name: 'Jasny Horyzont', initials: 'JH', amount: 480, color: 'lilac' }
];

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

function readSaved<T>(key: string, fallback: T): T {
  try {
    return JSON.parse(localStorage.getItem(key) || 'null') ?? fallback;
  } catch {
    return fallback;
  }
}

interface DashboardContextType {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  groups: Group[];
  activeId: string;
  activeGroup: Group;
  incidents: Incident[];
  settings: SettingsState;
  members: Member[];
  personalTotal: number;
  groupTotal: number;
  percentage: number;
  allDeposits: Array<{ id: string; amount: number; note: string; date: string; kind?: 'subscription-demo' | 'daily-demo'; group: string }>;
  updateGroups: (next: Group[]) => void;
  selectGroup: (id: string) => void;
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
    try {
      localStorage.setItem('odnowa-theme', JSON.stringify(theme));
    } catch {}
  }, [theme]);

  const setTheme = (next: ThemeMode) => {
    setThemeState(next);
  };

  const [groups, setGroups] = useState<Group[]>(() =>
    readSaved('odnowa-groups', [initialGroup]).map(group =>
      group.id === 'demo' && group.goal === 'Wspólny weekend w górach'
        ? { ...group, goal: 'Niepalenie' }
        : group
    )
  );

  const [activeId, setActiveId] = useState(() => readSaved('odnowa-active-group', 'demo'));

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
    return personalTotal + (activeGroup.demo ? 1940 : 0);
  }, [personalTotal, activeGroup]);

  const percentage = useMemo(() => {
    if (!activeGroup.target) return 0;
    return Math.min(100, Math.round((groupTotal / activeGroup.target) * 100));
  }, [groupTotal, activeGroup.target]);

  const members = useMemo<Member[]>(() => {
    return [
      { name: 'Anonimowy Orzeł', initials: 'AO', amount: personalTotal, color: 'ink' },
      ...(activeGroup.demo ? demoMembers : [])
    ];
  }, [personalTotal, activeGroup.demo]);

  const allDeposits = useMemo(() => {
    return groups.flatMap(group =>
      group.deposits.map(deposit => ({ ...deposit, group: group.name }))
    );
  }, [groups]);

  const updateGroups = (next: Group[]) => {
    setGroups(next);
    localStorage.setItem('odnowa-groups', JSON.stringify(next));
  };

  const selectGroup = (id: string) => {
    setActiveId(id);
    localStorage.setItem('odnowa-active-group', JSON.stringify(id));
  };

  const updateIncidents = (next: Incident[]) => {
    localStorage.setItem('odnowa-incidents', JSON.stringify(next));
    setIncidents(next);
  };

  const updateSettings = (key: string, value: boolean) => {
    const next = { ...settings, [key]: value };
    setSettings(next);
    localStorage.setItem('odnowa-settings', JSON.stringify(next));
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
