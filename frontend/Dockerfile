FROM node:20-alpine AS builder

WORKDIR /build

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ ./

ARG VITE_API_URL=https://events-api.lion.app.br
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

FROM nginx:alpine

COPY --from=builder /build/dist /usr/share/nginx/html
COPY --from=builder /build/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
