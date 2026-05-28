# MkopoFlow Web App — production image for Railway (Vite build + Caddy)
FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@10.11.0 --activate
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/shared ./packages/shared
COPY scripts/ensure-shared.mjs ./scripts/ensure-shared.mjs
RUN pnpm install --frozen-lockfile

FROM base AS build
ARG VITE_API_URL=
ENV VITE_API_URL=${VITE_API_URL}
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages ./packages
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.json tsconfig.node.json vite.config.ts index.html ./
COPY src ./src
RUN pnpm build

FROM caddy:2-alpine AS runner
WORKDIR /app
COPY Caddyfile ./
COPY --from=build /app/dist ./dist
EXPOSE 8080
CMD ["caddy", "run", "--config", "Caddyfile", "--adapter", "caddyfile"]
