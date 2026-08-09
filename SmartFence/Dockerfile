# ── Stage 1: builder ──────────────────────────────────────────
FROM node:20-slim AS builder
WORKDIR /app

# Install deps (all, including devDeps for build)
COPY package*.json ./
RUN npm ci --ignore-scripts

# Copy source and run postinstall now that scripts/ is available
COPY . .
RUN npm run postinstall

ARG EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY
ARG EXPO_PUBLIC_API_URL
ARG EXPO_PUBLIC_SOCKET_URL

ENV EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=$EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY
ENV EXPO_PUBLIC_API_URL=$EXPO_PUBLIC_API_URL
ENV EXPO_PUBLIC_SOCKET_URL=$EXPO_PUBLIC_SOCKET_URL

RUN npx expo export --platform web --output-dir /app/dist

# ── Stage 2: runner ───────────────────────────────────────────
FROM nginx:alpine AS runner

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
