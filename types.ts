export interface Goal {
  id: string;
  title: string;
  category: 'health' | 'learning' | 'work' | 'mindfulness' | 'other';
  schedule: string; // e.g., "Daily", "Mon, Wed, Fri"
  time: string; // HH:MM format (24h)
  streak: number;
  createdAt: string;
}

export interface TaskLog {
  id: string;
  goalId: string;
  date: string; // YYYY-MM-DD
  completed: boolean;
  timestamp?: string;
  note?: string; // Added for daily reflections
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export enum View {
  DASHBOARD = 'DASHBOARD',
  GOALS = 'GOALS',
  ANALYTICS = 'ANALYTICS',
  COACH = 'COACH',
  SETTINGS = 'SETTINGS',
}

export interface AIPlanResponse {
  planName: string;
  tasks: {
    title: string;
    frequency: string;
    suggestedTime: string;
    reasoning: string;
  }[];
}

export interface SoundSettings {
  enabled: boolean;
  type: 'preset' | 'custom';
  url: string;
  name: string;
}

export type ThemeColor = 'indigo' | 'emerald' | 'rose' | 'amber' | 'sky' | 'violet';

export interface AppSettings {
  sound: SoundSettings;
  quote: string;
  themeColor: ThemeColor;
}