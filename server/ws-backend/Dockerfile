FROM node:20-alpine AS base

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@9.15.3 --activate

COPY ./pnpm-workspace.yaml ./
COPY ./package.json ./
COPY ./pnpm-lock.yaml ./
COPY ./tsconfig.prod.json ./tsconfig.prod.json
COPY ./tsconfig.json ./tsconfig.json
COPY ./database/package.json ./database/
COPY ./ws-backend/package.json ./ws-backend/

RUN pnpm install --frozen-lockfile --shamefully-hoist

COPY ./database ./database
COPY ./ws-backend ./ws-backend

RUN pnpm --filter database exec prisma generate

RUN pnpm --filter database build --force
RUN pnpm --filter ws-backend build --force

FROM node:20-alpine

WORKDIR /app

COPY --from=base /app/database/dist ./database/dist
COPY --from=base /app/ws-backend/dist ./dist
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/ws-backend/package.json ./
COPY --from=base /app/tsconfig.prod.json ./tsconfig.json

CMD ["node", "-r", "tsconfig-paths/register", "dist/index.js"]
