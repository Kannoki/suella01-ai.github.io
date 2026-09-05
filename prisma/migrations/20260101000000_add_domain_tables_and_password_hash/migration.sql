-- Migration: Add custom domain tables (Activity, Registration, Product, CarouselSlide,
-- ContactInfo, ContactMessage, Knowledge) and the password_hash column on users.
--
-- This migration captures all the schema additions that were made after the original
-- Prisma starter `init` migration. Previously these tables were created implicitly via
-- `prisma db push --accept-data-loss` in docker-compose, which is unsafe for production.
-- Run with `npx prisma migrate deploy`.

-- 1. Add password_hash column to users (for credentials login + bcrypt)
ALTER TABLE "users" ADD COLUMN "password_hash" TEXT;

-- 2. Create activities table
CREATE TABLE "activities" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'Workshop',
    "date" TEXT NOT NULL,
    "time" TEXT,
    "location" TEXT,
    "description" TEXT NOT NULL,
    "content" TEXT,
    "image" TEXT,
    "seats" INTEGER NOT NULL DEFAULT 0,
    "registered" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'open',
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activities_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "activities_slug_key" ON "activities"("slug");
CREATE INDEX "activities_status_idx" ON "activities"("status");
CREATE INDEX "activities_featured_idx" ON "activities"("featured");

-- 3. Create registrations table
CREATE TABLE "registrations" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "address" TEXT,
    "notes" TEXT,
    "activity_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "registrations_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "registrations_activity_id_idx" ON "registrations"("activity_id");
CREATE INDEX "registrations_email_idx" ON "registrations"("email");
ALTER TABLE "registrations" ADD CONSTRAINT "registrations_activity_id_fkey"
    FOREIGN KEY ("activity_id") REFERENCES "activities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- 4. Create products table
CREATE TABLE "products" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'Robotics',
    "description" TEXT NOT NULL,
    "content" TEXT,
    "image" TEXT,
    "github" TEXT,
    "demo" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "products_slug_key" ON "products"("slug");
CREATE INDEX "products_category_idx" ON "products"("category");
CREATE INDEX "products_featured_idx" ON "products"("featured");

-- 5. Create carousel_slides table
CREATE TABLE "carousel_slides" (
    "id" TEXT NOT NULL,
    "src" TEXT NOT NULL,
    "alt" TEXT,
    "title" TEXT,
    "subtitle" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "carousel_slides_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "carousel_slides_active_idx" ON "carousel_slides"("active");
CREATE INDEX "carousel_slides_order_idx" ON "carousel_slides"("order");

-- 6. Create contact_info table
CREATE TABLE "contact_info" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tagline" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "address" TEXT,
    "about" TEXT,
    "facebook" TEXT,
    "youtube" TEXT,
    "github" TEXT,
    "instagram" TEXT,
    "linkedin" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contact_info_pkey" PRIMARY KEY ("id")
);

-- 7. Create contact_messages table
CREATE TABLE "contact_messages" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "subject" TEXT,
    "message" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contact_messages_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "contact_messages_read_idx" ON "contact_messages"("read");
CREATE INDEX "contact_messages_created_at_idx" ON "contact_messages"("created_at");

-- 8. Create common_knowledge table
CREATE TABLE "common_knowledge" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'Engineering',
    "summary" TEXT,
    "content" TEXT NOT NULL,
    "image" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "confirmed" BOOLEAN NOT NULL DEFAULT false,
    "author_id" TEXT,
    "author_name" TEXT,
    "author_email" TEXT,
    "author_image" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "views" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "common_knowledge_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "common_knowledge_slug_key" ON "common_knowledge"("slug");
CREATE INDEX "common_knowledge_status_idx" ON "common_knowledge"("status");
CREATE INDEX "common_knowledge_confirmed_idx" ON "common_knowledge"("confirmed");
CREATE INDEX "common_knowledge_author_id_idx" ON "common_knowledge"("author_id");
