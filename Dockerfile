# Stage 1: Build the Astro app with Bun
FROM oven/bun:latest AS builder
WORKDIR /app

# Copy package files (Bun uses bun.lockb for lock information)
COPY package.json bun.lockb ./

# Install dependencies using Bun
RUN bun install

# Build the Astro app
RUN bun run build

# Stage 2: Run the built server bundle using Bun
FROM oven/bun:latest AS runner
WORKDIR /app

COPY --from=builder /app/dist ./dist

EXPOSE 4321

CMD ["sh", "-c", "HOST=:: PORT=4321 bun ./dist/server/entry.mjs"]
