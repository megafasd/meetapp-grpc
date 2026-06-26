import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards, Req } from "@nestjs/common";
import { Request } from "express";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard.js";
import { GroupClientService } from "../clients/group-client.service.js";
import { AddAvailabilityDto } from "./dto/add-availability.dto.js";

interface AuthedRequest extends Request {
  user: { userId: string; username: string };
}

@Controller()
@UseGuards(JwtAuthGuard)
export class AvailabilityController {
  constructor(private groupClient: GroupClientService) {}

  @Post("availability")
  async add(@Body() dto: AddAvailabilityDto, @Req() req: AuthedRequest) {
    return this.groupClient.instance.addAvailability({
      userId: req.user.userId, // again, from the verified token, not the body
      date: dto.date,
    });
  }

  @Delete("availability")
  async remove(@Body() dto: { date: string }, @Req() req: AuthedRequest) {
    return this.groupClient.instance.removeAvailability({
      userId: req.user.userId,
      date: dto.date,
    });
  }

  @Get("availability/me")
  async getMine(
    @Req() req: AuthedRequest,
    @Query("year") year: string,
    @Query("month") month: string
  ) {
    return this.groupClient.instance.getMyAvailability({
      userId: req.user.userId,
      year: parseInt(year, 10),
      month: parseInt(month, 10),
    });
  }

  @Get("groups/:groupId/availability")
  async getGroupAvailability(
    @Param("groupId") groupId: string,
    @Query("year") year: string,
    @Query("month") month: string
  ) {
    return this.groupClient.instance.getGroupAvailability({
      groupId,
      year: parseInt(year, 10),
      month: parseInt(month, 10),
    });
  }
}