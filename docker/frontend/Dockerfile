# Stage 1: Build the Angular application
FROM node:20-alpine AS build
WORKDIR /app

# Copy package.json and install dependencies
COPY frontend/hyperspace-client/package*.json ./
RUN npm install

# Copy the rest of the Angular application source code
COPY frontend/hyperspace-client/. .

# Build the application for production
RUN npm run build -- --configuration production

# Stage 2: Serve the application from a lightweight NGINX server
FROM nginx:alpine
# Copy our custom NGINX configuration
COPY docker/frontend/nginx.conf /etc/nginx/conf.d/default.conf
# Copy the built Angular application from the 'build' stage
COPY --from=build /app/dist/hyperspace-client/browser /usr/share/nginx/html

# Expose port 80
EXPOSE 80