import { Module } from "@nestjs/common";
import { JwtVerifyService } from "./jwt-verify.service.js";
import { JwtAuthGuard } from "./guards/jwt-auth.guard.js";

@Module({
  providers: [JwtVerifyService, JwtAuthGuard],
  exports: [JwtVerifyService, JwtAuthGuard],
})
export class AuthModule {}