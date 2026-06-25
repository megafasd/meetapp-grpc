import { Module } from "@nestjs/common";
import { UserClientService } from "./user-client.service.js";

@Module({
  providers: [UserClientService],
  exports: [UserClientService],
})
export class UserClientModule {}