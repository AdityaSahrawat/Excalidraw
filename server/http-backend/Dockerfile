FROM node:20-alpine AS base

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@9.15.3 --activate

# Copy all workspace manifests and production tsconfig
COPY ./pnpm-workspace.yaml ./
COPY ./package.json ./
COPY ./pnpm-lock.yaml ./
COPY ./tsconfig.prod.json ./tsconfig.prod.json
COPY ./tsconfig.json ./tsconfig.json
COPY ./database/package.json ./database/
COPY ./zod-validation/package.json ./zod-validation/
COPY ./http-backend/package.json ./http-backend/

# Install all dependencies
RUN pnpm install --frozen-lockfile --shamefully-hoist


# Copy source code for all packages
COPY ./database ./database
COPY ./zod-validation ./zod-validation
COPY ./http-backend ./http-backend

RUN pnpm --filter database exec prisma generate
# Build all packages (database, zod-validation, then http-backend)
RUN pnpm --filter database build --force
RUN pnpm --filter zod-validation build --force
RUN pnpm --filter http-backend build --force

# --- Final runtime image ---
FROM node:20-alpine

WORKDIR /app

# Copy built output and dependencies
COPY --from=base /app/database/dist ./database/dist
COPY --from=base /app/zod-validation/dist ./zod-validation/dist
COPY --from=base /app/http-backend/dist ./dist
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/http-backend/package.json ./
COPY --from=base /app/tsconfig.prod.json ./tsconfig.json

# Run the built app with path alias support
CMD ["node", "-r", "tsconfig-paths/register", "dist/index.js"]