# Multi-stage build for production-ready server

# Build stage
FROM node:20-alpine AS builder

WORKDIR /build

# Copy package files
COPY package*.json ./
COPY shared/package.json ./shared/
COPY server/package.json ./server/

# Install dependencies
RUN npm ci

# Copy source code
COPY shared/ ./shared/
COPY server/ ./server/

# Build
RUN npm run build --workspace=shared
RUN npm run build --workspace=server

# Production stage
FROM node:20-alpine

WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Copy package files
COPY package*.json ./
COPY server/package.json ./server/

# Install production dependencies only
ENV NODE_ENV=production
RUN npm ci --omit=dev

# Copy built artifacts from builder
COPY --from=builder /build/shared/dist ./node_modules/@warshell/shared/dist
COPY --from=builder /build/server/dist ./server/dist

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start server
CMD ["node", "server/dist/index.js"]

EXPOSE 3000
