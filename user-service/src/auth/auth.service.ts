import { Injectable } from "@nestjs/common";
import { RpcException } from "@nestjs/microservices";
import { status as GrpcStatus } from "@grpc/grpc-js";
import * as fs from "fs";
import * as path from "path";
import * as argon2 from "argon2";
import jwt from "jsonwebtoken";
import { UsersService } from "../users/users.service.js";

const ACCESS_TOKEN_EXPIRY = "15m";
const REFRESH_TOKEN_EXPIRY = "7d";

@Injectable()
export class AuthService {
  private readonly privateKey: string;
  private readonly publicKey: string;

  constructor(private usersService: UsersService) {
    const privateKeyPath =
      process.env.JWT_PRIVATE_KEY_PATH ??
      path.join(import.meta.dirname, "../../../../certs/jwt-private.pem");
    const publicKeyPath =
      process.env.JWT_PUBLIC_KEY_PATH ??
      path.join(import.meta.dirname, "../../../../certs/jwt-public.pem");

    try {
      this.privateKey = fs.readFileSync(privateKeyPath, "utf8");
      this.publicKey = fs.readFileSync(publicKeyPath, "utf8");
    } catch {
      throw new Error(
        `JWT key pair not found at ${privateKeyPath} / ${publicKeyPath}`
      );
    }
  }

  private async hashData(data: string) {
    return argon2.hash(data);
  }

  private async getTokens(userId: string, username: string) {
    const [accessToken, refreshToken] = await Promise.all([
      new Promise<string>((resolve, reject) =>
        jwt.sign(
          { sub: userId, username },
          this.privateKey,
          { algorithm: "RS256", expiresIn: ACCESS_TOKEN_EXPIRY },
          (err, token) => (err || !token ? reject(err) : resolve(token))
        )
      ),
      new Promise<string>((resolve, reject) =>
        jwt.sign(
          { sub: userId, username },
          this.privateKey,
          { algorithm: "RS256", expiresIn: REFRESH_TOKEN_EXPIRY },
          (err, token) => (err || !token ? reject(err) : resolve(token))
        )
      ),
    ]);

    return { accessToken, refreshToken };
  }

  async register(data: { username: string; email: string; password: string }) {
    const user = await this.usersService.create(data);
    const tokens = await this.getTokens(user.id, user.username);
    await this.usersService.updateRefreshToken(
      user.id,
      await this.hashData(tokens.refreshToken)
    );

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

  async login(username: string, password: string) {
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

  async refreshTokens(userId: string, refreshToken: string) {
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

  async logout(refreshToken: string) {
    let decoded: { sub: string };
    try {
      decoded = jwt.verify(refreshToken, this.publicKey, { algorithms: ["RS256"] }) as { sub: string };
    } catch {
      throw new RpcException({ code: GrpcStatus.UNAUTHENTICATED, message: "Invalid refresh token" });
    }
    await this.usersService.updateRefreshToken(decoded.sub, null);
    return { message: "Logged out successfully" };
  }

  async validateAccessToken(accessToken: string) {
    try {
      const decoded = jwt.verify(accessToken, this.publicKey, { algorithms: ["RS256"] }) as {
        sub: string;
        username: string;
      };
      return { valid: true, userId: decoded.sub, username: decoded.username };
    } catch {
      return { valid: false, userId: "", username: "" };
    }
  }
}