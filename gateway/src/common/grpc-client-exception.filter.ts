import { ExceptionFilter, Catch, ArgumentsHost, HttpStatus } from "@nestjs/common";
import { Response } from "express";
import { ClientError, Status } from "nice-grpc";

@Catch(ClientError)
export class GrpcClientExceptionFilter implements ExceptionFilter {
  catch(exception: ClientError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const httpStatus = this.mapGrpcStatusToHttp(exception.code);

    response.status(httpStatus).json({
      statusCode: httpStatus,
      message: exception.details,
    });
  }

  private mapGrpcStatusToHttp(code: Status): number {
    switch (code) {
      case Status.NOT_FOUND:
        return HttpStatus.NOT_FOUND;
      case Status.INVALID_ARGUMENT:
        return HttpStatus.BAD_REQUEST;
      case Status.ALREADY_EXISTS:
        return HttpStatus.CONFLICT;
      case Status.UNAUTHENTICATED:
        return HttpStatus.UNAUTHORIZED;
      case Status.PERMISSION_DENIED:
        return HttpStatus.FORBIDDEN;
      case Status.DEADLINE_EXCEEDED:
        return HttpStatus.GATEWAY_TIMEOUT;
      default:
        return HttpStatus.INTERNAL_SERVER_ERROR;
    }
  }
}