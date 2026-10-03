export type Deposit = {
  id: string;
  amount: number;
  note: string;
  date: string;
  kind?: 'subscription-demo' | 'daily-demo';
};

export type Group = {
  id: string;
  name: string;
  goal: string;
  target: number;
  dailyAmount?: number;
  code: string;
  demo: boolean;
  deposits: Deposit[];
};

export type Incident = {
  id: string;
  groupId: string;
  person: string;
  date: string;
  note: string;
  photo?: string;
};

export type Member = {
  name: string;
  initials: string;
  amount: number;
  color: string;
};

export type ThemeMode = 'light' | 'dark';

export type SettingsState = {
  reminder: boolean;
  privacy: boolean;
  highContrast?: boolean;
  largeText?: boolean;
  reduceMotion?: boolean;
  [key: string]: boolean | undefined;
};

export type TabId = 'main' | 'incidents' | 'preferences' | 'profile';

export type TabItem = {
  id: TabId;
  label: string;
  icon: string;
  path: string;
};
