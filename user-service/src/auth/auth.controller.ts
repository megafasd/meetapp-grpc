import { Controller } from "@nestjs/common";
import { GrpcMethod } from "@nestjs/microservices";
import { AuthService } from "./auth.service.js";

@Controller()
export class AuthController {
  constructor(private authService: AuthService) {}

  @GrpcMethod("UserService", "Register")
  async register(data: { username: string; email: string; password: string }) {
    return this.authService.register(data);
  }

  @GrpcMethod("UserService", "Login")
  async login(data: { username: string; password: string }) {
    return this.authService.login(data.username, data.password);
  }

  @GrpcMethod("UserService", "RefreshToken")
  async refreshToken(data: { userId: string; refreshToken: string }) {
    return this.authService.refreshTokens(data.userId, data.refreshToken);
  }

  @GrpcMethod("UserService", "Logout")
  async logout(data: { refreshToken: string }) {
    return this.authService.logout(data.refreshToken);
  }

  @GrpcMethod("UserService", "ValidateToken")
  async validateToken(data: { accessToken: string }) {
    return this.authService.validateAccessToken(data.accessToken);
  }
}