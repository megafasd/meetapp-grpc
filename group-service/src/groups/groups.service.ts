import { Injectable, NotFoundException } from "@nestjs/common";
import { DatabaseService } from "../database/database.service.js";
import { UserClientService } from "../user-client/user-client.service.js";

@Injectable()
export class GroupsService {
  constructor(
    private db: DatabaseService,
    private userClient: UserClientService
  ) {}

  async create(name: string, creatorUserId: string, memberIds: string[] = []) {
    // Always include the creator as a member
    const allMemberIds = Array.from(new Set([creatorUserId, ...memberIds]));

    // Verify every member actually exists in user-service, and fetch their usernames
    const members = await Promise.all(
      allMemberIds.map(async (userId) => {
        const user = await this.userClient.getUser(userId); // throws if not found
        return { userId: user.id, username: user.username };
      })
    );

    const group = await this.db.group.create({
      data: {
        name,
        members: {
          create: members.map((m) => ({
            userId: m.userId,
            username: m.username,
          })),
        },
      },
      include: { members: true },
    });

    return group;
  }

  async findOne(id: string) {
    const group = await this.db.group.findUnique({
      where: { id },
      include: { _count: { select: { members: true } } },
    });
    if (!group) {
      throw new NotFoundException("Group not found");
    }
    return group;
  }

  async listForUser(userId: string) {
    const memberships = await this.db.groupMember.findMany({
      where: { userId },
      include: {
        group: {
          include: { _count: { select: { members: true } } },
        },
      },
    });
    return memberships.map((m) => m.group);
  }

  async update(id: string, name: string) {
    await this.findOne(id); // throws NotFoundException if missing
    return this.db.group.update({
      where: { id },
      data: { name },
      include: { _count: { select: { members: true } } },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.db.group.delete({ where: { id } });
    return { success: true };
  }

  async addMember(groupId: string, userId: string) {
    await this.findOne(groupId); // ensures group exists

    // Verify the user actually exists, fetch their current username
    const user = await this.userClient.getUser(userId);

    const member = await this.db.groupMember.upsert({
      where: { groupId_userId: { groupId, userId } },
      create: { groupId, userId, username: user.username },
      update: { username: user.username }, // refresh cached username if it changed
      include: undefined,
    });

    return member;
  }

  async removeMember(groupId: string, userId: string) {
    await this.db.groupMember.delete({
      where: { groupId_userId: { groupId, userId } },
    });
    return { success: true };
  }

  async listMembers(groupId: string) {
    await this.findOne(groupId);
    return this.db.groupMember.findMany({ where: { groupId } });
  }
}