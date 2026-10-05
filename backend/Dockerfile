# Multi-stage production Dockerfile for Node.js Express Backend
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package management and Prisma definitions
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies and generate Prisma client
RUN npm ci || npm install
RUN npx prisma generate

# Copy source code and build TypeScript project
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# Production Stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

COPY package*.json ./
RUN npm ci --only=production || npm install --production

# Copy Prisma schema & client artifacts from builder
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/dist ./dist

EXPOSE 5000

CMD ["node", "dist/server.js"]
