FROM node:20-alpine3.20 AS base

RUN corepack enable && corepack prepare pnpm@8.15.6 --activate

WORKDIR /app

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfil

COPY . .


ARG NEXT_PUBLIC_BackendURL
ARG NEXT_PUBLIC_WsURL
ARG google_clientId
ARG google_clientSecret

ENV NEXT_PUBLIC_BackendURL=${NEXT_PUBLIC_BackendURL}
ENV NEXT_PUBLIC_WsURL=${NEXT_PUBLIC_WsURL}
ENV google_clientId=${google_clientId}
ENV google_clientSecret=${google_clientSecret}

RUN pnpm build

FROM node:20-alpine3.20 AS runner

RUN corepack enable && corepack prepare pnpm@8.15.6 --activate

WORKDIR /app

COPY --from=base /app/public ./public
COPY --from=base /app/.next ./.next
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/package.json ./package.json

# COPY --from=base /app/.env ./.env


EXPOSE 3000

CMD ["pnpm","next" , "start"]
