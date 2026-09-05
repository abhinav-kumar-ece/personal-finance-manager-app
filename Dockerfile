# Build stage
FROM node:20-slim AS builder

WORKDIR /app

# Install build dependencies
COPY package*.json ./
RUN npm install

# Copy source code and build production bundle
COPY . .
RUN npm run build

# Production Runner stage
FROM node:20-slim AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080

# Install production dependencies only
COPY package*.json ./
RUN npm install --omit=dev

# Copy compiled backend bundle and frontend assets from builder
COPY --from=builder /app/dist ./dist

# Expose Cloud Run port
EXPOSE 8080

# Start server
CMD ["node", "dist/server.cjs"]
