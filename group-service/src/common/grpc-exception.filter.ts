import { ExceptionFilter, Catch, ArgumentsHost, NotFoundException, ConflictException, BadRequestException } from "@nestjs/common";
import { RpcException } from "@nestjs/microservices";
import { status as GrpcStatus } from "@grpc/grpc-js";
import { ClientError } from "nice-grpc";
import { throwError } from "rxjs";

@Catch()
export class GrpcExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, _host: ArgumentsHost) {
    if (exception instanceof RpcException) {
      return throwError(() => exception);
    }

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

    // ✅ NEW — an error that already came from ANOTHER gRPC service via nice-grpc.
    // It already has a real status code, so forward it as-is instead of downgrading
    // it to a generic INTERNAL error.
    if (exception instanceof ClientError) {
      return throwError(() => ({
        code: exception.code,
        message: exception.details,
      }));
    }

    console.error("Unhandled exception in gRPC handler:", exception);
    return throwError(() => ({
      code: GrpcStatus.INTERNAL,
      message: "Internal server error",
    }));
  }
}