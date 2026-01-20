import { randomUUID } from "crypto";
import { Pool } from "pg";
import { desc, eq, inArray } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import type { IStorage } from "./storage";
import * as schema from "@shared/schema";

export class DbStorage implements IStorage {
  private pool: Pool;
  private db: ReturnType<typeof drizzle>;

  constructor() {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error("DATABASE_URL is required to use DbStorage.");
    }

    this.pool = new Pool({ connectionString });
    this.db = drizzle(this.pool, { schema });
  }

  async listMembers(): Promise<schema.Member[]> {
    return this.db
      .select()
      .from(schema.members)
      .orderBy(schema.members.createdAt);
  }

  async createMember(input: schema.InsertMember): Promise<schema.Member> {
    const [member] = await this.db
      .insert(schema.members)
      .values({
        id: randomUUID(),
        name: input.name,
        active: true,
      })
      .returning();

    if (!member) {
      throw new Error("Failed to create member.");
    }

    return member;
  }

  async deleteMember(id: string): Promise<void> {
    await this.db.transaction(async (tx) => {
      await tx
        .delete(schema.eventAttendees)
        .where(eq(schema.eventAttendees.memberId, id));
      await tx.delete(schema.members).where(eq(schema.members.id, id));
    });
  }

  async listEvents(): Promise<schema.EventWithAttendees[]> {
    const events = await this.db
      .select()
      .from(schema.events)
      .orderBy(desc(schema.events.createdAt));

    if (events.length === 0) {
      return [];
    }

    const eventIds = events.map((event) => event.id);
    const attendeeRows = await this.db
      .select()
      .from(schema.eventAttendees)
      .where(inArray(schema.eventAttendees.eventId, eventIds));

    const attendeesByEvent = new Map<string, string[]>();
    for (const row of attendeeRows) {
      const list = attendeesByEvent.get(row.eventId) ?? [];
      list.push(row.memberId);
      attendeesByEvent.set(row.eventId, list);
    }

    return events.map((event) => ({
      ...event,
      attendees: attendeesByEvent.get(event.id) ?? [],
    }));
  }

  async createEvent(
    input: schema.InsertEvent,
    ipAddress: string | null,
  ): Promise<schema.EventWithAttendees> {
    const eventId = randomUUID();
    const [event] = await this.db
      .insert(schema.events)
      .values({
        id: eventId,
        date: input.date,
        location: input.location,
        description: input.description ?? "",
        points: input.points,
        ipAddress,
      })
      .returning();

    if (!event) {
      throw new Error("Failed to create event.");
    }

    const attendeeIds = Array.from(new Set(input.attendees));
    if (attendeeIds.length > 0) {
      await this.db.insert(schema.eventAttendees).values(
        attendeeIds.map((memberId) => ({
          eventId: event.id,
          memberId,
        })),
      );
    }

    return {
      ...event,
      attendees: attendeeIds,
    };
  }

  async deleteEvent(id: string): Promise<void> {
    await this.db.transaction(async (tx) => {
      await tx
        .delete(schema.eventAttendees)
        .where(eq(schema.eventAttendees.eventId, id));
      await tx.delete(schema.events).where(eq(schema.events.id, id));
    });
  }
}
