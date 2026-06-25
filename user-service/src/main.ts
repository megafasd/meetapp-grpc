import "dotenv/config";
import { NestFactory } from "@nestjs/core";
import { MicroserviceOptions, Transport } from "@nestjs/microservices";
import { join } from "path";
import { AppModule } from "./app.module.js";

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    transport: Transport.GRPC,
    options: {
      package: "user",
      protoPath: join(import.meta.dirname, "../../../proto/user.proto"),
      url: "0.0.0.0:50051",
    },
  });

  await app.listen();
  console.log("🚀 User Service (gRPC) running on port 50051");
}

bootstrap();