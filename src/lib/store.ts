"use client";

import { useSyncExternalStore } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { blankInterview, featuredPersonId, seedCompany, seedPeople } from "./seed";
import type { CompanyContext, Interview, TaskProgress, TaskStatus } from "./types";

interface State {
  company: CompanyContext;
  people: Interview[];
  activePersonId: string;
  progress: Record<string, Record<string, TaskProgress>>;

  setCompany: (patch: Partial<CompanyContext>) => void;
  setActivePerson: (id: string) => void;
  invitePerson: (p: { name: string; role: string; team: string }) => string;
  savePerson: (iv: Interview) => void;
  removePerson: (id: string) => void;
  setProgress: (personId: string, taskId: string, status: TaskStatus, note?: string) => void;
  resetDemo: () => void;
}

const uid = () => Math.random().toString(36).slice(2, 10);
const now = () => new Date().toISOString();

const initial = () => ({
  company: seedCompany,
  people: seedPeople,
  activePersonId: featuredPersonId,
  progress: {} as Record<string, Record<string, TaskProgress>>,
});

export const useStore = create<State>()(
  persist(
    (set) => ({
      ...initial(),

      setCompany: (patch) => set((s) => ({ company: { ...s.company, ...patch } })),
      setActivePerson: (activePersonId) => set({ activePersonId }),
      invitePerson: ({ name, role, team }) => {
        const id = `iv-${uid()}`;
        set((s) => ({
          people: [...s.people, blankInterview(id, name, role, team, now())],
          activePersonId: id,
        }));
        return id;
      },
      savePerson: (iv) =>
        set((s) => ({
          people: s.people.map((x) => (x.id === iv.id ? iv : x)),
          activePersonId: iv.id,
        })),
      removePerson: (id) =>
        set((s) => ({
          people: s.people.filter((x) => x.id !== id),
          activePersonId: s.activePersonId === id ? (s.people.find((p) => p.id !== id)?.id ?? "") : s.activePersonId,
        })),
      setProgress: (personId, taskId, status, note) =>
        set((s) => ({
          progress: {
            ...s.progress,
            [personId]: {
              ...(s.progress[personId] ?? {}),
              [taskId]: {
                status,
                practicedAt: status === "practiced" || status === "using" ? now() : (s.progress[personId]?.[taskId]?.practicedAt ?? null),
                note: note ?? s.progress[personId]?.[taskId]?.note ?? "",
              },
            },
          },
        })),
      resetDemo: () => set(initial()),
    }),
    { name: "employee-first", version: 1, skipHydration: true },
  ),
);

export function useHydrated() {
  return useSyncExternalStore(
    (onChange) => useStore.persist.onFinishHydration(onChange),
    () => useStore.persist.hasHydrated(),
    () => false,
  );
}

export function useActivePerson() {
  const people = useStore((s) => s.people);
  const id = useStore((s) => s.activePersonId);
  return people.find((p) => p.id === id) ?? people[0] ?? null;
}
