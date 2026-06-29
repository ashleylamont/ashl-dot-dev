# Stage 1: Build the Astro app with Bun
FROM oven/bun:latest AS builder
WORKDIR /app

# Copy package files (Bun uses bun.lockb for lock information)
COPY package.json bun.lockb ./

# Install dependencies using Bun
RUN bun install --frozen-lockfile

# Copy the rest of your application code
COPY . .

# Build the Astro app
RUN bun run build

# Stage 2: Run the built server bundle using Bun
FROM oven/bun:latest AS runner
WORKDIR /app

# The SSR bundle externalizes some deps (e.g. `cookie`). Ship the resolved,
# lockfile-pinned node_modules so Bun doesn't auto-install the latest version
# of those packages at runtime.
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/dist ./dist

EXPOSE 4321

CMD ["sh", "-c", "HOST=:: PORT=4321 bun ./dist/server/entry.mjs"]
