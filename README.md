# BuildRight — Construction Business Management System

A full-stack web application for running a small-to-mid-size construction
company: clients, projects, tasks, crew time tracking, estimates, invoices
& payments, expenses, equipment, change orders, and project documents —
with role-based access for owners, project managers, accountants, and field
crew.

## Tech stack

| Layer      | Choice |
|------------|--------|
| Framework  | [Next.js 16](https://nextjs.org) (App Router, Server Components, Server Actions, Turbopack) |
| Language   | TypeScript |
| Database   | PostgreSQL |
| ORM        | [Prisma 7](https://www.prisma.io) (`prisma-client` generator + `@prisma/adapter-pg`) |
| Auth       | Custom session cookies — `bcryptjs` password hashing + `jose` signed JWTs (no third-party auth service) |
| Styling    | Tailwind CSS v4 |
| Charts     | Recharts |
| Validation | Zod |

Everything — UI, business logic, and data access — lives in one Next.js
app. Pages are React Server Components that query Prisma directly; writes
go through **Server Actions** (no separate REST/GraphQL API layer, though
you could add route handlers under `src/app/api` if you need one).

## Data model

See [`prisma/schema.prisma`](./prisma/schema.prisma) for the full schema.

- **User** — team members (`ADMIN`, `MANAGER`, `ACCOUNTANT`, `EMPLOYEE`)
- **Client** — customers
- **Project** — jobs, linked to a client and an optional manager
- **Task** — work items on a project, assignable, with status/priority
- **TimeEntry** — crew hours logged against a project/task
- **Estimate** / **EstimateItem** — quotes sent to clients, convertible to invoices
- **Invoice** / **InvoiceItem** / **Payment** — billing and payment history
- **Expense** — job-cost tracking by category
- **Document** — files (contracts, permits, photos…) stored as bytes in Postgres
- **Equipment** — tools/vehicles, assignable to one project at a time
- **ChangeOrder** — scope/price changes to a project, with approval workflow

## Roles & permissions

| Role         | Can do |
|--------------|--------|
| **Admin**    | Everything, incl. managing team accounts (`/team`) |
| **Manager**  | Projects, tasks, estimates, invoices, expenses, equipment, change orders |
| **Accountant** | Clients, estimates, invoices, payments, expenses (no project/task management) |
| **Employee** | View assigned work; log time and update status only on their own tasks/time entries |

Permissions are enforced **twice**: once for UI (hiding actions the
current user can't take) and again inside every Server Action via
`requireRole(...)` — forging a request cannot bypass authorization.
Route access (redirecting signed-out users to `/login`) is enforced in
`src/proxy.ts`, which runs on every request.

## Getting started

### 1. Install dependencies

```bash
npm install
```

### 2. Start Postgres

The easiest path is Docker Compose:

```bash
docker compose up -d db
```

This starts Postgres 16 on `localhost:5432` with the credentials already
wired into `.env.example`. If you'd rather use an existing/local Postgres
instance, just point `DATABASE_URL` at it instead.

### 3. Configure environment variables

```bash
cp .env.example .env
```

- `DATABASE_URL` — Postgres connection string (matches `docker-compose.yml` by default)
- `SESSION_SECRET` — random string used to sign session cookies. Generate one with `openssl rand -base64 32`.

### 4. Create the database schema

```bash
npx prisma migrate dev
```

### 5. Seed demo data (optional but recommended)

```bash
npx prisma db seed
```

This creates five demo accounts (**password for all: `password123`**):

| Email | Role |
|-------|------|
| admin@buildright.test | Admin |
| manager@buildright.test | Manager |
| accountant@buildright.test | Accountant |
| worker1@buildright.test | Employee |
| worker2@buildright.test | Employee |

...plus sample clients, projects, tasks, time entries, an estimate, and
invoices with payments so the dashboard isn't empty.

### 6. Run the app

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) — you'll be redirected
to `/login`.

## Available scripts

```bash
npm run dev      # start the dev server (Turbopack)
npm run build    # production build
npm run start    # run the production build
npm run lint     # ESLint

npx prisma studio       # browse/edit data in a GUI
npx prisma migrate dev  # create & apply a new migration after editing schema.prisma
npx prisma db seed      # re-run the seed script
```

## Project structure

```
prisma/
  schema.prisma        # data model
  seed.ts               # demo data
src/
  app/
    login/               # sign-in page + server action
    (app)/                # authenticated app shell (sidebar/topbar layout)
      dashboard/          # KPIs, charts, upcoming tasks
      clients/             # client CRUD
      projects/            # project CRUD + tabbed detail page
        [id]/tabs/          # Overview / Tasks / Time / Estimates / Invoices /
                             # Expenses / Change Orders / Documents / Equipment
      estimates/           # estimate CRUD, line items, convert-to-invoice
      invoices/             # invoice CRUD, line items, payments
      expenses/             # cross-project expense list
      time/                 # cross-project time tracking
      equipment/            # equipment registry
      team/                 # user management (admin only)
      documents/[id]/      # file download route handler
  components/
    ui/                    # design-system primitives (Button, Card, Table, …)
    layout/                # Sidebar, Topbar, nav config
    charts/                # Recharts wrappers
    forms/                 # LineItemsEditor (dynamic estimate/invoice rows)
  lib/
    auth.ts                # session cookies, password hashing, role guards
    prisma.ts              # Prisma client singleton (pg driver adapter)
    money.ts, line-items.ts, numbering.ts, format.ts
  proxy.ts                 # route protection (formerly "middleware")
```

Project documents are stored as bytes directly in Postgres (via the
`Document.data` column) rather than an external object store, so the app
has zero external dependencies beyond the database — swap in S3/R2 later
if you outgrow that.

## Notes on Next.js 16 / Prisma 7

This was built against the current majors of both, which changed enough
from earlier versions that it's worth calling out:

- Route protection lives in **`proxy.ts`** (Next 16 renamed `middleware.ts`).
- Prisma 7 requires a **driver adapter** (`@prisma/adapter-pg`) and an
  explicit generator `output` — the generated client lives in
  `src/generated/prisma/` (gitignored; regenerate with `npx prisma generate`).
- `prisma.config.ts` (not the `datasource` block in `schema.prisma`) is
  where the database URL and seed command are configured.

## Deployment

Any Node.js host works (Vercel, Railway, Fly.io, a VPS). You'll need:

1. A Postgres database — set `DATABASE_URL`.
2. A strong `SESSION_SECRET`.
3. Run `npx prisma migrate deploy` as part of your release step.
4. `npm run build && npm run start` (or your platform's Next.js adapter).
