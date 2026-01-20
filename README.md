# Meal Score

Meal Score is a dinner points tracker for a group. The app lets you manage a
member list, record meal events, auto-calculate points per person, view a
history log, and see yearly leaderboards. When `DATABASE_URL` is configured,
data is stored in Postgres so multiple devices stay in sync.

## Features
- Member management (add/delete, search).
- Event entry with date, location, description, and attendee selection.
- Automatic point rules with optional manual override.
- Yearly stats with leaderboard and per-member totals.
- History log with per-event details and deletion.
- Server-backed persistence with Postgres.
- Server-side capture of submission time and IP address.

## Tech Stack
- React 19 + Vite 7
- Zustand for state management
- Tailwind CSS + Radix UI primitives
- Wouter for routing
- Recharts for charts
- Express for dev/prod hosting
- Postgres + Drizzle ORM

## Project Structure
- `client/` React app, UI components, pages, and styles.
- `server/` Express server, Vite middleware for dev, static hosting for prod.
- `shared/` Shared schema definitions (Drizzle).
- `script/` Build script for client + server bundling.

## Data Model
Member
- `id`: string
- `name`: string
- `active`: boolean (currently not used in UI)

DinnerEvent
- `id`: string
- `date`: YYYY-MM-DD
- `location`: string
- `description`: string
- `attendees`: array of member IDs
- `points`: number (points per person)
- `createdAt`: timestamp (ISO string)
- `ipAddress`: string (captured by the server)

## Scoring Rules
Auto-calculated points based on attendee count:
- 0-1 people: 0 points
- 2-5 people: 1 point
- 6-8 people: 3 points
- 9-15 people: 5 points
- 16+ people: 10 points

Manual override is available (0-20).

## Routes
- `/` New event entry
- `/members` Member list and management
- `/stats` Yearly stats and leaderboard
- `/history` Event history

## Persistence
- If `DATABASE_URL` is set, data is stored in Postgres.
- If not set, the server uses in-memory storage (data resets on restart).

## Scripts
- `npm run dev` Start Express with Vite middleware on port `5000`.
- `npm run dev:client` Start the Vite dev server only (API calls will fail unless the backend is running).
- `npm run build` Build client and server into `dist/`.
- `npm start` Run the built server from `dist/index.cjs`.
- `npm run check` Run TypeScript type-checking.
- `npm run db:push` Push the Drizzle schema (requires `DATABASE_URL`).

## Environment Variables
- `PORT` Port for the Express server (default: `5000`).
- `DATABASE_URL` PostgreSQL URL used by the server and Drizzle.
- `REPLIT_INTERNAL_APP_DOMAIN` or `REPLIT_DEV_DOMAIN` Used by the meta images
  plugin to rewrite `og:image` and `twitter:image`.

## Build and Run
1. Install dependencies: `npm install`
2. Dev server: `npm run dev`
3. Production build: `npm run build`
4. Start production server: `npm start`

## Customization Tips
- Seed members: edit `INITIAL_MEMBERS` in `client/src/lib/store.ts`.
- Scoring rules: update the rules in `client/src/pages/Entry.tsx`.
- Branding/meta tags: update `client/index.html` and `client/public/opengraph.jpg`.

## Limitations
- No authentication is implemented.
