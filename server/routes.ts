import type { Express, Request } from "express";
import { type Server } from "http";
import { z } from "zod";
import { insertEventSchema, insertMemberSchema } from "@shared/schema";
import { storage } from "./storage";

const bulkMembersSchema = z.object({
  names: z.array(z.string().trim().min(1)).min(1),
});

const ipLocationCache = new Map<string, { location: string; updatedAt: number }>();
const IP_CACHE_TTL_MS = 1000 * 60 * 60 * 24;

function normalizeIp(ip: string): string {
  if (ip.startsWith("::ffff:")) {
    return ip.slice(7);
  }
  return ip;
}

function isPrivateIp(ip: string): boolean {
  if (ip === "::1" || ip === "127.0.0.1") return true;
  if (ip.startsWith("10.")) return true;
  if (ip.startsWith("192.168.")) return true;
  if (ip.startsWith("172.")) {
    const second = Number(ip.split(".")[1]);
    if (second >= 16 && second <= 31) return true;
  }
  if (ip.startsWith("fd") || ip.startsWith("fc")) return true;
  return false;
}

async function lookupIpLocation(ip: string): Promise<string> {
  const normalizedIp = normalizeIp(ip);
  if (isPrivateIp(normalizedIp)) {
    return "内网/本机";
  }

  const cached = ipLocationCache.get(normalizedIp);
  const now = Date.now();
  if (cached && now - cached.updatedAt < IP_CACHE_TTL_MS) {
    return cached.location;
  }

  try {
    const res = await fetch(`https://ipapi.co/${encodeURIComponent(normalizedIp)}/json/`, {
      headers: { "User-Agent": "meal-score" },
    });
    if (!res.ok) {
      throw new Error(`IP lookup failed: ${res.status}`);
    }
    const data = await res.json();
    const locationParts = [data.country_name || data.country, data.region, data.city].filter(Boolean);
    const location = locationParts.length > 0 ? locationParts.join(" ") : "未知";
    ipLocationCache.set(normalizedIp, { location, updatedAt: now });
    return location;
  } catch (error) {
    console.error("Failed to lookup IP location.", error);
    ipLocationCache.set(normalizedIp, { location: "未知", updatedAt: now });
    return "未知";
  }
}

function getClientIp(req: Request): string | null {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.length > 0) {
    const first = forwarded.split(",")[0]?.trim();
    return first ? normalizeIp(first) : null;
  }
  if (Array.isArray(forwarded) && forwarded.length > 0) {
    return forwarded[0] ? normalizeIp(forwarded[0]) : null;
  }
  const directIp = req.ip || req.socket.remoteAddress;
  return directIp ? normalizeIp(directIp) : null;
}

export async function registerRoutes(
  _httpServer: Server,
  app: Express,
): Promise<Server> {
  app.get("/api/health", (_req, res) => {
    res.status(200).json({ status: "ok" });
  });

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

  app.get("/api/ip-location", async (req, res) => {
    const ip = req.query.ip;
    if (typeof ip !== "string" || ip.trim().length === 0) {
      return res.status(400).json({ message: "Missing ip." });
    }

    const location = await lookupIpLocation(ip.trim());
    return res.json({ ip: normalizeIp(ip.trim()), location });
  });

  return _httpServer;
}
