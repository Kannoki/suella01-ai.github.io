#!/usr/bin/env node
import { existsSync, copyFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { config as loadEnv } from 'dotenv';
import pg from 'pg';
const { Client: PgClient } = pg;

const isBuild = process.argv.includes('--build');
const log = (icon, msg) => console.log(`${icon} ${msg}`);

function ensureEnv() {
  if (existsSync('.env')) {
    log('✓', '.env present');
    return;
  }
  if (existsSync('.env.example')) {
    copyFileSync('.env.example', '.env');
    log('⚠', 'Created .env from .env.example. Edit before running.');
  } else if (existsSync('prisma/.env.example')) {
    copyFileSync('prisma/.env.example', '.env');
    log('⚠', 'Created .env from prisma/.env.example. Edit before running.');
  } else {
    log('✗', '.env.example missing; cannot bootstrap .env');
    process.exit(1);
  }
}

function generatePrisma() {
  log('→', 'prisma generate');
  const npxCmd = process.platform === 'win32' ? 'npx.cmd' : 'npx';
  const r = spawnSync(npxCmd, ['prisma', 'generate'], { stdio: 'inherit', shell: true });
  if (r.status !== 0) {
    log('✗', 'prisma generate failed');
    process.exit(r.status ?? 1);
  }
}

async function pingDb() {
  if (isBuild) return;
  loadEnv();
  const url = process.env.DATABASE_URL;
  if (!url) {
    log('⚠', 'DATABASE_URL not set in environment; skipping DB ping');
    return;
  }
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
  log('✓', 'Dev prep complete');
})();
