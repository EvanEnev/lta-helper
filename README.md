# LTA Helper

Internal HR and operations management system for a live entertainment / event company. Covers salary calculation, payroll sheets, shift scheduling, worker management, and real-time analytics.

> **Note — private deployment.** This repository is designed for a specific organization and requires access to a private PostgreSQL database, Telegram bots, and Google Workspace. Out of the box it won't run without environment variables supplied by the team.

## Features

| Section | Description |
|---------|-------------|
| **Dashboard** | Salary summary for current and previous pay periods, rank progress |
| **Workers** | Profiles, permissions, ranks, location map |
| **Salary** | Breakdown by period: base rate, overtime, games, fines, bonuses |
| **Payrolls** | Create, issue, and view payment sheets |
| **Payments** | Payment history and management |
| **Schedule** | Work calendar by location |
| **Wrapped** | Year-in-review analytics |
| **Admin** | System management, permissions, data operations |

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16.2 (App Router) |
| React | 19.2 |
| Language | TypeScript 5.9 (strict, ESM) |
| UI | HeroUI v3 + Tailwind CSS v4 |
| Icons | Iconify |
| Animations | Framer Motion 12 |
| State | Jotai 2 |
| Real-time | Socket.IO 4 |
| Database | PostgreSQL (`pg`) |
| Auth | better-auth 1.5 |
| Date/time | Luxon 3 + `@internationalized/date` |
| Maps | Leaflet + react-leaflet |
| Excel | ExcelJS |
| Push notifications | web-push |
| Google integration | google-spreadsheet, googleapis |
| Logger | Winston → Loki |
| Server | Custom `server.ts` (tsx) |
| Package manager | pnpm |

## Project Structure

```
.
├── app/                    # Next.js App Router
│   ├── api/                # Route handlers (REST endpoints)
│   ├── actions/            # Server Actions
│   ├── salary/             # Salary pages
│   ├── payrolls/           # Payroll list, create, issue, details
│   ├── payments/           # Payments
│   ├── workers/            # Workers
│   ├── schedule/           # Schedule
│   ├── wrapped/            # Analytics
│   └── admin/              # Admin panel
│
├── src/
│   ├── components/         # React components, organized by feature
│   ├── hooks/              # Custom hooks (useIsMobile, useColors, …)
│   └── utils/              # Client utilities, Jotai atoms, shared types
│
├── lib/                    # Server-side business logic
│   ├── auth.ts             # better-auth config
│   ├── database.ts         # PostgreSQL connection
│   ├── google.ts           # Google Sheets / OAuth
│   ├── socket.ts           # Socket.IO instance
│   ├── functions/          # Salary calc, ranks, getters, distribution
│   └── socket/             # DB listener, server-side socket functions
│
├── public/
│   ├── icons/locations/    # Location SVG/TSX icons
│   └── sw.js               # Service Worker (Web Push)
│
├── server.ts               # HTTP server: Next.js + Socket.IO combined
├── Logger.ts               # Winston logger with Loki transport
└── Dockerfile              # Multi-stage Docker image
```

## Getting Started

### Prerequisites

- Node.js 22+
- pnpm
- PostgreSQL (with the organization's schema)

### Install dependencies

```bash
pnpm install
```

### Environment variables

Copy `.env.example` to `.env` and fill in the values (obtain from the team):

```bash
cp .env.example .env
```

### Run

```bash
# Development (hot reload via tsx watch)
pnpm dev

# Type check
pnpm test


# Production build
pnpm build

# Production server
pnpm start
```

Dev server: `http://localhost:3000`

## Deployment (Docker)

```bash
# Build image
docker build -t lta-helper .

# Run with env file
docker run -p 5000:5000 --env-file .env lta-helper
```

Multi-stage build: `node:22-alpine` builder → minimal runner.

## Architecture Notes

**Custom server** — `server.ts` mounts Socket.IO on the same HTTP server as Next.js, so real-time and REST share one port.

**Real-time updates** — `lib/socket/dbListener.ts` listens for database changes and broadcasts events to connected clients.

**Desktop / mobile split** — page components are split into `Desktop*` / `Mobile*` variants, switched by the `useIsMobile` hook.

**Salary calculation** — all logic lives server-side in `lib/functions/`, delegating heavy computation to the PostgreSQL function `functions.get_salary(worker_id, from, to, ...)`.

**Rank system** — rank progress is tracked across tables `ranks`, `ranks.requirements`, and `relations.workers_requirements`.
