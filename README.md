# MechGirl STEM Portal

Empowering Women in Mechanics, Robotics & STEM. A Next.js 13 fullstack portal for
managing activities, products, knowledge articles, and community engagement.

## Stack

- **Frontend:** React 18 + Next.js 13 (Pages Router) + TypeScript + Tailwind CSS + Framer Motion
- **Backend:** Next.js API routes (Node 20)
- **Auth:** NextAuth.js (Credentials + GitHub OAuth) with bcrypt password hashing
- **Database:** PostgreSQL via Prisma 7 + `@prisma/adapter-pg`
- **API docs:** Hand-maintained OpenAPI spec rendered with Swagger UI (`/docs`)
- **Deployment:** Docker + Docker Compose + Nginx reverse proxy

## Quick start

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Copy `.env.example` to `.env` and fill in real values:

```bash
cp .env.example .env
```

The only **required** values are:

- `DATABASE_URL` — PostgreSQL connection string
- `NEXTAUTH_SECRET` — 32+ char random secret for JWT signing
- `ADMIN_BOOTSTRAP_PASSWORD` — used **once** to create the first admin account

Generate secrets with `openssl rand -base64 32`.

### 3. Start the database and run migrations

```bash
npm run db:up                  # starts PostgreSQL via Docker Compose
npm run db:migrate             # applies Prisma migrations
npm run db:seed                # optional: populate with sample data
```

### 4. Create the first admin account

Start the dev server, then call the login endpoint with the bootstrap password
to atomically create the first admin user:

```bash
npm run dev

# In another terminal:
curl -X POST http://localhost:3000/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"you@example.com","password":"your-ADMIN_BOOTSTRAP_PASSWORD"}'
```

After the admin account exists, you may remove `ADMIN_BOOTSTRAP_PASSWORD` from
your environment.

### 5. Start the app

```bash
npm run dev
# or for production:
npm run build && npm start
```

## Authentication model

Three independent auth channels are supported, all backed by env vars only —
**no hardcoded secrets**:

1. **NextAuth session** (preferred). Sign in via `/login` using a real bcrypt-hashed
   password (set during registration or by an existing admin).
2. **Bearer token / `x-admin-key` header / `admin_token` cookie** — values must
   match one of `ADMIN_API_KEY`, `NEXTAUTH_SECRET`, or `SECRET`.
3. **GitHub OAuth** — optional, configured via `GITHUB_ID` / `GITHUB_SECRET`.

If none of the env keys are configured, `lib/auth.ts` throws at boot — misconfigured
deployments fail fast instead of silently accepting any secret.

## Project layout

```
.
├── components/        # React UI components (admin tabs, layout, animation)
├── lib/               # Server-side helpers (dataService, auth, prisma, sanitize)
├── pages/             # Next.js Pages Router (UI + /api routes)
├── prisma/            # Schema, migrations, seed
├── public/            # Static assets
├── nginx/             # Reverse proxy config
├── data/              # JSON fallback stores when DB is unavailable
└── docker-compose.yml # Postgres + Next.js + Nginx
```

## Security notes

- All secrets live in environment variables — there are no hardcoded fallbacks.
- Passwords are bcrypt-hashed (12 rounds).
- HTML content from the database is sanitized with `isomorphic-dompurify` before rendering.
- Admin user PII (email) is stripped from public `Knowledge` API responses.
- `admin_token` cookie is set with `SameSite=Strict` and `Secure` (in production).

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start Next.js dev server |
| `npm run build` | Generate Prisma client + Next.js production build |
| `npm start` | Run production build |
| `npm run db:up` / `db:down` | Start/stop Docker Compose services |
| `npm run db:migrate` | `prisma migrate deploy` |
| `npm run db:push` | Push schema changes (dev only, no migrations) |
| `npm run db:seed` | Run `prisma/seed.ts` |
| `npm run typecheck` | `tsc --noEmit` |

## API documentation

Once running, visit `http://localhost:3000/docs` for the interactive Swagger UI,
or `http://localhost:3000/api/openapi.json` for the raw OpenAPI spec.
