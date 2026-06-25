import { Controller } from "@nestjs/common";
import { GrpcMethod } from "@nestjs/microservices";
import { GroupsService } from "./groups.service.js";

@Controller()
export class GroupsController {
  constructor(private groupsService: GroupsService) {}

  @GrpcMethod("GroupService", "CreateGroup")
   async createGroup(data: { name: string; creatorUserId: string; memberIds: string[] }) {
    const group = await this.groupsService.create(data.name, data.creatorUserId, data.memberIds);
    return this.toGroupResponse(group);
}

  @GrpcMethod("GroupService", "GetGroup")
  async getGroup(data: { id: string }) {
    const group = await this.groupsService.findOne(data.id);
    return this.toGroupResponse(group);
  }

  @GrpcMethod("GroupService", "ListGroupsForUser")
  async listGroupsForUser(data: { userId: string }) {
    const groups = await this.groupsService.listForUser(data.userId);
    return { groups: groups.map((g) => this.toGroupResponse(g)) };
  }

  @GrpcMethod("GroupService", "UpdateGroup")
  async updateGroup(data: { id: string; name?: string }) {
    const group = await this.groupsService.update(data.id, data.name!);
    return this.toGroupResponse(group);
  }

  @GrpcMethod("GroupService", "DeleteGroup")
  async deleteGroup(data: { id: string }) {
    return this.groupsService.remove(data.id);
  }

  @GrpcMethod("GroupService", "AddGroupMember")
  async addGroupMember(data: { groupId: string; userId: string }) {
    const member = await this.groupsService.addMember(data.groupId, data.userId);
    return {
      userId: member.userId,
      groupId: member.groupId,
      username: member.username,
      joinedAt: member.joinedAt.toISOString(),
    };
  }

  @GrpcMethod("GroupService", "RemoveGroupMember")
  async removeGroupMember(data: { groupId: string; userId: string }) {
    return this.groupsService.removeMember(data.groupId, data.userId);
  }

  @GrpcMethod("GroupService", "ListGroupMembers")
  async listGroupMembers(data: { groupId: string }) {
    const members = await this.groupsService.listMembers(data.groupId);
    return {
      members: members.map((m) => ({
        userId: m.userId,
        groupId: m.groupId,
        username: m.username,
        joinedAt: m.joinedAt.toISOString(),
      })),
    };
  }

  // Helper to shape a Prisma Group (with _count) into the proto Group message
  private toGroupResponse(group: any) {
    return {
      id: group.id,
      name: group.name,
      memberCount: group._count?.members ?? group.members?.length ?? 0,
      createdAt: group.createdAt.toISOString(),
    };
  }
}