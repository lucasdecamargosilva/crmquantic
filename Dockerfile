FROM node:22-alpine AS build

WORKDIR /app

COPY web/package.json web/package-lock.json ./
RUN npm ci

COPY web/ .

ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY

RUN npm run build

FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html

# SPA fallback — todas as rotas caem no index.html
RUN echo 'server { \
    listen 80; \
    root /usr/share/nginx/html; \
    index index.html; \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
