# VPS Deployment Guide (Firebase + Next.js Standalone)

**CONTEXT FOR DEVELOPERS & AI ASSISTANTS:**
This Next.js application uses **Firebase Firestore** as its cloud database and **Firebase Admin SDK** for backend API authentication and data management. It no longer requires a local PostgreSQL database or Prisma migrations.

If deploying to a small VPS with **1 vCPU and 1 GB of RAM**, follow the memory constraints and strategies below.

---

## Prerequisites on VPS

1. **Ubuntu 20.04 / 22.04 / 24.04 LTS**
2. **Node.js 20 LTS** (if running via PM2) or **Docker + Docker Compose**
3. **Domain Name** pointed to your VPS public IP address (A record)

---

## Critical Constraint: 1 GB RAM & Swap Space

Running `next build` on a VPS with only 1 GB of RAM can trigger an **Out of Memory (OOM)** error during compilation. 

Before building directly on a 1 GB VPS, configure a 2 GB Swap file:

```bash
# 1. Check existing swap
sudo swapon --show

# 2. Create 2GB swap file if none exists
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# 3. Make swap permanent across reboots
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

---

## Strategy 1: Docker + Nginx (Recommended Containerized)

The repository includes a production-ready `Dockerfile` and `docker-compose.yml` with Nginx reverse proxy.

### 1. Clone & Configure Environment

```bash
git clone https://github.com/suella01-ai/suella01-ai.github.io.git /var/www/mechgirl
cd /var/www/mechgirl

# Create production environment file
cp .env.production.example .env
nano .env
```

Ensure all variables are populated:
- `NEXT_PUBLIC_FIREBASE_*` (Client SDK configuration)
- `FIREBASE_ADMIN_PROJECT_ID`, `FIREBASE_ADMIN_CLIENT_EMAIL`, `FIREBASE_ADMIN_PRIVATE_KEY`
- `NEXTAUTH_URL=https://yourdomain.com`
- `NEXTAUTH_SECRET=$(openssl rand -base64 32)`
- `ADMIN_API_KEY=$(openssl rand -hex 32)`
- `ADMIN_BOOTSTRAP_PASSWORD=strong_temporary_pass`

### 2. Build and Start Services

```bash
docker compose up -d --build
```

### 3. Check Logs & Status

```bash
docker compose ps
docker compose logs -f web
```

---

## Strategy 2: Direct PM2 + Node.js (Lightest Footprint)

If you prefer running without Docker to conserve every megabyte of RAM:

### 1. Install Node.js 20 & PM2

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
sudo npm install -g pm2
```

### 2. Build Application

```bash
cd /var/www/mechgirl
npm ci --omit=dev=false
npm run build
```

### 3. Start with PM2

```bash
pm2 start npm --name "mechgirl" -- start
pm2 save
pm2 startup
```

### 4. Reverse Proxy via System Nginx & SSL

Install Certbot and Nginx:
```bash
sudo apt install -y nginx certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

---

## Strategy 3: Build Locally & Transfer (Zero Server Build Load)

If your VPS has low CPU/RAM and no swap:

1. **On your local PC:**
   ```bash
   npm ci
   npm run build
   ```

2. **Transfer build artifacts to VPS:**
   ```bash
   rsync -avz --exclude 'node_modules' .next public package.json package-lock.json .env user@your-vps-ip:/var/www/mechgirl/
   ```

3. **On the VPS:**
   ```bash
   cd /var/www/mechgirl
   npm ci --omit=dev
   pm2 restart mechgirl || pm2 start npm --name "mechgirl" -- start
   ```

---

## Post-Deployment: Initial Admin Account

Call the login endpoint once using your `ADMIN_BOOTSTRAP_PASSWORD` to create the first admin:

```bash
curl -X POST https://yourdomain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@yourdomain.com","password":"your_ADMIN_BOOTSTRAP_PASSWORD"}'
```

Once logged in, verify you can access `https://yourdomain.com/admin`, then remove `ADMIN_BOOTSTRAP_PASSWORD` from your `.env` file and reload the app:
```bash
# Docker:
docker compose restart web

# PM2:
pm2 reload mechgirl
```
