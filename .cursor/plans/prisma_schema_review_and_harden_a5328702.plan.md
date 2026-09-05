# Prisma Schema Review — Drop dead code, add enums, sync indexes

## Context

The Prisma schema at `prisma/schema.prisma` defines 11 models. The audit (subagents `13cf5d8f` and `49d77f5e`) found:

- **Dead schema**: `Post` model + `User.posts` relation have no application usage
- **Schema/migration drift**: 9 indexes exist in the migration but not in the schema
- **Free-form strings**: `role`, `type`, `status`, `category` columns accept any string — bugs and typos slip through silently
- **Missing `@updatedAt`**: `Registration` and `ContactMessage`
- **`Knowledge.views`**: declared but never incremented (drop)
- **`Activity.tags`**: missing, but `Product` and `Knowledge` both have it (add)
- **Schema default values that don't match runtime**: e.g. `KnowledgeCategory` schema comment lists 5 values, runtime form has 7

## Design decisions (locked)

| Question | Choice |
|---|---|
| Postgres enum wire format | **lowercase** — every enum member is `@map`'d to its lowercase string (`'admin'`, `'open'`, etc.) so existing JSON seeds and runtime compares keep working |
| Legacy data migration | **backfill in the new migration SQL** — `USING column::text::"EnumName"` preserves existing values |
| `tags` on Activity | **add `tags String[] @default([])` to Activity** |
| `Knowledge.views` | **drop** |

## Files

| File | Action |
|---|---|
| `prisma/schema.prisma` | modify |
| `prisma/migrations/<timestamp>_schema_hardening/migration.sql` | create |
| `lib/dataService.ts` | modify enum writes, prune `Post`-related dead code paths, drop `views` |
| `lib/seed.ts` (Prisma) | modify — pass enum values where needed |
| `pages/api/auth/[...nextauth].ts` | modify — `Role.USER` fallback |
| `pages/api/auth/login.ts` | modify — `Role.ADMIN` / `Role.USER` |
| `pages/api/auth/register.ts` | modify — `Role.USER` |
| `pages/api/users/index.ts` | modify — `Role.USER` default + admin guard compares against `Role.ADMIN` |
| `pages/api/users/[id].ts` | modify — admin guard |
| `pages/api/knowledge/index.ts` | modify — `KnowledgeStatus.PENDING` default |
| `lib/swaggerSpec.ts` | modify — keep string examples but make them match enum members |
| `components/admin/UsersTab.tsx` | modify — derive options from enum |
| `components/admin/ActivityForm.tsx` | modify — derive options from enum |
| `components/admin/ActivitiesTab.tsx` | modify — chip filter from enum |
| `components/admin/ProductsTab.tsx` | modify — drop orphan 'Software' pill |
| `components/admin/ProductForm.tsx` | modify — derive options from enum |
| `components/admin/CommonKnowledgeTab.tsx` | modify — derive categories from enum, status filters from enum |
| `pages/admin/index.tsx` | modify — `Role.ADMIN` compare |
| `pages/admin/activities/new.tsx`, `[slug].tsx` | modify — `Role.ADMIN` compare |
| `pages/about.tsx` | modify — `Role.ADMIN` / `Role.AUTHOR` compare (UI label string kept) |
| `pages/index.tsx` | modify — `ActivityStatus.FULL` compare, `typeColor` switch on enum |
| `pages/login.tsx` | modify — `Role.ADMIN` compare, badge color switch on enum |
| `pages/common-knowledge/index.tsx` | modify — `KnowledgeStatus.CONFIRMED` SSR fetch, `ActivityStatus.FULL`, `typeColor` switch on enum |
| `pages/common-knowledge/[slug].tsx` | modify — `ActivityStatus.OPEN` / `FULL` optimistic update |
| `pages/products/index.tsx` | modify — `categoryColor` switch on enum |
| `pages/products/[slug].tsx` | modify — `categoryColor` switch on enum |

