import { Module } from "@nestjs/common";
import { AvailabilityService } from "./availability.service.js";
import { DatabaseModule } from "../database/database.module.js";

@Module({
  imports: [DatabaseModule],
  providers: [AvailabilityService],
  exports: [AvailabilityService],
})
export class AvailabilityModule {}