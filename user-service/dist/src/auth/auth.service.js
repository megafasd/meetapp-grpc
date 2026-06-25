var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Injectable } from "@nestjs/common";
import { RpcException } from "@nestjs/microservices";
import { status as GrpcStatus } from "@grpc/grpc-js";
import * as argon2 from "argon2";
import jwt from "jsonwebtoken";
import { UsersService } from "../users/users.service.js";
// ── Token lifespans — business decisions, not environment config ──
const ACCESS_TOKEN_EXPIRY = "15m";
const REFRESH_TOKEN_EXPIRY = "7d";
let AuthService = class AuthService {
    usersService;
    accessTokenSecret;
    refreshTokenSecret;
    constructor(usersService) {
        this.usersService = usersService;
        const accessSecret = process.env.JWT_ACCESS_SECRET;
        const refreshSecret = process.env.JWT_REFRESH_SECRET;
        if (!accessSecret || !refreshSecret) {
            throw new Error("JWT_ACCESS_SECRET and JWT_REFRESH_SECRET must be set in the environment");
        }
        this.accessTokenSecret = accessSecret;
        this.refreshTokenSecret = refreshSecret;
    }
    async hashData(data) {
        return argon2.hash(data);
    }
    async getTokens(userId, username) {
        const [accessToken, refreshToken] = await Promise.all([
            new Promise((resolve, reject) => jwt.sign({ sub: userId, username }, this.accessTokenSecret, { expiresIn: ACCESS_TOKEN_EXPIRY }, (err, token) => (err || !token ? reject(err) : resolve(token)))),
            new Promise((resolve, reject) => jwt.sign({ sub: userId, username }, this.refreshTokenSecret, { expiresIn: REFRESH_TOKEN_EXPIRY }, (err, token) => (err || !token ? reject(err) : resolve(token)))),
        ]);
        return { accessToken, refreshToken };
    }
    async register(data) {
        const user = await this.usersService.create(data);
        const tokens = await this.getTokens(user.id, user.username);
        await this.usersService.updateRefreshToken(user.id, await this.hashData(tokens.refreshToken));
        return {
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                createdAt: user.createdAt.toISOString(),
            },
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
        };
    }
    async login(username, password) {
        const found = await this.usersService.findOneWithCredentials({ username });
        const passwordMatches = await argon2.verify(found.password, password);
        if (!passwordMatches) {
            throw new RpcException({
                code: GrpcStatus.UNAUTHENTICATED,
                message: "Invalid username or password",
            });
        }
        const tokens = await this.getTokens(found.id, found.username);
        const hashedRefreshToken = await this.hashData(tokens.refreshToken);
        await this.usersService.updateRefreshToken(found.id, hashedRefreshToken);
        return {
            user: {
                id: found.id,
                username: found.username,
                email: found.email,
                createdAt: found.createdAt.toISOString(),
            },
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
        };
    }
    async refreshTokens(userId, refreshToken) {
        const user = await this.usersService.findOneWithCredentials({ id: userId });
        if (!user.refreshToken) {
            throw new RpcException({
                code: GrpcStatus.UNAUTHENTICATED,
                message: "Access denied",
            });
        }
        const refreshTokenMatches = await argon2.verify(user.refreshToken, refreshToken);
        if (!refreshTokenMatches) {
            throw new RpcException({
                code: GrpcStatus.UNAUTHENTICATED,
                message: "Access denied",
            });
        }
        const tokens = await this.getTokens(user.id, user.username);
        const hashedRefreshToken = await this.hashData(tokens.refreshToken);
        await this.usersService.updateRefreshToken(user.id, hashedRefreshToken);
        return tokens;
    }
    async logout(refreshToken) {
        let decoded;
        try {
            decoded = jwt.verify(refreshToken, this.refreshTokenSecret);
        }
        catch {
            throw new RpcException({
                code: GrpcStatus.UNAUTHENTICATED,
                message: "Invalid refresh token",
            });
        }
        await this.usersService.updateRefreshToken(decoded.sub, null);
        return { message: "Logged out successfully" };
    }
    async validateAccessToken(accessToken) {
        try {
            const decoded = jwt.verify(accessToken, this.accessTokenSecret);
            return { valid: true, userId: decoded.sub, username: decoded.username };
        }
        catch {
            return { valid: false, userId: "", username: "" };
        }
    }
};
AuthService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [UsersService])
], AuthService);
export { AuthService };