## Schema changes

### New enums (all `@map` to lowercase for wire compatibility)

```prisma
enum Role {
  admin  @map("admin")
  author @map("author")
  user   @map("user")
}

enum ActivityType {
  Workshop     @map("Workshop")
  Challenge    @map("Challenge")
  Masterclass  @map("Masterclass")
  Panel        @map("Panel")
}

enum ActivityStatus {
  open   @map("open")
  full   @map("full")
  closed @map("closed")
}

enum ProductCategory {
  Robotics      @map("Robotics")
  Knowledge     @map("Knowledge")
  IoT           @map("IoT")
  Mechatronics  @map("Mechatronics")
}

enum KnowledgeCategory {
  Robotics         @map("Robotics")
  Mechanics        @map("Mechanics")
  Engineering      @map("Engineering")
  AI_And_Vision    @map("AI & Vision")
  IoT_And_Hardware @map("IoT & Hardware")
  Programming      @map("Programming")
  General          @map("General")
}

enum KnowledgeStatus {
  pending   @map("pending")
  confirmed @map("confirmed")
  rejected  @map("rejected")
}
```

### Model field changes

```prisma
model User {
  // ...
  role Role @default(user)  // was String
  // drop: posts Post[]
  // keep: timeline Json
  @@index([createdAt])      // new
  @@map("users")
}

model Activity {
  // ...
  type   ActivityType   @default(Workshop)
  status ActivityStatus @default(open)
  tags   String[]       @default([])              // NEW
  @@index([status])
  @@index([featured])
  @@index([createdAt])
  @@index([status, createdAt])
}

model Registration {
  // ...
  updatedAt DateTime @updatedAt @map("updated_at")  // NEW
  @@index([activityId])
  @@index([email])
  @@index([createdAt])
}

model Product {
  // ...
  category ProductCategory @default(Robotics)
  @@index([category])
  @@index([featured])
  @@index([createdAt])
}

model CarouselSlide {
  // ...
  @@index([active, order])
}

model ContactMessage {
  // ...
  updatedAt DateTime @updatedAt @map("updated_at")  // NEW
  @@index([read])
  @@index([createdAt])
}

model Knowledge {
  // ...
  drop: views Int
  category KnowledgeCategory @default(Engineering)
  status   KnowledgeStatus   @default(pending)
  @@index([status, createdAt])
  @@index([authorId])
  @@index([confirmed])
}

drop: model Post
drop: User.posts Post[]
```

## Migration SQL

