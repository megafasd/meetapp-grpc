import "dotenv/config";
import { NestFactory } from "@nestjs/core";
import { MicroserviceOptions, Transport } from "@nestjs/microservices";
import { join } from "path";
import { AppModule } from "./app.module.js";
import { GrpcExceptionFilter } from "./common/grpc-exception.filter.js";

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    transport: Transport.GRPC,
    options: {
      package: "group",
      protoPath: join(import.meta.dirname, "../../../proto/group.proto"),
      url: "0.0.0.0:50052",
    },
  });

  app.useGlobalFilters(new GrpcExceptionFilter()); // 👈 add this line

  await app.listen();
  console.log("🚀 Group Service (gRPC) running on port 50052");
}

bootstrap();