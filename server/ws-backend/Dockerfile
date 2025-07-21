FROM node:20-alpine AS base

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@9.15.3 --activate

# Copy workspace manifests and configs
COPY ./pnpm-workspace.yaml ./
COPY ./package.json ./
COPY ./pnpm-lock.yaml ./
COPY ./tsconfig.prod.json ./tsconfig.prod.json
COPY ./tsconfig.json ./tsconfig.json
COPY ./database/package.json ./database/
COPY ./ws-backend/package.json ./ws-backend/

# Install dependencies
RUN pnpm install --frozen-lockfile --shamefully-hoist

# Copy source code
COPY ./database ./database
COPY ./ws-backend ./ws-backend

# Generate Prisma client
RUN pnpm --filter database exec prisma generate

# Build database and ws-backend
RUN pnpm --filter database build --force
RUN pnpm --filter ws-backend build --force

# --- Final runtime image ---
FROM node:20-alpine

WORKDIR /app

# Copy built output and dependencies
COPY --from=base /app/database/dist ./database/dist
COPY --from=base /app/ws-backend/dist ./dist
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/ws-backend/package.json ./
COPY --from=base /app/tsconfig.prod.json ./tsconfig.json

# Run the built app with path alias support
CMD ["node", "-r", "tsconfig-paths/register", "dist/index.js"]
