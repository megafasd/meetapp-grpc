FROM node:22 AS build

RUN curl -sSL "https://github.com/bufbuild/buf/releases/download/v1.71.0/buf-Linux-x86_64" -o /usr/local/bin/buf && \
    chmod +x /usr/local/bin/buf

WORKDIR /app

COPY package*.json ./
COPY shared-dto ./shared-dto
COPY proto ./proto
COPY group-service ./group-service

RUN npm install

WORKDIR /app/group-service
RUN npx prisma generate
RUN PATH="$PATH:$(pwd)/node_modules/.bin" buf generate ../proto --path ../proto/user.proto --path ../proto/group.proto
RUN npm run build

FROM node:22-slim

WORKDIR /app

COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/proto ./proto
COPY --from=build /app/group-service ./group-service

WORKDIR /app/group-service

EXPOSE 50052

CMD ["node", "dist/src/main.js"]