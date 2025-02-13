# Stage 1: Build the Astro app with Bun
FROM oven/bun:latest AS builder
WORKDIR /app

# Copy package files (Bun uses bun.lockb for lock information)
COPY package.json bun.lockb ./

# Install dependencies using Bun
RUN bun install

# Copy the rest of your application code
COPY . .

# Build the Astro app (using the @astro/node adapter)
# This should produce a server bundle (e.g. in the "dist" directory)
RUN bun run build

# Stage 2: Create a .env file for Astro
FROM oven/bun:latest AS envfile
WORKDIR /app

CMD ["sh", "-c", "printenv > /app/.env"]

# Stage 3: Run the built server bundle using Bun
FROM oven/bun:latest AS runner
WORKDIR /app

# Copy the built output from the builder stage
COPY --from=builder /app/dist ./dist
COPY --from=envfile /app/.env ./.env

# Expose the port that your Astro app listens on (default 4321)
EXPOSE 4321

# Start the server bundle with Bun.
# Adjust the path if your adapter outputs a different entry file.
CMD ["sh", "-c", "HOST=:: PORT=4321 bun ./dist/server/entry.mjs"]
