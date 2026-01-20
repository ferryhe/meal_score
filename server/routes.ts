import type { Express, Request } from "express";
import { type Server } from "http";
import { z } from "zod";
import { insertEventSchema, insertMemberSchema } from "@shared/schema";
import { storage } from "./storage";

const bulkMembersSchema = z.object({
  names: z.array(z.string().trim().min(1)).min(1),
});

function getClientIp(req: Request): string | null {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.length > 0) {
    return forwarded.split(",")[0]?.trim() || null;
  }
  if (Array.isArray(forwarded) && forwarded.length > 0) {
    return forwarded[0] || null;
  }
  return req.ip || req.socket.remoteAddress || null;
}

export async function registerRoutes(
  _httpServer: Server,
  app: Express,
): Promise<Server> {
  app.get("/api/members", async (_req, res) => {
    const members = await storage.listMembers();
    res.json(members);
  });

  app.post("/api/members", async (req, res) => {
    const parsed = insertMemberSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Invalid member payload." });
    }

    const existing = await storage.listMembers();
    if (existing.some((member) => member.name === parsed.data.name)) {
      return res.status(409).json({ message: "Member already exists." });
    }

    const member = await storage.createMember(parsed.data);
    return res.status(201).json(member);
  });

  app.post("/api/members/bulk", async (req, res) => {
    const parsed = bulkMembersSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Invalid member list." });
    }

    const existing = await storage.listMembers();
    const existingNames = new Set(existing.map((member) => member.name));

    for (const name of parsed.data.names) {
      if (!existingNames.has(name)) {
        await storage.createMember({ name });
      }
    }

    const members = await storage.listMembers();
    return res.status(201).json(members);
  });

  app.delete("/api/members/:id", async (req, res) => {
    await storage.deleteMember(req.params.id);
    res.status(204).end();
  });

  app.get("/api/events", async (_req, res) => {
    const events = await storage.listEvents();
    res.json(events);
  });

  app.post("/api/events", async (req, res) => {
    const parsed = insertEventSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Invalid event payload." });
    }

    const event = await storage.createEvent(parsed.data, getClientIp(req));
    return res.status(201).json(event);
  });

  app.delete("/api/events/:id", async (req, res) => {
    await storage.deleteEvent(req.params.id);
    res.status(204).end();
  });

  return _httpServer;
}
