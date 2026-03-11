FROM oven/bun:1.2.22-alpine AS build
WORKDIR /app

COPY package.json bun.lock bunfig.toml ./
RUN bun install --frozen-lockfile

COPY tsconfig.json ./
COPY scripts ./scripts
COPY src ./src

RUN bun run build

FROM oven/bun:1.2.22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8078

COPY --from=build /app/package.json ./package.json
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist

EXPOSE 8078

CMD ["bun", "dist/index.js"]
