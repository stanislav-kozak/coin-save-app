# ---- deps: install all dependencies (build-time) ----
FROM node:24-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# ---- build: generate the API client from the live contract and build Next ----
FROM node:24-alpine AS build
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# prebuild runs `npm run api:generate` against API_DOCS_URL (defaults to the production contract)
ARG API_DOCS_URL=https://app.coinsavekeeper.com/api/docs.json
ENV API_DOCS_URL=$API_DOCS_URL
RUN npm run build

# ---- runtime: Next standalone server only ----
FROM node:24-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=::
# "::" listens on IPv6 and IPv4, so in-container health checks on `localhost` (→ ::1) work.
RUN addgroup -S app && adduser -S app -G app
COPY --from=build --chown=app:app /app/.next/standalone ./
COPY --from=build --chown=app:app /app/.next/static ./.next/static
COPY --from=build --chown=app:app /app/public ./public
USER app
EXPOSE 3000
CMD ["node", "server.js"]
