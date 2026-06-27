import { jest, describe, it, expect, beforeEach } from "@jest/globals";
import { Test, TestingModule } from "@nestjs/testing";
import { GroupsService } from "./groups.service.js";
import { DatabaseService } from "../database/database.service.js";
import { UserClientService } from "../user-client/user-client.service.js";

describe("GroupsService", () => {
  let service: GroupsService;
  let mockDb: any;
  let mockUserClient: any;

  beforeEach(async () => {
    mockDb = {
      group: {
        create: jest.fn(),
        findUnique: jest.fn(),
      },
      groupMember: {
        findMany: jest.fn(),
        upsert: jest.fn(),
        delete: jest.fn(),
      },
    };

    mockUserClient = {
      getUser: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GroupsService,
        { provide: DatabaseService, useValue: mockDb },
        { provide: UserClientService, useValue: mockUserClient },
      ],
    }).compile();

    service = module.get<GroupsService>(GroupsService);
  });

  describe("create", () => {
    it("creates a group with an empty memberIds array (the bug from yesterday!)", async () => {
      mockUserClient.getUser.mockResolvedValue({
        id: "creator-id",
        username: "alice",
      });

      mockDb.group.create.mockResolvedValue({
        id: "group-id",
        name: "Test Group",
        members: [{ userId: "creator-id", username: "alice" }],
      });

      const result = await service.create("Test Group", "creator-id", []);

      // The creator should still be added even with an empty memberIds array
      expect(mockUserClient.getUser).toHaveBeenCalledWith("creator-id");
      expect(mockUserClient.getUser).toHaveBeenCalledTimes(1); // only the creator, no duplicates
      expect(result.name).toBe("Test Group");
    });

    it("verifies every member exists via user-service before creating the group", async () => {
      mockUserClient.getUser.mockImplementation((id: string) =>
        Promise.resolve({ id, username: `user-${id}` })
      );

      mockDb.group.create.mockResolvedValue({
        id: "group-id",
        name: "Test Group",
        members: [],
      });

      await service.create("Test Group", "creator-id", ["member-1", "member-2"]);

      expect(mockUserClient.getUser).toHaveBeenCalledTimes(3); // creator + 2 members
    });

    it("throws if a member does not exist in user-service", async () => {
      mockUserClient.getUser
        .mockResolvedValueOnce({ id: "creator-id", username: "alice" })
        .mockRejectedValueOnce(new Error("User not found"));

      await expect(
        service.create("Test Group", "creator-id", ["nonexistent-id"])
      ).rejects.toThrow();
    });

    it("deduplicates the creator if they're also listed in memberIds", async () => {
      mockUserClient.getUser.mockResolvedValue({
        id: "creator-id",
        username: "alice",
      });

      mockDb.group.create.mockResolvedValue({
        id: "group-id",
        name: "Test Group",
        members: [{ userId: "creator-id", username: "alice" }],
      });

      await service.create("Test Group", "creator-id", ["creator-id"]); // creator listed twice

      expect(mockUserClient.getUser).toHaveBeenCalledTimes(1); // deduplicated, not called twice
    });
  });
});