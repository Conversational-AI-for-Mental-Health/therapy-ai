# Dependency Installation & Workspace Linking
FROM node:20-alpine AS installer
# Enable Corepack to use the Latest Yarn version in packageManager
RUN corepack enable
WORKDIR /app
COPY package.json yarn.lock .yarnrc.yml ./
COPY backend/ ./backend
COPY frontend/ ./frontend
COPY e2e/ ./e2e
COPY mobile/ ./mobile
COPY packages/ ./packages
RUN yarn install --immutable

# ----------------------------------------------------
# Build the Frontend Static Assets
# ----------------------------------------------------
FROM installer AS build
COPY frontend/src ./src
COPY frontend/.env ./frontend/.env
COPY frontend/public ./public 
RUN cd frontend && yarn build

# ----------------------------------------------------
# Serve the production static assets using Nginx (Minimal)
# ----------------------------------------------------
FROM nginx:alpine AS final

# Copy the Nginx configuration file
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf 

# Only copy the resulting compiled files
COPY --from=build /app/frontend/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]