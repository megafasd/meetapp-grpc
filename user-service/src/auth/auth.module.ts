import { Module } from "@nestjs/common";
import { AuthService } from "./auth.service.js";
import { UsersModule } from "../users/users.module.js";

@Module({
  imports: [UsersModule],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}