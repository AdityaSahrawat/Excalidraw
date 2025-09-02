FROM node:20-alpine3.20 AS base
WORKDIR /app
# For better compatibility with native modules
RUN apk add --no-cache libc6-compat

#---------------------
# Install dependencies
#---------------------
FROM base AS deps
RUN corepack enable && corepack prepare pnpm@9.15.3 --activate
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

#-------------
# Build stage
#-------------
FROM base AS builder
ENV NEXT_TELEMETRY_DISABLED=1
ARG NEXT_PUBLIC_BACKEND_URL
ARG NEXT_PUBLIC_WsURL
ENV NEXT_PUBLIC_BACKEND_URL=$NEXT_PUBLIC_BACKEND_URL
ENV NEXT_PUBLIC_WsURL=$NEXT_PUBLIC_WsURL
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN corepack enable && corepack prepare pnpm@9.15.3 --activate && pnpm build

#--------------
# Runtime
#--------------
FROM base AS runner
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Run as non-root user
RUN addgroup -S nextjs && adduser -S nextjs -G nextjs
USER nextjs

WORKDIR /app

# Only copy the minimal runtime output
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/.next/BUILD_ID ./.next/BUILD_ID

EXPOSE 3000

CMD ["node", "server.js"]
