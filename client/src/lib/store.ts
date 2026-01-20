import { create } from "zustand";
import { apiRequest } from "./queryClient";

const INITIAL_MEMBERS = [
  "张三",
  "李四"
];

export interface Member {
  id: string;
  name: string;
  active: boolean;
  createdAt: string;
}

export interface DinnerEvent {
  id: string;
  date: string;
  location: string;
  description: string;
  attendees: string[];
  points: number;
  createdAt: string;
  ipAddress?: string | null;
}

export interface NewEventInput {
  date: string;
  location: string;
  description: string;
  attendees: string[];
  points: number;
}

interface AppState {
  members: Member[];
  events: DinnerEvent[];
  loading: boolean;
  loaded: boolean;
  loadData: () => Promise<void>;
  addMember: (name: string) => Promise<Member | null>;
  deleteMember: (id: string) => Promise<void>;
  addEvent: (event: NewEventInput) => Promise<DinnerEvent | null>;
  deleteEvent: (id: string) => Promise<void>;
}

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { credentials: "include" });
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
  return (await res.json()) as T;
}

export const useStore = create<AppState>((set, get) => ({
  members: [],
  events: [],
  loading: false,
  loaded: false,

  loadData: async () => {
    const state = get();
    if (state.loading || state.loaded) {
      return;
    }

    set({ loading: true });
    try {
      const [members, events] = await Promise.all([
        fetchJson<Member[]>("/api/members"),
        fetchJson<DinnerEvent[]>("/api/events"),
      ]);

      if (members.length === 0 && INITIAL_MEMBERS.length > 0) {
        const seedRes = await apiRequest("POST", "/api/members/bulk", {
          names: INITIAL_MEMBERS,
        });
        const seeded = (await seedRes.json()) as Member[];
        set({ members: seeded, events, loading: false, loaded: true });
        return;
      }

      set({ members, events, loading: false, loaded: true });
    } catch (error) {
      console.error("Failed to load data.", error);
      set({ loading: false });
    }
  },

  addMember: async (name) => {
    const trimmed = name.trim();
    if (!trimmed) {
      return null;
    }

    const res = await apiRequest("POST", "/api/members", { name: trimmed });
    const member = (await res.json()) as Member;
    set((state) => ({ members: [...state.members, member] }));
    return member;
  },

  deleteMember: async (id) => {
    await apiRequest("DELETE", `/api/members/${id}`);
    set((state) => ({
      members: state.members.map((member) =>
        member.id === id ? { ...member, active: false } : member,
      ),
    }));
  },

  addEvent: async (event) => {
    const res = await apiRequest("POST", "/api/events", event);
    const saved = (await res.json()) as DinnerEvent;
    set((state) => ({ events: [saved, ...state.events] }));
    return saved;
  },

  deleteEvent: async (id) => {
    await apiRequest("DELETE", `/api/events/${id}`);
    set((state) => ({
      events: state.events.filter((event) => event.id !== id),
    }));
  },
}));
