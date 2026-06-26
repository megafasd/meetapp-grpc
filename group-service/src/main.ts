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
      package: "group",
      protoPath: join(import.meta.dirname, "../../../proto/group.proto"),
      url: "0.0.0.0:50052",
    },
  });

  app.useGlobalFilters(new GrpcExceptionFilter());

app.useGlobalPipes(
   new ValidationPipe({
     transform: true,
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
  console.log("🚀 Group Service (gRPC) running on port 50052");
}

bootstrap();