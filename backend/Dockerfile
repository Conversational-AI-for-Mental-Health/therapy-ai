# Dependency Installation & Workspace Linking
FROM node:20-alpine AS installer
WORKDIR /app
COPY package.json yarn.lock .yarnrc.yml ./
COPY backend/ ./backend
COPY frontend/ ./frontend
RUN yarn install --frozen-lockfile 

# ----------------------------------------------------
# Build the Backend Code
# ----------------------------------------------------
FROM installer AS build
COPY backend/src ./src
RUN cd backend && yarn build 

# ----------------------------------------------------
# Production Runtime Image (Minimal)
# ----------------------------------------------------
FROM node:20-alpine AS final

ENV NODE_ENV production
WORKDIR /app

# Only copy what is strictly needed for Node to run the compiled code:
COPY --from=installer /app/node_modules ./node_modules
COPY --from=build /app/backend/dist ./dist

EXPOSE 3000
CMD ["node", "dist/server.js"]