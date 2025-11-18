import { LeaderboardEntry } from '@/types';

const KEY = 'vinuhub_leaderboard';

export const loadLeaderboard = (): LeaderboardEntry[] => {
  try {
    const data = localStorage.getItem(KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

export const saveLeaderboard = (entries: LeaderboardEntry[]) => {
  try {
    localStorage.setItem(KEY, JSON.stringify(entries.slice(-10))); // keep last 10
  } catch (e) {
    console.warn('Failed to save leaderboard', e);
  }
};
