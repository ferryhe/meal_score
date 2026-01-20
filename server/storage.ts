import { randomUUID } from "crypto";
import {
  type EventWithAttendees,
  type InsertEvent,
  type InsertMember,
  type MealEvent,
  type Member,
} from "@shared/schema";
import { DbStorage } from "./db";

export interface IStorage {
  listMembers(): Promise<Member[]>;
  createMember(input: InsertMember): Promise<Member>;
  deleteMember(id: string): Promise<void>;
  listEvents(): Promise<EventWithAttendees[]>;
  createEvent(
    input: InsertEvent,
    ipAddress: string | null,
  ): Promise<EventWithAttendees>;
  deleteEvent(id: string): Promise<void>;
}

export class MemStorage implements IStorage {
  private members: Map<string, Member>;
  private events: Map<string, MealEvent>;
  private attendees: Map<string, Set<string>>;

  constructor() {
    this.members = new Map();
    this.events = new Map();
    this.attendees = new Map();
  }

  async listMembers(): Promise<Member[]> {
    return Array.from(this.members.values());
  }

  async createMember(input: InsertMember): Promise<Member> {
    const existing = Array.from(this.members.values()).find(
      (member) => member.name === input.name,
    );
    if (existing) {
      throw new Error("Member already exists.");
    }

    const id = randomUUID();
    const member: Member = {
      id,
      name: input.name,
      active: true,
      createdAt: new Date(),
    };
    this.members.set(id, member);
    return member;
  }

  async deleteMember(id: string): Promise<void> {
    this.members.delete(id);
    for (const attendeeSet of Array.from(this.attendees.values())) {
      attendeeSet.delete(id);
    }
  }

  async listEvents(): Promise<EventWithAttendees[]> {
    const events = Array.from(this.events.values()).sort((a, b) => {
      return b.createdAt.getTime() - a.createdAt.getTime();
    });
    return events.map((event) => ({
      ...event,
      attendees: Array.from(this.attendees.get(event.id) ?? []),
    }));
  }

  async createEvent(
    input: InsertEvent,
    ipAddress: string | null,
  ): Promise<EventWithAttendees> {
    const id = randomUUID();
    const event: MealEvent = {
      id,
      date: input.date,
      location: input.location,
      description: input.description ?? "",
      points: input.points,
      createdAt: new Date(),
      ipAddress,
    };
    this.events.set(id, event);
    this.attendees.set(id, new Set(input.attendees));
    return {
      ...event,
      attendees: Array.from(this.attendees.get(id) ?? []),
    };
  }

  async deleteEvent(id: string): Promise<void> {
    this.events.delete(id);
    this.attendees.delete(id);
  }
}

export const storage: IStorage = process.env.DATABASE_URL
  ? new DbStorage()
  : new MemStorage();
