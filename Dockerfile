# ─── Stage 1: deps ─────────────────────────────────────────────────────────
FROM node:20-alpine AS deps
WORKDIR /app

# Copy dependency manifests only (for better Docker layer caching)
COPY package.json package-lock.json ./

# Install all deps (including devDependencies needed for build)
RUN npm ci --ignore-scripts

# ─── Stage 2: build ────────────────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Prisma: generate client from schema before building Next.js
RUN npx prisma generate

# Build the Next.js production bundle
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ─── Stage 3: runner (production image) ────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create a non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser  --system --uid 1001 nextjs

# Copy only what Next.js needs at runtime
COPY --from=builder /app/public           ./public
COPY --from=builder /app/prisma           ./prisma
COPY --from=builder /app/data             ./data
COPY --from=builder /app/package.json     ./package.json

# Copy the standalone output + static assets produced by next build
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static     ./.next/static

# Prisma client must be present at runtime, since standalone output only includes app code.
# Generated client lives at node_modules/@prisma/client and node_modules/.prisma/client (or
# node_modules/prisma/generated for newer versions). Copy both to be safe across versions.
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma

USER nextjs

EXPOSE 3000

# next start serves the standalone bundle
CMD ["node", "server.js"]