```sql
-- 1. Create enums
CREATE TYPE "Role" AS ENUM ('admin', 'author', 'user');
CREATE TYPE "ActivityType" AS ENUM ('Workshop', 'Challenge', 'Masterclass', 'Panel');
CREATE TYPE "ActivityStatus" AS ENUM ('open', 'full', 'closed');
CREATE TYPE "ProductCategory" AS ENUM ('Robotics', 'Knowledge', 'IoT', 'Mechatronics');
CREATE TYPE "KnowledgeCategory" AS ENUM (
  'Robotics', 'Mechanics', 'Engineering',
  'AI & Vision', 'IoT & Hardware', 'Programming', 'General'
);
CREATE TYPE "KnowledgeStatus" AS ENUM ('pending', 'confirmed', 'rejected');

-- 2. Convert columns (backfill from text in same statement)
ALTER TABLE "users"           ALTER COLUMN "role"     TYPE "Role"            USING "role"::"Role";
ALTER TABLE "activities"      ALTER COLUMN "type"     TYPE "ActivityType"    USING "type"::"ActivityType";
ALTER TABLE "activities"      ALTER COLUMN "status"   TYPE "ActivityStatus"  USING "status"::"ActivityStatus";
ALTER TABLE "products"        ALTER COLUMN "category" TYPE "ProductCategory" USING "category"::"ProductCategory";
ALTER TABLE "common_knowledge" ALTER COLUMN "category" TYPE "KnowledgeCategory" USING "category"::"KnowledgeCategory";
ALTER TABLE "common_knowledge" ALTER COLUMN "status"   TYPE "KnowledgeStatus"   USING "status"::"KnowledgeStatus";

-- 3. New fields
ALTER TABLE "activities"         ADD COLUMN "tags" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "registrations"      ADD COLUMN "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "contact_messages"   ADD COLUMN "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- 4. Drop
ALTER TABLE "common_knowledge" DROP COLUMN "views";
DROP TABLE IF EXISTS "posts";          -- FK on users(id)
ALTER TABLE "users"           DROP COLUMN IF EXISTS "posts_fk";  -- safety
-- (User.posts is dropped at the schema layer; Prisma will regenerate FK as needed)

-- 5. Add missing indexes (idempotent)
CREATE INDEX IF NOT EXISTS "activities_status_created_at_idx" ON "activities" ("status", "created_at");
CREATE INDEX IF NOT EXISTS "activities_created_at_idx"        ON "activities" ("created_at");
CREATE INDEX IF NOT EXISTS "products_created_at_idx"          ON "products" ("created_at");
CREATE INDEX IF NOT EXISTS "users_created_at_idx"             ON "users" ("created_at");
CREATE INDEX IF NOT EXISTS "registrations_created_at_idx"     ON "registrations" ("created_at");
CREATE INDEX IF NOT EXISTS "contact_messages_created_at_idx"  ON "contact_messages" ("created_at");
CREATE INDEX IF NOT EXISTS "knowledge_status_created_at_idx"  ON "common_knowledge" ("status", "created_at");
CREATE INDEX IF NOT EXISTS "knowledge_author_id_idx"          ON "common_knowledge" ("author_id");
CREATE INDEX IF NOT EXISTS "knowledge_confirmed_idx"          ON "common_knowledge" ("confirmed");
CREATE INDEX IF NOT EXISTS "carousel_slides_active_order_idx" ON "carousel_slides" ("active", "order");

-- 6. Reconcile cascade on Registration.activity
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'registrations_activity_id_fkey'
      AND table_name = 'registrations'
  ) THEN
    ALTER TABLE "registrations"
      ADD CONSTRAINT "registrations_activity_id_fkey"
      FOREIGN KEY ("activity_id") REFERENCES "activities"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
```

## API + GUI changes

### `lib/dataService.ts`

- Imports the new enums from `prisma/generated/client`
- `createActivity` / `updateActivity`: use `ActivityType.WORKSHOP`, `ActivityStatus.OPEN`, etc.
- `createProduct`: `ProductCategory.ROBOTICS`
- `createUser` / `updateUser`: `Role.USER` default, `Role.ADMIN` for bootstrap
- `registerForActivity`: Prisma `where: { status: { not: ActivityStatus.CLOSED } }`
- `confirmKnowledge`: `KnowledgeStatus.CONFIRMED` / `KnowledgeStatus.REJECTED`
- Drop `(data.status as any)` smell
- `getKnowledgeList` filter interface: `status?: KnowledgeStatus`

### `prisma/seed.ts`

- Use enum values in user / activity / product / knowledge upserts
- Existing JSON files keep their lowercase values — they serialize fine to the enum column

### API handlers

- `pages/api/auth/login.ts` — `Role.ADMIN`, `Role.USER`
- `pages/api/auth/register.ts` — `Role.USER`
- `pages/api/auth/[...nextauth].ts` — `(session.user as any).role = dbUser?.role ?? Role.USER`
- `pages/api/users/index.ts` — guard compares `session?.user?.role === Role.ADMIN`
- `pages/api/users/[id].ts` — same
- `pages/api/knowledge/index.ts` — defaults `KnowledgeStatus.PENDING`, `KnowledgeCategory.ENGINEERING`

