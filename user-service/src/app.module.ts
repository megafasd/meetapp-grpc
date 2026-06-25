import { Module } from "@nestjs/common";
import { DatabaseModule } from "./database/database.module.js";
import { UsersModule } from "./users/users.module.js";
import { AuthModule } from "./auth/auth.module.js";
import { AuthController } from "./auth/auth.controller.js";
import { UsersController } from "./users/users.controller.js";

@Module({
  imports: [DatabaseModule, UsersModule, AuthModule],
  controllers: [AuthController, UsersController],
})
export class AppModule {}