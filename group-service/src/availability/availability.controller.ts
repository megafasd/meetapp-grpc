import { Controller } from "@nestjs/common";
import { GrpcMethod } from "@nestjs/microservices";
import { AvailabilityService } from "./availability.service.js";
import { AddAvailabilityDto } from "./dto/add-availability.dto.js";

@Controller()
export class AvailabilityController {
  constructor(private availabilityService: AvailabilityService) {}

  @GrpcMethod("GroupService", "AddAvailability")
  async addAvailability(data: AddAvailabilityDto) {
  const entry = await this.availabilityService.addAvailability(data.userId, data.date);
  return {
    id: entry.id,
    userId: entry.userId,
    availableDate: entry.availableDate.toISOString().split("T")[0],
  };
}

  @GrpcMethod("GroupService", "RemoveAvailability")
  async removeAvailability(data: { userId: string; date: string }) {
    return this.availabilityService.removeAvailability(data.userId, data.date);
  }

  @GrpcMethod("GroupService", "GetMyAvailability")
  async getMyAvailability(data: { userId: string; year: number; month: number }) {
    const entries = await this.availabilityService.getMyAvailability(
      data.userId,
      data.year,
      data.month
    );
    return {
      entries: entries.map((e) => ({
        id: e.id,
        userId: e.userId,
        availableDate: e.availableDate.toISOString().split("T")[0],
      })),
    };
  }

  @GrpcMethod("GroupService", "GetGroupAvailability")
  async getGroupAvailability(data: { groupId: string; year: number; month: number }) {
    const days = await this.availabilityService.getGroupAvailability(
      data.groupId,
      data.year,
      data.month
    );
    return { days };
  }
}