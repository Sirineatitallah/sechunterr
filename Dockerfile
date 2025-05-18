# Étape 1 : Build Angular
FROM node:18-alpine AS builder
WORKDIR /app
COPY sechunter/frontend/package*.json ./
RUN npm install --legacy-peer-deps
COPY sechunter/frontend/ ./
RUN npm run build

# Étape 2 : NGINX
FROM nginx:alpine
COPY --from=builder /app/dist/sechunter/browser /usr/share/nginx/html
COPY sechunter/frontend/nginx.conf /etc/nginx/conf.d/default.conf
