FROM node:24-slim

RUN npm install -g pnpm@10.34.9

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json apps/api/
COPY packages/shared/package.json packages/shared/
RUN pnpm install --frozen-lockfile --filter "{./apps/api}..."

COPY packages/shared packages/shared
COPY apps/api apps/api
RUN pnpm --filter "{./apps/api}..." build

ENV NODE_ENV=production
WORKDIR /app/apps/api
CMD ["node", "dist/main.js"]
