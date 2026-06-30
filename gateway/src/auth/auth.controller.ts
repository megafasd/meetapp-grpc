import { Controller, Post, Body } from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import { UserClientService } from "../clients/user-client.service.js";
import { RegisterDto, LoginDto } from "@meetapp/shared-dto";

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(private userClient: UserClientService) {}

  @ApiOperation({ summary: "Register a new user account" })
  @Post("register")
  async register(@Body() dto: RegisterDto) {
    return this.userClient.instance.register(dto);
  }

  @ApiOperation({ summary: "Log in and receive access/refresh tokens" })
  @Post("login")
  async login(@Body() dto: LoginDto) {
    return this.userClient.instance.login(dto);
  }

  @ApiOperation({ summary: "Exchange a refresh token for a new token pair" })
  @Post("refresh")
  async refresh(@Body() dto: { userId: string; refreshToken: string }) {
    return this.userClient.instance.refreshToken(dto);
  }

  @ApiOperation({ summary: "Log out and revoke the refresh token" })
  @Post("logout")
  async logout(@Body() dto: { refreshToken: string }) {
    return this.userClient.instance.logout(dto);
  }
}