import { Module } from "@nestjs/common";
import { ClientsModule } from "./clients/clients.module.js";
import { AuthModule } from "./auth/auth.module.js";
import { AuthController } from "./auth/auth.controller.js";
import { GroupsController } from "./groups/groups.controller.js";
import { AvailabilityController } from "./availability/availability.controller.js";

@Module({
  imports: [ClientsModule, AuthModule],
  controllers: [AuthController, GroupsController, AvailabilityController],
})
export class AppModule {}