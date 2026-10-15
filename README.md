# MechGirl STEM Portal

Empowering Women in Mechanics, Robotics & STEM. A modern Next.js 14 fullstack portal for
managing activities, products, knowledge articles, and community engagement.

## Stack

- **Frontend:** React 18 + Next.js 14 (Pages Router) + TypeScript + Tailwind CSS + Framer Motion
- **Backend:** Next.js Serverless API routes (Node 20)
- **Auth:** NextAuth.js (Firebase Adapter + Credentials Provider + GitHub OAuth) with bcrypt password hashing
- **Database:** Google Cloud Firestore via Firebase Admin SDK & Firebase Client SDK
- **API docs:** Hand-maintained OpenAPI spec rendered with Swagger UI (`/docs`)
- **Deployment:** Vercel (recommended) / Docker & Nginx / Standalone VPS with PM2

---

## Deployment Documentation

Complete, production-ready deployment guides are available in the `docs/` folder:

- **[Full Production Deployment Guide](docs/DEPLOYMENT_GUIDE.md):** Complete walkthrough covering Firebase project configuration, Firestore security rules, seed data migration, Vercel zero-config deployment, Docker + Nginx container setup, PM2, and admin bootstrapping.
- **[VPS Deployment Guide (Low RAM / 1GB VPS)](docs/VPS_DEPLOYMENT.md):** Detailed guide for self-hosting on minimal VPS instances (Docker, swap space, PM2, and Nginx SSL).

---

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

Key required variables:

- `NEXT_PUBLIC_FIREBASE_*` — Client SDK credentials from Firebase Console.
- `FIREBASE_ADMIN_*` — Service Account credentials for privileged database access.
- `NEXTAUTH_SECRET` — 32+ char random secret for JWT signing (`openssl rand -base64 32`).
- `ADMIN_BOOTSTRAP_PASSWORD` — used **once** to create the initial admin account.

### 3. Seed Firestore Database

Run the automated migration script to populate Firestore with sample activities, products, and articles:

```bash
npm run db:migrate
```

### 4. Create the first admin account

Start the dev server:

```bash
npm run dev
```

In another terminal, call the login endpoint with the bootstrap password to atomically register the first admin user:

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"you@example.com","password":"your-ADMIN_BOOTSTRAP_PASSWORD"}'
```

After the admin account exists, remove `ADMIN_BOOTSTRAP_PASSWORD` from your environment.

### 5. Build and run for production

```bash
npm run build
npm start
```

---

## Authentication model

Three independent auth channels are supported, all backed by env vars only — **no hardcoded secrets**:

1. **NextAuth session** (preferred). Sign in via `/login` using a real bcrypt-hashed password.
2. **Firebase ID Token** — verify ID tokens directly via `adminAuth.verifyIdToken`.
3. **Bearer token / `x-admin-key` header / `admin_token` cookie** — values must match `ADMIN_API_KEY`, `NEXTAUTH_SECRET`, or `SECRET`.
4. **GitHub OAuth** — optional, configured via `GITHUB_ID` / `GITHUB_SECRET`.

---

## Project layout

```
.
├── components/        # React UI components (admin tabs, layout, animation)
├── data/seeds/        # JSON initial seed stores for activities, products, etc.
├── docs/              # Production deployment guides & architecture docs
├── lib/               # Server & client helpers (dataService, types, firebaseAdmin, auth)
├── pages/             # Next.js Pages Router (UI + /api routes)
├── public/            # Static assets and images
├── scripts/           # dev-prep and migrate-to-firebase scripts
├── firestore.rules    # Cloud Firestore security rules
├── Dockerfile         # Production multi-stage Docker build
└── docker-compose.yml # Next.js web service + Nginx reverse proxy
```

---

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start Next.js dev server with automated prep check |
| `npm run build` | Compile Next.js production bundle (`.next/standalone`) |
| `npm start` | Run production build |
| `npm run db:migrate` | Seed and migrate data into Cloud Firestore |
| `npm run typecheck` | Run TypeScript compiler type validation (`tsc --noEmit`) |
| `npm run lint` | Run Next.js ESLint checks |

---

## API documentation

Once running, visit `http://localhost:3000/docs` for the interactive Swagger UI,
or `http://localhost:3000/api/openapi.json` for the raw OpenAPI spec.
