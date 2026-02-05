# Dependency Installation & Workspace Linking
FROM node:20-alpine AS installer

# Enable Corepack to use the Latest Yarn version in packageManager
RUN corepack enable

WORKDIR /app
COPY package.json yarn.lock .yarnrc.yml ./
COPY backend/ ./backend
COPY frontend/ ./frontend
RUN yarn install --frozen-lockfile

# ----------------------------------------------------
# Build the Backend Code
# ----------------------------------------------------
FROM installer AS build
WORKDIR /app/backend
COPY backend/src ./src
COPY backend/tsconfig.json ./
RUN yarn build 

# ----------------------------------------------------
# Production Runtime Image (Minimal)
# ----------------------------------------------------
FROM node:20-alpine AS final

ENV NODE_ENV=production
WORKDIR /app

# Only copy what is strictly needed for Node to run the compiled code:
COPY --from=installer /app/node_modules ./node_modules
COPY --from=build /app/backend/dist ./dist

# Copy env file for docker
COPY backend/.env ./

EXPOSE 3000
CMD ["node", "dist/server.js"]

