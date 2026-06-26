import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from "@nestjs/common";
import { JwtVerifyService } from "../jwt-verify.service.js";

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private jwtVerify: JwtVerifyService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new UnauthorizedException("Missing or malformed Authorization header");
    }

    const token = authHeader.slice("Bearer ".length);

    try {
      const { userId, username } = this.jwtVerify.verify(token);
      request.user = { userId, username }; // attach to request for controllers to use
      return true;
    } catch {
      throw new UnauthorizedException("Invalid or expired token");
    }
  }
}