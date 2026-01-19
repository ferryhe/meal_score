import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { nanoid } from 'nanoid';

// Initial Member List
const INITIAL_MEMBERS = [
  "柴文进", "陈海强", "陈凯", "丁丁", "费菁枚", "弓健", "顾晓春", "郭翔", 
  "何剑钢", "贺鹏", "胡晨", "黄舒聪", "江军", "雷娟", "李娜", "刘晶", 
  "刘宁", "刘雨丝", "刘赟", "刘长颖", "米米", "时秒", "宋卓", "苏守春", 
  "谭晶", "陶大江", "汪jeff", "汪恒", "王畅", "王凡", "王国艳", "王柯", 
  "王晴晴", "王思翔", "魏晓岚", "文宁", "吴昊", "徐毅磊", "杨超", "殷悦", 
  "张京京", "张力", "招诗苗", "赵楠", "郑斌", "齐向宇", "刘琨", "史涵"
];

export interface Member {
  id: string;
  name: string;
  active: boolean;
}

export interface DinnerEvent {
  id: string;
  date: string; // ISO date string
  location: string;
  description: string;
  attendees: string[]; // List of member IDs
  points: number; // Points awarded per person
  createdAt: number;
}

interface AppState {
  members: Member[];
  events: DinnerEvent[];
  
  // Actions
  addMember: (name: string) => void;
  toggleMember: (id: string) => void;
  deleteMember: (id: string) => void;
  addEvent: (event: Omit<DinnerEvent, 'id' | 'createdAt'>) => void;
  deleteEvent: (id: string) => void;
  resetData: () => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      members: INITIAL_MEMBERS.map(name => ({ id: nanoid(), name, active: true })),
      events: [],

      addMember: (name) => set((state) => ({
        members: [...state.members, { id: nanoid(), name, active: true }]
      })),

      toggleMember: (id) => set((state) => ({
        members: state.members.map(m => 
          m.id === id ? { ...m, active: !m.active } : m
        )
      })),
      
      deleteMember: (id) => set((state) => ({
        members: state.members.filter(m => m.id !== id)
      })),

      addEvent: (event) => set((state) => ({
        events: [{ ...event, id: nanoid(), createdAt: Date.now() }, ...state.events]
      })),

      deleteEvent: (id) => set((state) => ({
        events: state.events.filter(e => e.id !== id)
      })),
      
      resetData: () => set({ 
        members: INITIAL_MEMBERS.map(name => ({ id: nanoid(), name, active: true })),
        events: [] 
      }),
    }),
    {
      name: 'dinner-points-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
