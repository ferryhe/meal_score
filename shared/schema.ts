import {
  pgTable,
  text,
  varchar,
  timestamp,
  integer,
  boolean,
  primaryKey,
} from "drizzle-orm/pg-core";
import { z } from "zod";

export const members = pgTable("members", {
  id: varchar("id").primaryKey(),
  name: text("name").notNull().unique(),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const events = pgTable("events", {
  id: varchar("id").primaryKey(),
  date: text("date").notNull(),
  location: text("location").notNull(),
  description: text("description").notNull(),
  points: integer("points").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  ipAddress: varchar("ip_address", { length: 64 }),
});

export const eventAttendees = pgTable(
  "event_attendees",
  {
    eventId: varchar("event_id")
      .notNull()
      .references(() => events.id, { onDelete: "cascade" }),
    memberId: varchar("member_id")
      .notNull()
      .references(() => members.id, { onDelete: "cascade" }),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.eventId, table.memberId] }),
  }),
);

export const insertMemberSchema = z.object({
  name: z.string().trim().min(1).max(80),
});

export const insertEventSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  location: z.string().trim().min(1).max(200),
  description: z.string().trim().max(500).optional().default(""),
  points: z.number().int().min(0).max(20),
  attendees: z.array(z.string()).min(1),
});

export type InsertMember = z.infer<typeof insertMemberSchema>;
export type InsertEvent = z.infer<typeof insertEventSchema>;

export type Member = typeof members.$inferSelect;
export type MealEvent = typeof events.$inferSelect;
export type EventAttendee = typeof eventAttendees.$inferSelect;
export type EventWithAttendees = MealEvent & { attendees: string[] };
