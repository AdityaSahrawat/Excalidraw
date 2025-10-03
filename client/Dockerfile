FROM node:20-alpine3.20 AS base
WORKDIR /app
RUN apk add --no-cache libc6-compat

FROM base AS deps
RUN corepack enable && corepack prepare pnpm@9.15.3 --activate
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

FROM base AS builder
ENV NEXT_TELEMETRY_DISABLED=1
ARG NEXT_PUBLIC_BACKEND_URL
ARG NEXT_PUBLIC_WsURL
ARG NEXTAUTH_URL
ARG NEXTAUTH_SECRET
ARG google_clientId
ARG google_clientSecret
ENV NEXT_PUBLIC_BACKEND_URL=$NEXT_PUBLIC_BACKEND_URL
ENV NEXT_PUBLIC_WsURL=$NEXT_PUBLIC_WsURL
ENV NEXTAUTH_URL=$NEXTAUTH_URL
ENV NEXTAUTH_SECRET=$NEXTAUTH_SECRET
ENV google_clientId=$google_clientId
ENV google_clientSecret=$google_clientSecret
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN corepack enable && corepack prepare pnpm@9.15.3 --activate && pnpm build

FROM base AS runner
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ARG NEXTAUTH_URL
ARG NEXTAUTH_SECRET
ARG google_clientId
ARG google_clientSecret
ENV NEXTAUTH_URL=$NEXTAUTH_URL
ENV NEXTAUTH_SECRET=$NEXTAUTH_SECRET
ENV google_clientId=$google_clientId
ENV google_clientSecret=$google_clientSecret

RUN addgroup -S nextjs && adduser -S nextjs -G nextjs
USER nextjs

WORKDIR /app

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/.next/BUILD_ID ./.next/BUILD_ID

EXPOSE 3000

CMD ["node", "server.js"]
