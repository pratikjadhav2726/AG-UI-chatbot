# Multi-stage build for optimized production image
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./
RUN npm ci --only=production

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build MCP server first
WORKDIR /app/mcp-ui-server
RUN npm ci
RUN npm run build

# Build Next.js application
WORKDIR /app
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
# Uncomment the following line in case you want to disable telemetry during runtime.
# ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy the built application
COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy MCP server build
COPY --from=builder --chown=nextjs:nodejs /app/mcp-ui-server/dist ./mcp-ui-server/dist
COPY --from=builder --chown=nextjs:nodejs /app/mcp-ui-server/package.json ./mcp-ui-server/
COPY --from=builder --chown=nextjs:nodejs /app/mcp-ui-server/node_modules ./mcp-ui-server/node_modules

# Create startup script
COPY --chown=nextjs:nodejs <<EOF /app/start.sh
#!/bin/sh
set -e

echo "Starting MCP server..."
cd /app/mcp-ui-server && node dist/index.js &
MCP_PID=\$!

echo "Starting Next.js application..."
cd /app && node server.js &
NEXT_PID=\$!

# Function to handle shutdown
shutdown() {
    echo "Shutting down..."
    kill \$MCP_PID \$NEXT_PID 2>/dev/null || true
    wait \$MCP_PID \$NEXT_PID 2>/dev/null || true
    exit 0
}

# Set up signal handlers
trap shutdown SIGTERM SIGINT

# Wait for processes
wait \$MCP_PID \$NEXT_PID
EOF

RUN chmod +x /app/start.sh

USER nextjs

EXPOSE 3000

ENV PORT 3000
# set hostname to localhost
ENV HOSTNAME "0.0.0.0"

CMD ["/app/start.sh"]
