# The site's image: nginx serving the output of `npm run build`.
# Built by deploy/deploy.sh from the repository root: docker build -f deploy/Dockerfile .
FROM node:22-alpine AS build
WORKDIR /site
COPY package.json package-lock.json ./
RUN npm ci
COPY src src
COPY scripts scripts
COPY assets assets
RUN npm run check

FROM nginxinc/nginx-unprivileged:1.29-alpine
COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf
COPY deploy/security-headers.conf /etc/nginx/snippets/security-headers.conf
COPY --from=build /site/dist /usr/share/nginx/html
EXPOSE 8080
