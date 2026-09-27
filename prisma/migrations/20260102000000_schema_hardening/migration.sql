-- Migration: Schema hardening — enums, indexes, dead code removal
--
-- This migration makes three categories of changes:
--   1. Convert free-form String columns to typed enums (preserves existing values).
--   2. Add indexes that exist in the previous migration but were not declared in schema.prisma.
--   3. Drop the dead Post table and User.posts relation, drop unused Knowledge.views,
--      and add @updatedAt timestamps to Registration / ContactMessage.

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. Create enum types
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TYPE "Role" AS ENUM ('admin', 'author', 'user');
CREATE TYPE "ActivityType" AS ENUM ('Workshop', 'Challenge', 'Masterclass', 'Panel');
CREATE TYPE "ActivityStatus" AS ENUM ('open', 'full', 'closed');
CREATE TYPE "ProductCategory" AS ENUM ('Robotics', 'Knowledge', 'IoT', 'Mechatronics');
CREATE TYPE "KnowledgeCategory" AS ENUM (
  'Robotics',
  'Mechanics',
  'Engineering',
  'AI & Vision',
  'IoT & Hardware',
  'Programming',
  'General'
);
CREATE TYPE "KnowledgeStatus" AS ENUM ('pending', 'confirmed', 'rejected');

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. Convert columns to native enums (backfill from existing text values)
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE "users"
  ALTER COLUMN "role" TYPE "Role" USING "role"::"Role";

ALTER TABLE "activities"
  ALTER COLUMN "type"   TYPE "ActivityType"   USING "type"::"ActivityType",
  ALTER COLUMN "status" TYPE "ActivityStatus" USING "status"::"ActivityStatus";

ALTER TABLE "products"
  ALTER COLUMN "category" TYPE "ProductCategory" USING "category"::"ProductCategory";

ALTER TABLE "common_knowledge"
  ALTER COLUMN "category" TYPE "KnowledgeCategory" USING "category"::"KnowledgeCategory",
  ALTER COLUMN "status"   TYPE "KnowledgeStatus"   USING "status"::"KnowledgeStatus";

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. New fields
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE "activities"        ADD COLUMN "tags"        TEXT[]      NOT NULL DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "registrations"     ADD COLUMN "updated_at"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "contact_messages"  ADD COLUMN "updated_at"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. Drop dead / unused schema
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE "common_knowledge" DROP COLUMN "views";
DROP TABLE IF EXISTS "posts";

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. Add missing indexes (idempotent)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS "activities_status_created_at_idx" ON "activities" ("status", "created_at");
CREATE INDEX IF NOT EXISTS "activities_created_at_idx"        ON "activities" ("created_at");
CREATE INDEX IF NOT EXISTS "products_created_at_idx"          ON "products" ("created_at");
CREATE INDEX IF NOT EXISTS "users_created_at_idx"             ON "users" ("created_at");
CREATE INDEX IF NOT EXISTS "registrations_created_at_idx"     ON "registrations" ("created_at");
CREATE INDEX IF NOT EXISTS "knowledge_status_created_at_idx"  ON "common_knowledge" ("status", "created_at");

-- ─────────────────────────────────────────────────────────────────────────────
-- 6. Reconcile cascade FK on Registration.activity
-- ─────────────────────────────────────────────────────────────────────────────
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'registrations_activity_id_fkey'
  ) THEN
    ALTER TABLE "registrations"
      ADD CONSTRAINT "registrations_activity_id_fkey"
      FOREIGN KEY ("activity_id") REFERENCES "activities"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