### Admin GUI

- **`UsersTab.tsx`** — derive `ROLE_OPTIONS` from `Role` enum; `<select value={Role.USER}>` etc.; badge ternary switches on `Role.ADMIN` / `Role.AUTHOR` / `Role.USER`
- **`ActivityForm.tsx`** — derive `TYPE_OPTIONS` / `STATUS_OPTIONS` from enums; use enum members as initial state
- **`ActivitiesTab.tsx`** — derive filter pills from enum (drop case-insensitive compare)
- **`ProductForm.tsx`** — derive `CATEGORY_OPTIONS` from enum
- **`ProductsTab.tsx`** — drop orphan `'Software'` pill; derive from enum
- **`CommonKnowledgeTab.tsx`** — derive `CATEGORIES` from enum; submission / confirm / reject payloads use enum; counters and badge ternary compare against enum

### Public pages

- **`pages/admin/index.tsx`** — `if (user.role === Role.ADMIN)`, `isAdmin = currentUser?.role === Role.ADMIN`
- **`pages/admin/activities/new.tsx`, `[slug].tsx`** — `user.role !== Role.ADMIN`
- **`pages/about.tsx`** — `u.role === Role.ADMIN || u.role === Role.AUTHOR` filter; badge color/label switch on enum
- **`pages/index.tsx`** — `activityTypeColor()` / `categoryColor()` become `switch (activity.type)` over enum; `activity.status === ActivityStatus.FULL` for "Full" badge
- **`pages/login.tsx`** — `existingUser.role === Role.ADMIN` compare; badge switch on enum
- **`pages/common-knowledge/index.tsx`** — SSR fetch uses `KnowledgeStatus.CONFIRMED`; `typeColor()` becomes enum switch; `act.type === selectedType` filter compares enum
- **`pages/common-knowledge/[slug].tsx`** — optimistic update uses `ActivityStatus.OPEN` / `ActivityStatus.FULL`; `typeColor` switch on enum
- **`pages/products/index.tsx`** — `categoryColor()` switch on enum; filter compares enum

### Swagger spec

- Update `lib/swaggerSpec.ts` `User.role`, `Activity.type`, `Activity.status`, `Product.category`, `Knowledge.category`, `Knowledge.status` schemas to declare `enum: [...]` matching the new PG enum members — no longer just `string`

## Verification

1. `npm run typecheck` — must pass (this is the primary check; the enum types propagate everywhere)
2. `npx prisma migrate dev --name schema_hardening` — apply against a dev DB; verify the enum cast backfills existing rows
3. `npm run build` — must pass
4. Smoke test: log in as admin, exercise each admin tab (Users, Activities, Products, Knowledge); verify dropdowns still work and badges render with the right colors
5. Public smoke test: home page, /products, /common-knowledge, /about — verify activity type / product category / role badges still display correctly

## Out of scope

- Renaming snake_case fields in `Account` (cosmetic)
- Implementing view-tracking for `Knowledge` (now removed)
- Seeding `knowledge.json` / `registrations.json` (separate cleanup task)

---

# Phase 2 — `predev` script in `package.json`

## Context

Right now `npm run dev` invokes `next` raw. The team needs `predev` so that when a developer runs `dev` (or `build`), the local environment is reproducible: Prisma client must be regenerated after schema changes, and `.env` must exist before Prisma can read `DATABASE_URL`. The design decisions captured via questions:

