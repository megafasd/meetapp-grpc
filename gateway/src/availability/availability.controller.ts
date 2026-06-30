import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards, Req } from "@nestjs/common";
import { ApiTags, ApiBearerAuth, ApiOperation } from "@nestjs/swagger";
import { Request } from "express";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard.js";
import { GroupClientService } from "../clients/group-client.service.js";
import { AddAvailabilityDto } from "./dto/add-availability.dto.js";

interface AuthedRequest extends Request {
  user: { userId: string; username: string };
}

@ApiTags("availability")
@ApiBearerAuth()
@Controller()
@UseGuards(JwtAuthGuard)
export class AvailabilityController {
  constructor(private groupClient: GroupClientService) {}

  @ApiOperation({ summary: "Mark yourself available on a given date" })
  @Post("availability")
  async add(@Body() dto: AddAvailabilityDto, @Req() req: AuthedRequest) {
    return this.groupClient.instance.addAvailability({
      userId: req.user.userId,
      date: dto.date,
    });
  }

  @ApiOperation({ summary: "Remove your availability for a given date" })
  @Delete("availability")
  async remove(@Body() dto: { date: string }, @Req() req: AuthedRequest) {
    return this.groupClient.instance.removeAvailability({
      userId: req.user.userId,
      date: dto.date,
    });
  }

  @ApiOperation({ summary: "Get your own availability for a given month" })
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

  @ApiOperation({ summary: "Get the best hangout dates for a group in a given month" })
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