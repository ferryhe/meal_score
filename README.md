# Meal Score

Meal Score is a dinner points tracker for a group. The app lets you manage a
member list, record meal events, auto-calculate points per person, view a
history log, and see yearly leaderboards. When `DATABASE_URL` is configured,
data is stored in Postgres so multiple devices stay in sync.

## Features
- Member management (add/deactivate, search).
- Event entry with date, location, description, and attendee selection.
- Automatic point rules with optional manual override.
- Yearly stats with leaderboard and per-member totals.
- History log with per-event details and deletion.
- Server-backed persistence with Postgres.
- Server-side capture of submission time and IP address.
- IP geolocation lookup for history entries (via `ipapi.co`).

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
- `active`: boolean (inactive members are hidden from the entry screen)

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

Outbound internet access is required for IP geolocation lookups.

## Build and Run
1. Install dependencies: `npm install`
2. Dev server: `npm run dev`
3. Production build: `npm run build`
4. Start production server: `npm start`

## Step-by-step Usage
1. Start the backend (`npm run dev`) and open `http://localhost:5000`.
2. Go to “成员” and add members (or keep the seeded list if enabled).
3. Go to “记分”, select attendees, fill date/location/description, and save.
4. View “统计” to see the Top 5 leaderboard and member totals.
5. View “记录” to see history, submission time, and IP location.
6. Deactivate a member from “成员” (they will no longer appear in “记分”).

## Docker Deployment 
Create a `.env` file (copy from `.env.example`) and set:
- `POSTGRES_USER`
- `POSTGRES_PASSWORD`
- `POSTGRES_DB`
- `DATABASE_URL` (should reference the db service, e.g. `postgresql://user:pass@db:5432/dbname`)

1. Start Postgres:
   `docker compose up -d db`
2. Run database setup (one-time or when schema changes):
   `docker compose --profile tools run --rm migrate`
3. Build and start the app:
   `docker compose up -d --build app`
4. Open port `5000` in your security group (or put a reverse proxy in front).

By default the app listens on `http://<server-ip>:5000`.

You can also run the helper script:
- `bash script/deploy-ec2.sh` (expects a `.env` file in the project root)

If you already have Caddy running in Docker, add a reverse proxy rule that
points to `http://<host-ip>:5000`, or attach the app container to Caddy's
network and proxy to the service name.

## Deployment Usage (Service Ops)
- Check running containers: `docker ps`
- View app logs: `docker compose logs -f app`
- Restart the app: `docker compose restart app`
- Stop the app (keep DB): `docker compose stop app`
- Start the app: `docker compose start app`
- Update after pulling new code:
  1) `docker compose build app`
  2) `docker compose up -d app`
  3) If schema changed: `docker compose --profile tools run --rm migrate`

The app container has a healthcheck on `GET /api/health` and both app/db use
`restart: unless-stopped`.

## Customization Tips
- Seed members: edit `INITIAL_MEMBERS` in `client/src/lib/store.ts`.
- Scoring rules: update the rules in `client/src/pages/Entry.tsx`.
- Branding/meta tags: update `client/index.html` and `client/public/opengraph.jpg`.

## Limitations
- No authentication is implemented.
- Members are deactivated instead of permanently deleted.
