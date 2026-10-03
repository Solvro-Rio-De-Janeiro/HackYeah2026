FROM node:22-alpine AS build

WORKDIR /workspace

RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml nx.json tsconfig.base.json ./
COPY apps ./apps

RUN pnpm install --frozen-lockfile
RUN pnpm exec nx build frontend

FROM nginx:alpine

COPY nginx.frontend.conf /etc/nginx/conf.d/default.conf
COPY --from=build /workspace/dist/apps/frontend /usr/share/nginx/html

EXPOSE 80