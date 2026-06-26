import "dotenv/config";
import { NestFactory } from "@nestjs/core";
import { MicroserviceOptions, Transport, RpcException } from "@nestjs/microservices";
import { ValidationPipe } from "@nestjs/common";
import { status as GrpcStatus } from "@grpc/grpc-js";
import { join } from "path";
import { AppModule } from "./app.module.js";
import { GrpcExceptionFilter } from "./common/grpc-exception.filter.js";

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    transport: Transport.GRPC,
    options: {
      package: "user",
      protoPath: join(import.meta.dirname, "../../../proto/user.proto"),
      url: "0.0.0.0:50051",
    },
  });

  app.useGlobalFilters(new GrpcExceptionFilter());

  app.useGlobalPipes(
    new ValidationPipe({
      exceptionFactory: (errors) =>
        new RpcException({
          code: GrpcStatus.INVALID_ARGUMENT,
          message: errors
            .map((e) => Object.values(e.constraints ?? {}).join(", "))
            .join("; "),
        }),
    })
  );

  await app.listen();
  console.log("🚀 User Service (gRPC) running on port 50051");
}

bootstrap();