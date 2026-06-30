import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Req } from "@nestjs/common";
import { ApiTags, ApiBearerAuth, ApiOperation } from "@nestjs/swagger";
import { Request } from "express";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard.js";
import { GroupClientService } from "../clients/group-client.service.js";
import { CreateGroupDto } from "./dto/create-group.dto.js";

interface AuthedRequest extends Request {
  user: { userId: string; username: string };
}

@ApiTags("groups")
@ApiBearerAuth()
@Controller("groups")
@UseGuards(JwtAuthGuard)
export class GroupsController {
  constructor(private groupClient: GroupClientService) {}

  @ApiOperation({ summary: "Create a new group (you become a member automatically)" })
  @Post()
  async create(@Body() dto: CreateGroupDto, @Req() req: AuthedRequest) {
    return this.groupClient.instance.createGroup({
      name: dto.name,
      creatorUserId: req.user.userId,
      memberIds: dto.memberIds,
    });
  }

  @ApiOperation({ summary: "Get a single group by ID" })
  @Get(":id")
  async getOne(@Param("id") id: string) {
    return this.groupClient.instance.getGroup({ id });
  }

  @ApiOperation({ summary: "List all groups the current user belongs to" })
  @Get()
  async listMine(@Req() req: AuthedRequest) {
    return this.groupClient.instance.listGroupsForUser({ userId: req.user.userId });
  }

  @ApiOperation({ summary: "Update a group's name" })
  @Patch(":id")
  async update(@Param("id") id: string, @Body() dto: { name?: string }) {
    return this.groupClient.instance.updateGroup({ id, name: dto.name });
  }

  @ApiOperation({ summary: "Delete a group" })
  @Delete(":id")
  async remove(@Param("id") id: string) {
    return this.groupClient.instance.deleteGroup({ id });
  }

  @ApiOperation({ summary: "Add a member to a group" })
  @Post(":id/members/:userId")
  async addMember(@Param("id") groupId: string, @Param("userId") userId: string) {
    return this.groupClient.instance.addGroupMember({ groupId, userId });
  }

  @ApiOperation({ summary: "Remove a member from a group" })
  @Delete(":id/members/:userId")
  async removeMember(@Param("id") groupId: string, @Param("userId") userId: string) {
    return this.groupClient.instance.removeGroupMember({ groupId, userId });
  }

  @ApiOperation({ summary: "List all members of a group" })
  @Get(":id/members")
  async listMembers(@Param("id") groupId: string) {
    return this.groupClient.instance.listGroupMembers({ groupId });
  }
}