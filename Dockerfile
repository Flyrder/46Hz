# Multi-architecture Dockerfile for 46Hz Letterbox
# Supports linux/amd64 and linux/arm64 on Node.js 26
FROM node:26-bookworm-slim AS base
WORKDIR /app

# Install OpenSSL for Prisma multi-arch binary engines
RUN apt-get update -y && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*

# Native build base stage executing on host platform ($BUILDPLATFORM) to avoid emulation overhead and Rust crashes under QEMU
FROM --platform=$BUILDPLATFORM node:26-bookworm-slim AS build-base
WORKDIR /app
RUN apt-get update -y && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*

FROM build-base AS dependencies
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM build-base AS builder
WORKDIR /app
COPY --from=dependencies /app/node_modules ./node_modules
COPY . .
# Generate Prisma Client using side-by-side architecture
RUN npx prisma7 generate
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Create non-root user for security
RUN groupadd -g 1001 nodejs && useradd -u 1001 -g nodejs nextjs

# Copy static assets and standalone build output
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/LICENSE ./LICENSE
COPY --from=builder --chown=nextjs:nodejs /app/THIRD_PARTY_NOTICES.md ./THIRD_PARTY_NOTICES.md
COPY --from=builder --chown=nextjs:nodejs /app/fonts/LICENSE.txt ./fonts/LICENSE.txt
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/prisma.config.ts ./prisma.config.ts
COPY --from=builder --chown=nextjs:nodejs /app/prisma7.config.ts ./prisma7.config.ts
COPY --from=builder --chown=nextjs:nodejs /app/prisma8.config.ts ./prisma8.config.ts

# Copy only required Prisma 7 CLI & engine modules for startup schema sync (excluding ~1.9GB @prisma/composer & studio-core)
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/@prisma/prisma7 ./node_modules/@prisma/prisma7
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/@prisma/engines ./node_modules/@prisma/engines
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/@prisma/engines-version ./node_modules/@prisma/engines-version
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/@prisma/config ./node_modules/@prisma/config
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/@prisma/debug ./node_modules/@prisma/debug
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/@prisma/fetch-engine ./node_modules/@prisma/fetch-engine
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/@prisma/get-platform ./node_modules/@prisma/get-platform

# Copy and set permissions for entrypoint script
COPY --from=builder /app/scripts/docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN tr -d '\r' < /usr/local/bin/docker-entrypoint.sh > /usr/local/bin/docker-entrypoint-clean.sh && \
    mv /usr/local/bin/docker-entrypoint-clean.sh /usr/local/bin/docker-entrypoint.sh && \
    chmod +x /usr/local/bin/docker-entrypoint.sh

USER nextjs
EXPOSE 3000

ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
CMD ["node", "server.js"]
