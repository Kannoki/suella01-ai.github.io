/**
 * One-time migration script: reads JSON seed files from data/seeds/ and
 * uploads them to Cloud Firestore using the Firebase Admin SDK.
 *
 * Usage:
 *   npm run db:migrate
 *   (or)
 *   npx tsx scripts/migrate-to-firebase.ts
 *
 * Prerequisites:
 *   - Copy .env.example to .env and fill in FIREBASE_ADMIN_* vars
 *   - Run `npx tsx` (included in devDependencies)
 */

import * as dotenv from 'dotenv';
dotenv.config();

import * as fs from 'fs';
import * as path from 'path';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';

// ── Bootstrap Firebase Admin ──────────────────────────────────────────────────

if (!getApps().length) {
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;
  if (!privateKey || !process.env.FIREBASE_ADMIN_CLIENT_EMAIL || !process.env.FIREBASE_ADMIN_PROJECT_ID) {
    console.error(
      '❌ Missing Firebase Admin env vars.\n' +
        '   Set FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL, FIREBASE_ADMIN_PRIVATE_KEY in .env'
    );
    process.exit(1);
  }
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey: privateKey.replace(/\\n/g, '\n'),
    }),
  });
}

const db = getFirestore();

// ── Helpers ───────────────────────────────────────────────────────────────────

function loadSeed<T>(filename: string): T[] {
  const filePath = path.join(process.cwd(), 'data', 'seeds', filename);
  if (!fs.existsSync(filePath)) {
    console.warn(`  ⚠️  Seed file not found: ${filePath} — skipping`);
    return [];
  }
  return JSON.parse(fs.readFileSync(filePath, 'utf-8')) as T[];
}

async function uploadCollection(collectionName: string, items: any[], idField = 'id') {
  if (items.length === 0) {
    console.log(`  ↩  ${collectionName}: no items to migrate`);
    return;
  }
  const batch = db.batch();
  let count = 0;

  for (const item of items) {
    const id: string = item[idField] || db.collection(collectionName).doc().id;
    const ref = db.collection(collectionName).doc(id);
    // Strip the id field from data payload (it lives in the doc path)
    const { [idField]: _id, ...data } = item;
    batch.set(ref, {
      ...data,
      createdAt: data.createdAt || new Date().toISOString(),
      updatedAt: data.updatedAt || new Date().toISOString(),
    });
    count++;

    // Firestore batches are limited to 500 operations
    if (count % 499 === 0) {
      await batch.commit();
      console.log(`    ✔ Committed ${count} docs to ${collectionName}…`);
    }
  }

  await batch.commit();
  console.log(`  ✅ ${collectionName}: ${count} document(s) migrated`);
}

// ── Migration ─────────────────────────────────────────────────────────────────

async function migrate() {
  console.log('\n🚀 Starting Firebase Firestore migration…\n');

  // Activities
  const activities = loadSeed<any>('activities.json');
  await uploadCollection('activities', activities);

  // Products
  const products = loadSeed<any>('products.json');
  await uploadCollection('products', products);

  // Carousel slides
  const carousel = loadSeed<any>('carousel.json');
  await uploadCollection('carousel_slides', carousel);

  // Users
  const users = loadSeed<any>('users.json');
  await uploadCollection('users', users);

  // Knowledge articles
  const knowledge = loadSeed<any>('knowledge.json');
  await uploadCollection('knowledge', knowledge);

  // Registrations
  const registrations = loadSeed<any>('registrations.json');
  await uploadCollection('registrations', registrations);

  // Contact info — singleton doc
  const contactPath = path.join(process.cwd(), 'data', 'seeds', 'contact.json');
  if (fs.existsSync(contactPath)) {
    const contact = JSON.parse(fs.readFileSync(contactPath, 'utf-8'));
    await db.collection('contact_info').doc('main').set({
      ...contact,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
    console.log('  ✅ contact_info: singleton doc migrated');
  } else {
    console.warn('  ⚠️  data/seeds/contact.json not found — skipping');
  }

  console.log('\n🎉 Migration complete!\n');
}

migrate().catch((err) => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});
