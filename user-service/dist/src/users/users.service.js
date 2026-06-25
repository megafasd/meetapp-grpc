var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Injectable, ConflictException, NotFoundException } from "@nestjs/common";
import * as argon2 from "argon2";
import { DatabaseService } from "../database/database.service.js";
const PUBLIC_USER_FIELDS = {
    id: true,
    username: true,
    email: true,
    createdAt: true,
};
let UsersService = class UsersService {
    db;
    constructor(db) {
        this.db = db;
    }
    async create(data) {
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
    async findOneWithCredentials(where) {
        const user = await this.db.user.findFirst({ where });
        if (!user) {
            throw new NotFoundException("User not found");
        }
        return user;
    }
    // Public-facing lookup — safe to expose via gRPC GetUser
    async findOne(where) {
        const user = await this.db.user.findFirst({
            where,
            select: PUBLIC_USER_FIELDS,
        });
        if (!user) {
            throw new NotFoundException("User not found");
        }
        return user;
    }
    async search(query, currentUserId) {
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
    async update(id, data) {
        const updateData = {};
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
    async remove(id) {
        await this.db.user.delete({ where: { id } });
        return { success: true };
    }
    async findAll() {
        return this.db.user.findMany({
            select: PUBLIC_USER_FIELDS,
        });
    }
    // Internal only — never exposed via gRPC directly
    async updateRefreshToken(id, hashedRefreshToken) {
        return this.db.user.update({
            where: { id },
            data: { refreshToken: hashedRefreshToken },
            select: { id: true }, // only confirm it happened, don't leak the token back
        });
    }
};
UsersService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [DatabaseService])
], UsersService);
export { UsersService };
