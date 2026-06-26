import { Module } from "@nestjs/common";
import { UserClientService } from "./user-client.service.js";
import { GroupClientService } from "./group-client.service.js";

@Module({
  providers: [UserClientService, GroupClientService],
  exports: [UserClientService, GroupClientService],
})
export class ClientsModule {}