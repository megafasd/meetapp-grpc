import { Injectable, ConflictException, NotFoundException } from "@nestjs/common";
import * as argon2 from "argon2";
import { DatabaseService } from "../database/database.service.js";

const PUBLIC_USER_FIELDS = {
  id: true,
  username: true,
  email: true,
  createdAt: true,
} as const;

@Injectable()
export class UsersService {
  constructor(private db: DatabaseService) {}

  async create(data: { username: string; email: string; password: string }) {
    const existing = await this.db.user.findFirst({
      where: { OR: [{ username: data.username }, { email: data.email }] },
    });
    if (existing) {
      throw new ConflictException("Username or email already in use");
    }

    const hashedPassword = await argon2.hash(data.password);

    return this.db.user.create({
      data: {
        username: data.username,
        email: data.email,
        password: hashedPassword,
      },
      select: PUBLIC_USER_FIELDS,
    });
  }

  // ⚠️ Used internally by AuthService for login — MUST include password + refreshToken
  async findOneWithCredentials(where: { id?: string; username?: string }) {
    const user = await this.db.user.findFirst({ where });
    if (!user) {
      throw new NotFoundException("User not found");
    }
    return user;
  }

  // Public-facing lookup — safe to expose via gRPC GetUser
  async findOne(where: { id?: string; username?: string }) {
    const user = await this.db.user.findFirst({
      where,
      select: PUBLIC_USER_FIELDS,
    });
    if (!user) {
      throw new NotFoundException("User not found");
    }
    return user;
  }

  async search(query: string, currentUserId: string) {
    return this.db.user.findMany({
      where: {
        username: {
          contains: query,
          mode: "insensitive",
        },
        NOT: { id: currentUserId },
      },
      select: {
        id: true,
        username: true,
        email: true,
      },
      take: 10,
    });
  }

  async update(id: string, data: { username?: string; password?: string }) {
    const updateData: { username?: string; password?: string } = {};

    if (data.username) {
      updateData.username = data.username;
    }
    if (data.password) {
      updateData.password = await argon2.hash(data.password);
    }

    return this.db.user.update({
      where: { id },
      data: updateData,
      select: PUBLIC_USER_FIELDS,
    });
  }

  async remove(id: string) {
    await this.db.user.delete({ where: { id } });
    return { success: true };
  }

  async findAll() {
    return this.db.user.findMany({
      select: PUBLIC_USER_FIELDS,
    });
  }

  // Internal only — never exposed via gRPC directly
  async updateRefreshToken(id: string, hashedRefreshToken: string | null) {
    return this.db.user.update({
      where: { id },
      data: { refreshToken: hashedRefreshToken },
      select: { id: true }, // only confirm it happened, don't leak the token back
    });
  }
}