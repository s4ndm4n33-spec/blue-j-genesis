import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface LeaderboardEntry {
  id: string;
  name: string;
  avatar: string;
  level: number;
  xp: number;
  streak: number;
  achievements: number;
  updatedAt: number;
}

export interface LeaderboardState {
  entries: LeaderboardEntry[];
  myEntryId: string | null;
  lastSyncedAt: number;
  addOrUpdateEntry: (entry: Omit<LeaderboardEntry, 'updatedAt'>) => void;
  setMyEntryId: (id: string) => void;
  syncFromServer: (entries: LeaderboardEntry[]) => void;
}

export const useLeaderboardStore = create<LeaderboardState>()(
  persist(
    (set) => ({
      entries: [],
      myEntryId: null,
      lastSyncedAt: 0,
      addOrUpdateEntry: (entry) =>
        set((state) => {
          const idx = state.entries.findIndex((e) => e.id === entry.id);
          const updated = { ...entry, updatedAt: Date.now() };
          const entries = idx >= 0
            ? state.entries.map((e, i) => (i === idx ? updated : e))
            : [...state.entries, updated];
          return { entries: entries.sort((a, b) => b.xp - a.xp) };
        }),
      setMyEntryId: (id) => set({ myEntryId: id }),
      syncFromServer: (entries) =>
        set({
          entries: entries.sort((a, b) => b.xp - a.xp),
          lastSyncedAt: Date.now(),
        }),
    }),
    { name: 'bluej-leaderboard' }
  )
);

export function getLeaderboardRank(entries: LeaderboardEntry[], id: string): number {
  const idx = entries.findIndex((e) => e.id === id);
  return idx >= 0 ? idx + 1 : entries.length + 1;
}
