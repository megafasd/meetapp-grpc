import { Module } from "@nestjs/common";
import { GroupsService } from "./groups.service.js";
import { DatabaseModule } from "../database/database.module.js";
import { UserClientModule } from "../user-client/user-client.module.js";

@Module({
  imports: [DatabaseModule, UserClientModule],
  providers: [GroupsService],
  exports: [GroupsService],
})
export class GroupsModule {}