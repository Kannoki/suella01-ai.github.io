# Complete Deployment Guide — MechGirl STEM Portal

A comprehensive guide for deploying the **MechGirl STEM Portal** to production across multiple platforms (**Vercel**, **Self-Hosted VPS with Docker/PM2**, and **Firebase**).

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Prerequisites & Environment Variables](#2-prerequisites--environment-variables)
3. [Firebase Project Setup & Security Rules](#3-firebase-project-setup--security-rules)
4. [Database Migration & Initial Seeding](#4-database-migration--initial-seeding)
5. [Deployment Method A: Vercel (Recommended)](#5-deployment-method-a-vercel-recommended)
6. [Deployment Method B: Self-Hosted VPS (Docker & Nginx)](#6-deployment-method-b-self-hosted-vps-docker--nginx)
7. [Deployment Method C: Self-Hosted VPS (Node.js & PM2)](#7-deployment-method-c-self-hosted-vps-nodejs--pm2)
8. [Initial Admin Bootstrapping & Verification](#8-initial-admin-bootstrapping--verification)
9. [Operations, Monitoring & Maintenance](#9-operations-monitoring--maintenance)
10. [Troubleshooting & Common Issues](#10-troubleshooting--common-issues)

---

## 1. Architecture Overview

MechGirl STEM Portal is a fullstack application powered by Next.js and Firebase:

```mermaid
graph TD
    Client["User Browser / Client"]
    Vercel["Next.js Application<br/>(Vercel / Docker / Node.js)"]
    Auth["NextAuth.js<br/>(JWT + Session Handler)"]
    DataService["lib/dataService.ts<br/>(Server Data Layer)"]
    FStore[("Cloud Firestore<br/>(NoSQL Database)")]
    FAdmin["Firebase Admin SDK<br/>(Privileged Service Account)"]
    FAuth["Firebase Auth<br/>(ID Token Verification)"]

    Client -->|"HTTPS / Pages & Assets"| Vercel
    Client -->|"Direct Client Queries (Optional)"| FStore
    Vercel --> Auth
    Vercel --> DataService
    DataService --> FAdmin
    FAdmin -->|"Read / Write"| FStore
    Auth --> FAdmin
    Auth --> FAuth
```

### Key Components

- **Frontend:** Next.js 14 (Pages Router) + React 18 + Tailwind CSS + Framer Motion.
- **Backend / APIs:** Next.js Serverless API routes (`pages/api/*`).
- **Database:** Google Cloud Firestore (collections: `activities`, `products`, `knowledge`, `users`, `registrations`, `contact_info`, `carousel_slides`).
- **Authentication:** NextAuth.js (`@next-auth/firebase-adapter` + Credentials Provider + Firebase ID Token verification in `lib/auth.ts`).
- **Security:** Cloud Firestore Rules (`firestore.rules`) protect direct client access; server-side APIs use Firebase Admin SDK with Service Account credentials.

---

## 2. Prerequisites & Environment Variables

### Environment Variables Reference

| Variable | Scope | Required | Description | Example |
|---|---|---|---|---|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Public (Browser) | Yes | Firebase Web App API Key | `AIzaSyC45sfHg486IiYT...` |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Public (Browser) | Yes | Firebase Auth domain | `project-id.firebaseapp.com` |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Public (Browser) | Yes | Google Cloud / Firebase Project ID | `project-id` |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Public (Browser) | Yes | Storage bucket URL | `project-id.firebasestorage.app` |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Public (Browser) | Yes | FCM sender ID | `571960662294` |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Public (Browser) | Yes | Firebase Web App ID | `1:571960662294:web:...` |
| `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` | Public (Browser) | No | Google Analytics measurement ID | `G-MPXPS1ZCBF` |
| `FIREBASE_ADMIN_PROJECT_ID` | Server Only | Yes | Firebase Project ID for Admin SDK | `project-id` |
| `FIREBASE_ADMIN_CLIENT_EMAIL` | Server Only | Yes | Service Account client email | `firebase-adminsdk-xxx@...` |
| `FIREBASE_ADMIN_PRIVATE_KEY` | Server Only | Yes | Service Account Private Key | `"-----BEGIN PRIVATE KEY-----\nMIIE..."` |
| `NEXTAUTH_URL` | Server Only | Yes | Canonical public URL of your app | `https://yourdomain.com` |
| `NEXTAUTH_SECRET` | Server Only | Yes | Random 32+ char string for JWT signing | `openssl rand -base64 32` |
| `ADMIN_API_KEY` | Server Only | Yes | Secret token for header/Bearer auth | `openssl rand -hex 32` |
| `ADMIN_BOOTSTRAP_PASSWORD` | Server Only | Temporary | One-time password to create first admin | `StrongPassword123!` |
| `GITHUB_ID` | Server Only | Optional | GitHub OAuth Client ID | `Ov23li...` |
| `GITHUB_SECRET` | Server Only | Optional | GitHub OAuth Client Secret | `47382...` |

---

## 3. Firebase Project Setup & Security Rules

### Step 3.1: Create Firebase Project
1. Navigate to the [Firebase Console](https://console.firebase.google.com/).
2. Click **Add project** (or select your existing project).
3. Name your project (e.g., `mechgirl-stem-portal`).
4. Enable or disable Google Analytics as desired, then click **Create project**.

### Step 3.2: Enable Cloud Firestore
1. In the Firebase Console left sidebar, click **Build** → **Firestore Database**.
2. Click **Create database**.
3. Choose your database location (select a region closest to your users, e.g., `asia-southeast1` or `us-central1`).
4. Choose **Start in production mode** (rules will be deployed in Step 3.5).

### Step 3.3: Register Web App
1. Go to **Project Overview** (gear icon) → **Project settings**.
2. In the **General** tab, scroll to **Your apps** and click the **Web** icon (`</>`).
3. Enter an app nickname (e.g. `mechgirl-web`).
4. Copy the `firebaseConfig` properties into your `.env` as `NEXT_PUBLIC_FIREBASE_*`.

### Step 3.4: Generate Service Account Key (Firebase Admin)
1. In **Project settings**, click the **Service accounts** tab.
2. Select **Firebase Admin SDK**.
3. Ensure **Node.js** is selected.
4. Click **Generate new private key**, then click **Generate key** in the confirmation modal.
5. A JSON file will download (e.g., `project-id-firebase-adminsdk-xxxxx.json`).
6. From this JSON file, copy:
   - `project_id` → `FIREBASE_ADMIN_PROJECT_ID`
   - `client_email` → `FIREBASE_ADMIN_CLIENT_EMAIL`
   - `private_key` → `FIREBASE_ADMIN_PRIVATE_KEY`

### Step 3.5: Deploy Firestore Security Rules
The repository contains `firestore.rules` ready for deployment:

#### Method 1: Using Firebase CLI
```bash
npm install -g firebase-tools
firebase login
firebase use --add <your-project-id>
firebase deploy --only firestore:rules
```

#### Method 2: Via Firebase Console UI
1. Go to **Firestore Database** → **Rules** tab.
2. Replace the editor contents with the code inside [`firestore.rules`](file:///c:/Code/suella01-ai.github.io/firestore.rules).
3. Click **Publish**.

---

## 4. Database Migration & Initial Seeding

Before or immediately after deploying the frontend, populate Firestore with the initial seed data (`data/seeds/*.json`):

```bash
# 1. Ensure your local .env has valid FIREBASE_ADMIN_* credentials
cp .env.example .env
# Edit .env with your real Firebase Admin credentials

# 2. Run the migration script
npm run db:migrate
```

### What this script does:
- Bulk uploads default `activities` (Workshops, Challenges, Masterclasses).
- Uploads default `products` (Robotics kits, IoT hardware, tutorials).
- Uploads `carousel_slides` for the homepage hero carousel.
- Creates default `users` and `knowledge` base articles.
- Seeds the `contact_info` singleton document (`contact_info/main`).

Open **Firestore Database** → **Data** in the Firebase Console to confirm that the collections are populated.

---

## 5. Deployment Method A: Vercel (Recommended)

Vercel provides native support for Next.js with automatic global CDN caching, Instant Static Generation (ISR), and serverless execution.

### Step 5.1: Push Repository to GitHub
Ensure all changes are committed and pushed to your GitHub repository:
```bash
git add .
git commit -m "feat: configure Firebase production build"
git push origin main
```

### Step 5.2: Import Project in Vercel
1. Log in to [Vercel](https://vercel.com).
2. Click **Add New...** → **Project**.
3. Select your GitHub repository (`suella01-ai.github.io` or your custom repo name).
4. Configure Project:
   - **Framework Preset:** `Next.js`
   - **Root Directory:** `./`
   - **Build Command:** `npm run build`
   - **Output Directory:** `.next`
   - **Install Command:** `npm install`

### Step 5.3: Configure Environment Variables in Vercel
In the **Environment Variables** section, add each variable for **Production**, **Preview**, and **Development**:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyC45sfHg486IiYTcEFEY_FXq4j2m53Xzlc
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=test-noffication.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=test-noffication
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=test-noffication.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=571960662294
NEXT_PUBLIC_FIREBASE_APP_ID=1:571960662294:web:59fae39b9ba730793c5837
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-MPXPS1ZCBF

FIREBASE_ADMIN_PROJECT_ID=test-noffication
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-xxxxx@test-noffication.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

NEXTAUTH_URL=https://your-custom-domain.vercel.app
NEXTAUTH_SECRET=generate_with_openssl_rand_base64_32
ADMIN_API_KEY=generate_with_openssl_rand_hex_32
ADMIN_BOOTSTRAP_PASSWORD=temporary_strong_bootstrap_password
```

> [!IMPORTANT]
> **Private Key Newlines in Vercel:**
> When pasting `FIREBASE_ADMIN_PRIVATE_KEY`, you can paste either the raw multiline string directly from the downloaded JSON file or keep the escaped `\n` characters. Our initialization helper in `lib/firebaseAdmin.ts` automatically converts `\n` to real line breaks.

### Step 5.4: Deploy & Verify
1. Click **Deploy**.
2. Vercel will run `npm run build`, bundle static pages, and deploy serverless functions.
3. Once finished, visit your live `.vercel.app` URL.

### Step 5.5: Connect Custom Domain
1. In Vercel Project Settings, go to **Domains**.
2. Add your custom domain (e.g. `mechgirl.org`).
3. Add the DNS records (`CNAME` or `A` record) shown by Vercel at your domain registrar.
4. Update `NEXTAUTH_URL` in Vercel Environment Variables to `https://mechgirl.org` and trigger a Redeploy.

---

## 6. Deployment Method B: Self-Hosted VPS (Docker & Nginx)

Ideal for hosting on DigitalOcean, Linode, AWS EC2, or Hetzner.

### Step 6.1: Server Setup (Ubuntu 22.04 / 24.04 LTS)

Connect to your VPS via SSH:
```bash
ssh root@your-vps-ip
```

Install Docker and Docker Compose:
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y docker.io docker-compose-plugin git
sudo systemctl enable --now docker
```

Configure Swap Space (Critical for 1 GB RAM servers):
```bash
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

### Step 6.2: Clone Project & Set Production `.env`
```bash
sudo mkdir -p /var/www/mechgirl
cd /var/www/mechgirl
git clone https://github.com/suella01-ai/suella01-ai.github.io.git .

# Copy production env template
cp .env.production.example .env
nano .env
```
Fill in your production domain (`NEXTAUTH_URL=https://yourdomain.com`), secrets, and Firebase credentials.

### Step 6.3: Build & Run with Docker Compose
```bash
docker compose up -d --build
```

Verify containers are running:
```bash
docker compose ps
```

You should see:
- `mechgirl-web` running on port 3000 (internal network).
- `mechgirl-nginx` listening on ports 80 and 443.

### Step 6.4: SSL Certificate with Certbot
Install Certbot on the host:
```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot certonly --webroot -w /var/www/mechgirl/public -d yourdomain.com
```

Uncomment the TLS certificates volume in [`docker-compose.yml`](file:///c:/Code/suella01-ai.github.io/docker-compose.yml) and reload Nginx:
```bash
docker compose restart nginx
```

---

## 7. Deployment Method C: Self-Hosted VPS (Node.js & PM2)

If running directly without Docker:

### Step 7.1: Install Node.js 20 & PM2
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm install -g pm2
```

### Step 7.2: Install Dependencies & Build
```bash
cd /var/www/mechgirl
npm ci
npm run build
```

### Step 7.3: Launch with PM2
```bash
pm2 start npm --name "mechgirl-portal" -- start
pm2 save
pm2 startup
```

### Step 7.4: System Nginx Reverse Proxy
Create `/etc/nginx/sites-available/mechgirl`:
```nginx
server {
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable site and acquire SSL certificate:
```bash
sudo ln -s /etc/nginx/sites-available/mechgirl /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d yourdomain.com
```

---

## 8. Initial Admin Bootstrapping & Verification

Once your deployed instance is live:

### Step 8.1: Create First Admin User
Send an initial HTTP POST request to `/api/auth/login` using your configured `ADMIN_BOOTSTRAP_PASSWORD`:

```bash
curl -X POST https://yourdomain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@yourdomain.com",
    "password": "your_ADMIN_BOOTSTRAP_PASSWORD_value"
  }'
```

**Expected response:**
```json
{
  "message": "Admin user created successfully",
  "user": {
    "id": "...",
    "email": "admin@yourdomain.com",
    "role": "admin"
  }
}
```

### Step 8.2: Verify Admin Dashboard Access
1. Open your browser and navigate to `https://yourdomain.com/login`.
2. Sign in with `admin@yourdomain.com` and your password.
3. Navigate to `https://yourdomain.com/admin`.
4. Confirm you can see and manage:
   - Activities & Registrations
   - Products & Projects
   - Knowledge Base & Submissions
   - Hero Carousel slides
   - User roles & Permissions
   - Contact settings

### Step 8.3: Remove Bootstrap Password
For security, once your primary admin account exists:
1. Remove or comment out `ADMIN_BOOTSTRAP_PASSWORD` in your production `.env` (or Vercel dashboard).
2. Restart or redeploy the app.

---

## 9. Operations, Monitoring & Maintenance

### 1. Firestore Automated Backups
Schedule daily backups using Google Cloud CLI:
```bash
gcloud firestore export gs://your-backup-bucket/$(date +%Y-%m-%d) --project=test-noffication
```

### 2. Updating / Redeploying New Versions
- **On Vercel:** Simply push code to `main` — Vercel builds and deploys with zero downtime.
- **On VPS Docker:**
  ```bash
  cd /var/www/mechgirl
  git pull origin main
  docker compose up -d --build
  ```
- **On VPS PM2:**
  ```bash
  cd /var/www/mechgirl
  git pull origin main
  npm ci
  npm run build
  pm2 reload mechgirl-portal
  ```

### 3. Interactive API Documentation
Your production deployment exposes an OpenAPI/Swagger UI at:
`https://yourdomain.com/docs`

---

## 10. Troubleshooting & Common Issues

### Issue 1: `FIREBASE_ADMIN_PRIVATE_KEY is not set in environment variables`
- **Cause:** The server process did not find `FIREBASE_ADMIN_PRIVATE_KEY`.
- **Fix:** Verify variable name in your host dashboard or `.env`. Ensure there are no trailing spaces or misspellings.

### Issue 2: `error:0909006C:PEM routines:get_name:no start line`
- **Cause:** The private key string is formatted improperly (missing `-----BEGIN PRIVATE KEY-----` header, or newlines collapsed into single lines without escape characters).
- **Fix:** In `.env`, wrap the private key in double quotes and ensure `\n` is preserved:
  ```env
  FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC..."
  ```

### Issue 3: `NextAuth: CLIENT_FETCH_ERROR` or OAuth redirect mismatch
- **Cause:** `NEXTAUTH_URL` is set to `http://localhost:3000` instead of the public production HTTPS URL.
- **Fix:** Set `NEXTAUTH_URL=https://yourdomain.com`. If using GitHub OAuth, ensure the GitHub OAuth Application callback URL matches `https://yourdomain.com/api/auth/callback/github`.

### Issue 4: `Missing or insufficient permissions` on client Firestore queries
- **Cause:** Security rules have not been published or the user's auth token does not have admin permissions.
- **Fix:** Review `firestore.rules` and verify the user document in the `users` collection has `role: "admin"`.

### Issue 5: VPS Out-of-Memory (OOM) during `npm run build`
- **Cause:** VPS has less than 2 GB RAM and no swap space.
- **Fix:** Configure a 2 GB swap file as shown in [Section 6.1](#step-61-server-setup-ubuntu-2204--2404-lts), or build locally and transfer the `.next` artifacts.
