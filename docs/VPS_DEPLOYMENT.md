# VPS Deployment Guide (AI Context)

**IMPORTANT CONTEXT FOR AI ASSISTANTS:**
This Next.js + Prisma project is deployed to a small VPS with **1 vCPU and 1 GB of RAM**. 

⚠️ **CRITICAL CONSTRAINT:** Because of the 1 GB RAM limitation, running the standard `npm run build` command directly on the VPS will typically crash with an **Out Of Memory (OOM)** error during the Next.js compilation phase.

To successfully deploy or update the project on this server, future AI assistants should follow one of the two strategies below.

---

## Strategy 1: Build Locally & Transfer (Recommended)
Do not build on the VPS. Build the project on the local machine and transfer the compiled artifacts to the server.

### 1. Build Locally
Run the following on the developer's PC:
```bash
npm install
npm run build
```

### 2. Transfer Artifacts
Transfer **only** the following files/folders to the VPS (using scp, rsync, or SFTP):
- `/.next/` (The production build)
- `/public/` (Static assets)
- `/prisma/` (Database schema)
- `package.json` & `package-lock.json`
- `docker-compose.yml`
- `.env` (Ensure `DATABASE_URL` and `NEXTAUTH_URL` are configured for production)

*Do NOT transfer `node_modules` (it must be compiled for the Linux VPS environment).*

### 3. VPS Setup & Run
On the VPS, navigate to the project directory and run:
```bash
# 1. Start the PostgreSQL database
docker compose up -d

# 2. Install production dependencies only
npm install --omit=dev

# 3. Generate Prisma client & sync database
npx prisma generate
npx prisma db push

# 4. Start the application (Use PM2 for background process management)
npm run start
# Or using PM2: pm2 start npm --name "hello-next" -- start
```

---

## Strategy 2: Build on VPS using Swap Space
If the developer requests a direct deployment/build on the VPS (e.g., via a CI/CD pipeline or git pull), you **must** ensure a Swap file is active before running `npm run build`.

### 1. Create a 2GB Swap File (Run on VPS)
```bash
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

### 2. Build and Run
```bash
docker compose up -d
npm install
npm run build
npx prisma db push
npm run start
```