| Decision | Choice |
|---|---|
| `predev` purpose | Prep dev env: regen Prisma client + ensure `.env` exists |
| `.env` bootstrap | **Copy `prisma/.env.example` → `.env` only if `.env` is missing** (do not overwrite user's edits) |
| DB touch | **Ping the DB** (via `prisma db execute` or TCP) — warn if unreachable, do not abort |
| Shell | **Cross-platform Node script** (Windows + Linux + macOS safe) |

## Files

| File | Action |
|---|---|
| `package.json` | add `"predev"` and `"prebuild"` scripts |
| `scripts/dev-prep.js` (new) | cross-platform Node script that runs the prep steps |

## `predev` behavior

`scripts/dev-prep.js` performs these steps in order, with clear stdout output for each:

1. **Ensure `.env` exists**
   - If `.env` exists → log "`.env` present, skipping copy" and continue
   - Else copy `.env.example` → `.env` and log: `Created .env from .env.example. Fill in secrets before running.`

2. **Generate Prisma client**
   - Run `prisma generate` (already script-aliased as `npm run db:generate`)
   - Fail fast with a non-zero exit code if generation fails

3. **Ping DB connectivity** (warning, not failure)
   - Read `DATABASE_URL` from `.env`
   - Use Node's built-in `net` module + manual Postgres protocol probe OR shell out to `npx prisma db execute --stdin --url "$DATABASE_URL" --schema prisma/schema.prisma <<< "SELECT 1"` with a 5-second timeout
   - If reachable → log `"DATABASE_URL ... reachable"`
   - If unreachable → log yellow warning `"DATABASE_URL unreachable — DB will be required at runtime (db:up + db:migrate if needed)"`, continue with exit 0

4. **Exit 0** unless step 2 fails

## `package.json` changes

```json
"scripts": {
  "dev": "next",
  "predev": "node scripts/dev-prep.js",
  "build": "prisma generate && next build",
  "prebuild": "node scripts/dev-prep.js --build",
  ...
}
```

`prebuild` re-uses the same Node script with a `--build` flag — at build time we suppress the DB ping (Vercel/CI may not have DB; only enforce the `.env` + Prisma generate steps). The same script toggles behavior via the `argv[2]` flag.

## `scripts/dev-prep.js` skeleton

```js
#!/usr/bin/env node
import { existsSync, copyFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { config as loadEnv } from 'dotenv';
import { Client as PgClient } from 'pg';

const isBuild = process.argv[2] === '--build';
const log = (icon, msg) => console.log(`${icon} ${msg}`);

function ensureEnv() {
  if (existsSync('.env')) { log('✓', '.env present'); return; }
  if (!existsSync('.env.example')) {
    log('✗', '.env.example missing; cannot bootstrap .env');
    process.exit(1);
  }
  copyFileSync('.env.example', '.env');
  log('⚠', 'Created .env from .env.example. Edit before running.');
}

function generatePrisma() {
  log('→', 'prisma generate');
  const r = spawnSync('npx', ['prisma', 'generate'], { stdio: 'inherit' });
  if (r.status !== 0) process.exit(r.status ?? 1);
}

async function pingDb() {
  if (isBuild) return;
  loadEnv();
  const url = process.env.DATABASE_URL;
  if (!url) { log('⚠', 'DATABASE_URL not set; skipping DB ping'); return; }
  const c = new PgClient({ connectionString: url, connectionTimeoutMillis: 3000 });
  try {
    await c.connect();
    await c.query('SELECT 1');
    await c.end();
    log('✓', 'Database reachable');
  } catch (e) {
    log('⚠', `Database unreachable: ${e.message} — run db:up before relying on it`);
  }
}

(async () => {
  ensureEnv();
  generatePrisma();
  await pingDb();
  log('✓', 'Predev complete');
})();
```

`pg` is added to `package.json` devDependencies (small price; already pinned Postgres in docker-compose).

## Verification

1. `node scripts/dev-prep.js` runs cleanly on Windows PowerShell + bash
2. With `.env` absent → it creates one from `.env.example`
3. With `.env` already present → it does not touch it
4. With DB down → exits 0 but prints a warning
5. With DB up → logs "Database reachable"
6. `npm run dev` triggers `predev` automatically and proceeds to `next`
7. `npm run build` triggers `prebuild`, regenerates client, and exits early if `.env` is missing