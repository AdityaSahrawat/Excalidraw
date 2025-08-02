FROM node:20-alpine3.20 AS base

RUN corepack enable && corepack prepare pnpm@8.15.6 --activate

WORKDIR /app

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile

ARG NEXT_PUBLIC_BACKEND_URL
ARG NEXT_PUBLIC_WsURL

ENV NEXT_PUBLIC_BACKEND_URL=$NEXT_PUBLIC_BACKEND_URL
ENV NEXT_PUBLIC_WsURL=$NEXT_PUBLIC_WsURL

COPY . .

RUN pnpm build


FROM node:20-alpine3.20 AS runner

RUN corepack enable && corepack prepare pnpm@8.15.6 --activate

WORKDIR /app

COPY --from=base /app/public ./public
COPY --from=base /app/.next ./.next
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/package.json ./package.json

EXPOSE 3000

CMD ["pnpm", "next", "start"]
