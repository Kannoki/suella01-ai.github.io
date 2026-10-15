#!/usr/bin/env node
import { existsSync, copyFileSync } from 'node:fs';
import { config as loadEnv } from 'dotenv';

const isBuild = process.argv.includes('--build');
const log = (icon, msg) => console.log(`${icon} ${msg}`);

function ensureEnv() {
  if (existsSync('.env') || existsSync('.env.local')) {
    log('✓', 'Environment file present');
    return;
  }
  if (existsSync('.env.example')) {
    copyFileSync('.env.example', '.env');
    log('⚠', 'Created .env from .env.example. Please populate your Firebase credentials before running.');
  } else {
    log('✗', '.env.example missing; cannot bootstrap .env');
    process.exit(1);
  }
}

function checkFirebaseEnv() {
  if (isBuild) return;
  loadEnv();

  const missingClient = [];
  if (!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) missingClient.push('NEXT_PUBLIC_FIREBASE_PROJECT_ID');
  if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY) missingClient.push('NEXT_PUBLIC_FIREBASE_API_KEY');

  if (missingClient.length > 0) {
    log('⚠', `Missing client Firebase vars in .env: ${missingClient.join(', ')}`);
  } else {
    log('✓', 'Firebase client configuration found');
  }

  if (!process.env.FIREBASE_ADMIN_PRIVATE_KEY) {
    log('⚠', 'FIREBASE_ADMIN_PRIVATE_KEY is not set (required for API routes and migrations)');
  }
}

(() => {
  ensureEnv();
  checkFirebaseEnv();
  log('✓', 'Dev prep complete');
})();
