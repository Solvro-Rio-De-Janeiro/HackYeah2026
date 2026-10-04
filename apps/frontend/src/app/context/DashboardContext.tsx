import React, { createContext, useContext, useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { Group, Incident, ThemeMode, SettingsState, Member } from '../types';
import { api, ApiGroup, getStoredUser } from '../services/api';

const emptyGroup: Group = {
  id: '',
  name: 'Brak grup',
  goal: '',
  target: 0,
  dailyAmount: 30,
  demo: false,
  deposits: [],
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

function mapApiGroup(group: ApiGroup, cachedGroups: Group[]): Group {
  const cached = cachedGroups.find((item) => item.id === group.id);
  return {
    id: group.id,
    name: group.name,
    goal: cached?.goal || '',
    target: cached?.target || 0,
    dailyAmount: cached?.dailyAmount ?? 30,
    demo: false,
    userGroupId: cached?.userGroupId,
    deposits: cached?.deposits || [],
  };
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
  groupsLoading: boolean;
  groupsError: string | null;
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
  reloadGroups: () => Promise<void>;
  createGroup: (name: string) => Promise<Group>;
  joinGroup: (groupId: string) => Promise<Group>;
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

  const [groups, setGroups] = useState<Group[]>([]);
  const [groupsLoading, setGroupsLoading] = useState(
    () => Boolean(readSaved<{ id?: string } | null>('odnowa-user', null)?.id),
  );
  const [groupsError, setGroupsError] = useState<string | null>(null);
  const groupRequestId = useRef(0);

  const [activeId, setActiveId] = useState(() => {
    const saved = readSaved('odnowa-active-group', 'odnowa');
    return saved === 'demo' ? 'odnowa' : saved;
  });

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
    return groups.find(group => group.id === activeId) || groups[0] || emptyGroup;
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

  const reloadGroups = useCallback(async () => {
    if (!currentUser?.id) {
      setGroups([]);
      setGroupsLoading(false);
      return;
    }

    setGroupsLoading(true);
    setGroupsError(null);
    const requestId = ++groupRequestId.current;
    try {
      const backendGroups = await api.getUserGroups(currentUser.id);
      if (requestId !== groupRequestId.current) return;
      const cachedGroups = readSaved<Group[]>('odnowa-groups', []);
      const next = backendGroups.map((group) => mapApiGroup(group, cachedGroups));
      setGroups(next);
      writeSaved('odnowa-groups', next);
      setActiveId((current) => {
        const nextId = next.some((group) => group.id === current)
          ? current
          : next[0]?.id || '';
        writeSaved('odnowa-active-group', nextId);
        return nextId;
      });
    } catch (error) {
      if (requestId !== groupRequestId.current) return;
      setGroupsError(
        error instanceof Error
          ? error.message
          : 'Nie udało się pobrać grup z serwera.',
      );
    } finally {
      if (requestId === groupRequestId.current) {
        setGroupsLoading(false);
      }
    }
  }, [currentUser?.id]);

  useEffect(() => {
    void reloadGroups();
  }, [reloadGroups]);

  const createGroup = async (name: string): Promise<Group> => {
    if (!currentUser?.id) {
      throw new Error('Zaloguj się, aby utworzyć grupę.');
    }

    const created = await api.createGroup(name);
    let membership;
    try {
      membership = await api.addUserToGroup(currentUser.id, created.id);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Nie udało się dołączyć do grupy.';
      throw new Error(`${message} ID utworzonej grupy: ${created.id}`);
    }

    const group: Group = {
      id: created.id,
      name: created.name,
      goal: '',
      target: 0,
      dailyAmount: 30,
      demo: false,
      userGroupId: membership.id,
      deposits: [],
    };
    groupRequestId.current += 1;
    const next = [...groups.filter((item) => item.id !== group.id), group];
    setGroups(next);
    setGroupsError(null);
    writeSaved('odnowa-groups', next);
    selectGroup(group.id);
    return group;
  };

  const joinGroup = async (groupId: string): Promise<Group> => {
    if (!currentUser?.id) {
      throw new Error('Zaloguj się, aby dołączyć do grupy.');
    }
    const remoteGroup = await api.getGroup(groupId);
    const membership = await api.addUserToGroup(currentUser.id, remoteGroup.id);
    const group = mapApiGroup(
      remoteGroup,
      readSaved<Group[]>('odnowa-groups', []),
    );
    group.userGroupId = membership.id;
    groupRequestId.current += 1;
    const next = groups.some((item) => item.id === group.id)
      ? groups.map((item) => (item.id === group.id ? group : item))
      : [...groups, group];
    setGroups(next);
    setGroupsError(null);
    writeSaved('odnowa-groups', next);
    selectGroup(group.id);
    return group;
  };

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
        groupsLoading,
        groupsError,
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
        reloadGroups,
        createGroup,
        joinGroup,
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
