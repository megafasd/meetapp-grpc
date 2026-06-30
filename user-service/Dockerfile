FROM node:22 AS build

WORKDIR /app

COPY package*.json ./
COPY shared-dto ./shared-dto
COPY proto ./proto
COPY user-service ./user-service

RUN npm install
RUN npm run build --workspace=shared-dto
WORKDIR /app/user-service
RUN npx prisma generate
RUN npm run build

FROM node:22-slim

WORKDIR /app

COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/shared-dto ./shared-dto
COPY --from=build /app/proto ./proto
COPY --from=build /app/user-service ./user-service

WORKDIR /app/user-service

EXPOSE 50051

CMD ["node", "dist/src/main.js"]