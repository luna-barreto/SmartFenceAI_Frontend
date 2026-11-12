# ── Stage 1: build Expo web export ───────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Export static web bundle into /app/dist
RUN NODE_OPTIONS=--max-old-space-size=4096 npx expo export --platform web

# ── Stage 2: serve with nginx ────────────────────────────────────────────────
FROM nginx:stable-alpine
COPY --from=builder /app/dist /usr/share/nginx/html

# SPA fallback: all paths serve index.html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
