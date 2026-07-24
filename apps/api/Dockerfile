FROM node:24-alpine AS builder
WORKDIR /app
COPY package.json ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
RUN npm install
COPY . .
RUN npm run db:generate --workspace=@sfp/api
RUN npm run build --workspace=@sfp/api

FROM node:24-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/api/package.json ./apps/api/package.json
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/prisma ./apps/api/prisma
COPY --from=builder /app/private-file ./private-file
EXPOSE 3001
CMD ["sh", "-c", "cd /app/apps/api && npx prisma db push --schema prisma/schema.prisma && node dist/main.js"]
