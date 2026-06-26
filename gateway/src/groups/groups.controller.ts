import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Req } from "@nestjs/common";
import { Request } from "express";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard.js";
import { GroupClientService } from "../clients/group-client.service.js";
import { CreateGroupDto } from "./dto/create-group.dto.js";

interface AuthedRequest extends Request {
  user: { userId: string; username: string };
}

@Controller("groups")
@UseGuards(JwtAuthGuard)
export class GroupsController {
  constructor(private groupClient: GroupClientService) {}

  @Post()
  async create(@Body() dto: CreateGroupDto, @Req() req: AuthedRequest) {
  console.log("DEBUG - dto.memberIds:", dto.memberIds, "isArray:", Array.isArray(dto.memberIds));
  return this.groupClient.instance.createGroup({
    name: dto.name,
    creatorUserId: req.user.userId,
    memberIds: dto.memberIds,
  });
}

  @Get(":id")
  async getOne(@Param("id") id: string) {
    return this.groupClient.instance.getGroup({ id });
  }

  @Get()
  async listMine(@Req() req: AuthedRequest) {
    return this.groupClient.instance.listGroupsForUser({ userId: req.user.userId });
  }

  @Patch(":id")
  async update(@Param("id") id: string, @Body() dto: { name?: string }) {
    return this.groupClient.instance.updateGroup({ id, name: dto.name });
  }

  @Delete(":id")
  async remove(@Param("id") id: string) {
    return this.groupClient.instance.deleteGroup({ id });
  }

  @Post(":id/members/:userId")
  async addMember(@Param("id") groupId: string, @Param("userId") userId: string) {
    return this.groupClient.instance.addGroupMember({ groupId, userId });
  }

  @Delete(":id/members/:userId")
  async removeMember(@Param("id") groupId: string, @Param("userId") userId: string) {
    return this.groupClient.instance.removeGroupMember({ groupId, userId });
  }

  @Get(":id/members")
  async listMembers(@Param("id") groupId: string) {
    return this.groupClient.instance.listGroupMembers({ groupId });
  }
}