# Base image from Google's mirror of Docker Hub official images: the same image, without Docker
# Hub's anonymous pull limit that CI runners hit (429 Too Many Requests).
# ---- deps: install all dependencies (build-time) ----
FROM mirror.gcr.io/library/node:24-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# ---- build: Next build from the committed API client (src/generated) ----
FROM mirror.gcr.io/library/node:24-alpine AS build
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# ---- runtime: Next standalone server only ----
FROM mirror.gcr.io/library/node:24-alpine AS runtime
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
