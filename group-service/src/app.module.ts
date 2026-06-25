import { Module } from "@nestjs/common";
import { DatabaseModule } from "./database/database.module.js";
import { UserClientModule } from "./user-client/user-client.module.js";
import { GroupsModule } from "./groups/groups.module.js";
import { AvailabilityModule } from "./availability/availability.module.js";
import { GroupsController } from "./groups/groups.controller.js";
import { AvailabilityController } from "./availability/availability.controller.js";

@Module({
  imports: [DatabaseModule, UserClientModule, GroupsModule, AvailabilityModule],
  controllers: [GroupsController, AvailabilityController],
})
export class AppModule {}