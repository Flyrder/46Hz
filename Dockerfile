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
# Emit Prisma 8 Data Contract and TypeScript types
RUN npx prisma contract emit
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

# Copy Prisma CLI and ORM modules for schema synchronization at startup
COPY --from=dependencies --chown=nextjs:nodejs /app/node_modules/prisma ./node_modules/prisma
COPY --from=dependencies --chown=nextjs:nodejs /app/node_modules/@prisma ./node_modules/@prisma

# Copy and set permissions for entrypoint script
COPY --from=builder /app/scripts/docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN tr -d '\r' < /usr/local/bin/docker-entrypoint.sh > /usr/local/bin/docker-entrypoint-clean.sh && \
    mv /usr/local/bin/docker-entrypoint-clean.sh /usr/local/bin/docker-entrypoint.sh && \
    chmod +x /usr/local/bin/docker-entrypoint.sh

USER nextjs
EXPOSE 3000

ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
CMD ["node", "server.js"]
