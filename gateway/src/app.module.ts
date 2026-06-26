import { Module } from "@nestjs/common";
import { ClientsModule } from "./clients/clients.module.js";

@Module({
  imports: [ClientsModule],
})
export class AppModule {}