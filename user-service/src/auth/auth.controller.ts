import { Controller, UsePipes, ValidationPipe } from "@nestjs/common";
import { GrpcMethod } from "@nestjs/microservices";
import { AuthService } from "./auth.service.js";
import { RegisterDto, LoginDto } from "@meetapp/shared-dto";

@Controller()
export class AuthController {
  constructor(private authService: AuthService) {}

  @GrpcMethod("UserService", "Register")
  async register(data: RegisterDto) {
    return this.authService.register(data);
  }

  @GrpcMethod("UserService", "Login")
  async login(data: LoginDto) {
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