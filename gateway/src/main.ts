import "dotenv/config";
import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { AppModule } from "./app.module.js";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { GrpcClientExceptionFilter } from "./common/grpc-client-exception.filter.js";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalFilters(new GrpcClientExceptionFilter());

  const config = new DocumentBuilder()
  .setTitle("MeetApp API")
  .setDescription("Gateway REST API for the MeetApp gRPC microservices")
  .setVersion("1.0")
  .addBearerAuth()
  .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api", app, document);

  app.useGlobalPipes(new ValidationPipe());

  await app.listen(process.env.PORT ?? 3000);
  console.log(`🚀 API Gateway running on http://localhost:${process.env.PORT ?? 3000}`);
}

bootstrap();