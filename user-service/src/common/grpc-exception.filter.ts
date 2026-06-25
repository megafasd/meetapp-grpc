import { ExceptionFilter, Catch, ArgumentsHost, NotFoundException, ConflictException, BadRequestException } from "@nestjs/common";
import { RpcException } from "@nestjs/microservices";
import { status as GrpcStatus } from "@grpc/grpc-js";
import { throwError } from "rxjs";

@Catch()
export class GrpcExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, _host: ArgumentsHost) {
    // Already a proper gRPC error (e.g. from AuthService) — pass it through unchanged
    if (exception instanceof RpcException) {
      return throwError(() => exception);
    }

    // Map common Nest HTTP-style exceptions to the right gRPC status code
    if (exception instanceof NotFoundException) {
      return throwError(() => ({
        code: GrpcStatus.NOT_FOUND,
        message: exception.message,
      }));
    }

    if (exception instanceof ConflictException) {
      return throwError(() => ({
        code: GrpcStatus.ALREADY_EXISTS,
        message: exception.message,
      }));
    }

    if (exception instanceof BadRequestException) {
      return throwError(() => ({
        code: GrpcStatus.INVALID_ARGUMENT,
        message: exception.message,
      }));
    }

    // Anything else — genuinely unexpected — becomes a generic INTERNAL error,
    // but we log it so it's not silently swallowed during development
    console.error("Unhandled exception in gRPC handler:", exception);
    return throwError(() => ({
      code: GrpcStatus.INTERNAL,
      message: "Internal server error",
    }));
  }
}