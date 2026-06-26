import { Controller, Post, Body } from "@nestjs/common";
import { UserClientService } from "../clients/user-client.service.js";
import { RegisterDto, LoginDto } from "@meetapp/shared-dto";

@Controller("auth")
export class AuthController {
  constructor(private userClient: UserClientService) {}

  @Post("register")
  async register(@Body() dto: RegisterDto) {
    return this.userClient.instance.register(dto);
  }

  @Post("login")
  async login(@Body() dto: LoginDto) {
    return this.userClient.instance.login(dto);
  }

  @Post("refresh")
  async refresh(@Body() dto: { userId: string; refreshToken: string }) {
    return this.userClient.instance.refreshToken(dto);
  }

  @Post("logout")
  async logout(@Body() dto: { refreshToken: string }) {
    return this.userClient.instance.logout(dto);
  }
}