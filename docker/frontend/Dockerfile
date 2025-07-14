# Stage 1: Build the Angular application
FROM node:20-alpine AS build
WORKDIR /app

# 1. Copy ONLY the package definition files.
COPY frontend/hyperspace-client/package.json ./package.json
COPY frontend/hyperspace-client/package-lock.json ./package-lock.json

# 2. Run 'npm ci'.
# 'npm ci' is better for CI/CD environments. It performs a clean install
# strictly from the package-lock.json, ensuring reproducible builds.
# It also cleans the destination folder first.
RUN npm ci

# 3. Copy ALL remaining source files required for the build.
# By being explicit, we ensure that changes to ANY of these files will
# correctly invalidate the build cache.
COPY frontend/hyperspace-client/src/ ./src/
COPY frontend/hyperspace-client/public/ ./public/
COPY frontend/hyperspace-client/angular.json ./angular.json
COPY frontend/hyperspace-client/tsconfig.app.json ./tsconfig.app.json
COPY frontend/hyperspace-client/tsconfig.json ./tsconfig.json
COPY frontend/hyperspace-client/index.html ./index.html

# 4. Build the application for production. This will now run with the correct
# dependencies and all source files present.
RUN npm run build -- --configuration production

# Stage 2: Serve the application from a lightweight NGINX server
FROM nginx:alpine
COPY docker/frontend/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/hyperspace-client/browser/ /usr/share/nginx/html
EXPOSE 80