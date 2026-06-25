import { Injectable } from "@nestjs/common";
import { DatabaseService } from "../database/database.service.js";

@Injectable()
export class AvailabilityService {
  constructor(private db: DatabaseService) {}

  async addAvailability(userId: string, date: string) {
    return this.db.userAvailability.upsert({
      where: { userId_availableDate: { userId, availableDate: new Date(date) } },
      create: { userId, availableDate: new Date(date) },
      update: {},
    });
  }

  async removeAvailability(userId: string, date: string) {
    await this.db.userAvailability.delete({
      where: { userId_availableDate: { userId, availableDate: new Date(date) } },
    });
    return { success: true };
  }

  async getMyAvailability(userId: string, year: number, month: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    return this.db.userAvailability.findMany({
      where: {
        userId,
        availableDate: { gte: startDate, lte: endDate },
      },
    });
  }

  // ── Ported from original GroupsService.getAvailability ──────────
  async getGroupAvailability(groupId: string, year: number, month: number) {
    // Get all members of the group (now a local table, no `include: { user: true }` needed —
    // username is already cached on GroupMember itself)
    const members = await this.db.groupMember.findMany({
      where: { groupId },
    });

    const totalMembers = members.length;

    // Build date range from year + month — identical to original
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    // Fetch availability for all group members in that month — identical to original
    const rows = await this.db.userAvailability.findMany({
      where: {
        userId: { in: members.map((m) => m.userId) },
        availableDate: { gte: startDate, lte: endDate },
      },
    });

    // Group rows by date — identical logic to original
    const grouped = new Map<string, typeof members>();

    for (const row of rows) {
      const dateStr = row.availableDate.toISOString().split("T")[0];
      if (!grouped.has(dateStr)) grouped.set(dateStr, []);
      const member = members.find((m) => m.userId === row.userId);
      if (member) grouped.get(dateStr)!.push(member);
    }

    // Shape into the response format — username read directly, no relation needed
    return Array.from(grouped.entries()).map(([date, availableMembers]) => ({
      date,
      count: availableMembers.length,
      totalMembers,
      availableMembers: availableMembers.map((m) => ({
        userId: m.userId,
        groupId: m.groupId,
        username: m.username,
        joinedAt: m.joinedAt.toISOString(),
      })),
    }));
  }
}