# MkopoFlow Web App — production image for Railway (Vite build + Caddy)
FROM node:22-alpine AS base
RUN apk add --no-cache git
RUN corepack enable && corepack prepare pnpm@10.11.0 --activate
WORKDIR /app

# Shared types/schemas live in the backend repo; clone only packages/shared.
FROM base AS shared
ARG MKOPOFLOW_BACKEND_REPO=https://github.com/mocustoms/MkopoFlow-Backend.git
ARG GITHUB_TOKEN=
RUN set -eux; \
  if [ -n "${GITHUB_TOKEN}" ]; then \
    clone_url="https://${GITHUB_TOKEN}@github.com/mocustoms/MkopoFlow-Backend.git"; \
  else \
    clone_url="${MKOPOFLOW_BACKEND_REPO}"; \
  fi; \
  git clone --depth 1 --filter=blob:none --sparse "${clone_url}" /tmp/backend; \
  cd /tmp/backend; \
  git sparse-checkout set packages/shared; \
  mkdir -p /app/packages; \
  cp -r packages/shared /app/packages/shared

FROM base AS deps
COPY --from=shared /app/packages/shared ./packages/shared
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
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
