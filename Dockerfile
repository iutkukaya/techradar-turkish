# Stage 1: Build Client
FROM node:20-slim AS client-build
WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci
COPY client/ .
RUN npm run build

# Stage 2: Build Server & Run
FROM node:20-slim
WORKDIR /app/server

# Install build dependencies for sqlite3 (if needed for specific archs)
# node-gyp dependencies: python3, make, g++
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

COPY server/package*.json ./
RUN npm ci --production

COPY server/ .
# Copy built client assets to the expected location relative to server
COPY --from=client-build /app/client/dist ../client/dist

# Create a directory for the database and set permissions
RUN mkdir -p /app/data
# Update database path in code to point to /app/data if needed, 
# OR we just mount the volume to /app/server where radar.db is expected.
# The code expects radar.db in __dirname (server directory). 
# To allow persistence, we should probably change database.js to look for DB in a volume path if ENV var is set, 
# or just mount the whole server dir (bad practice).
# BEST PRACTICE: Allow DB path override via ENV.
# For now, let's stick to the simplest path: Mount a volume to /app/server/data and symlink or move the DB there?
# OR: Just assume the user will mount a volume to /app/server/radar.db? No, docker handles files vs dirs awkwardly.

# Let's check database.js again.
# const dbPath = path.join(dbDir, 'radar.db');
# We can't easily change this without code change.
# Let's add a quick environment variable support to database.js? 
# Or just document that the volume should be mounted at /app/server/radar.db (file mount) or /app/server (directory mount - risky).

# Better Plan: Update database.js to support DB_PATH env var. 
# But I already edited database.js.
# Let's update database.js to try `process.env.DB_PATH` first.

ENV PORT=3000
EXPOSE 3000

# Non-root user for OpenShift compatibility
# Create a user & group (node image comes with 'node' user usually uid 1000)
# We need to ensure permissions on the directory
RUN chown -R node:node /app
USER node

CMD ["node", "server.js"]
