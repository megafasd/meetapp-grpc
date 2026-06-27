import { jest, describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from "@jest/globals";
import { Test, TestingModule } from "@nestjs/testing";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { generateKeyPairSync } from "crypto";
import * as argon2 from "argon2";
import { AuthService } from "./auth.service.js";
import { UsersService } from "../users/users.service.js";

describe("AuthService", () => {
  let service: AuthService;
  let mockUsersService: any;
  let tmpDir: string;

  beforeAll(() => {
    // Generate a real, throwaway RSA key pair and write it to real temp files
    const { privateKey, publicKey } = generateKeyPairSync("rsa", {
      modulusLength: 2048,
      publicKeyEncoding: { type: "spki", format: "pem" },
      privateKeyEncoding: { type: "pkcs8", format: "pem" },
    });

    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "jwt-test-"));
    const privateKeyPath = path.join(tmpDir, "jwt-private.pem");
    const publicKeyPath = path.join(tmpDir, "jwt-public.pem");

    fs.writeFileSync(privateKeyPath, privateKey);
    fs.writeFileSync(publicKeyPath, publicKey);

    process.env.JWT_PRIVATE_KEY_PATH = privateKeyPath;
    process.env.JWT_PUBLIC_KEY_PATH = publicKeyPath;
  });

  afterAll(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
    delete process.env.JWT_PRIVATE_KEY_PATH;
    delete process.env.JWT_PUBLIC_KEY_PATH;
  });

  beforeEach(async () => {
    mockUsersService = {
      create: jest.fn(),
      findOneWithCredentials: jest.fn(),
      updateRefreshToken: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe("login", () => {
    it("rejects an incorrect password", async () => {
      const hashedPassword = await argon2.hash("correct-password");
      mockUsersService.findOneWithCredentials.mockResolvedValue({
        id: "user-1",
        username: "alice",
        password: hashedPassword,
      });

      await expect(service.login("alice", "wrong-password")).rejects.toThrow();
    });

    it("issues an access token that expires in 15 minutes, not 7 days (the original bug)", async () => {
  const hashedPassword = await argon2.hash("correct-password");
  mockUsersService.findOneWithCredentials.mockResolvedValue({
    id: "user-1",
    username: "alice",
    email: "alice@example.com",
    password: hashedPassword,
    createdAt: new Date(),
  });
  mockUsersService.updateRefreshToken.mockResolvedValue({});

  const result = await service.login("alice", "correct-password");

  const payload = JSON.parse(
    Buffer.from(result.accessToken.split(".")[1], "base64").toString()
  );

  const lifespanSeconds = payload.exp - payload.iat;
  expect(lifespanSeconds).toBe(15 * 60);
});

it("hashes the refresh token before storing it (never stores it in plaintext)", async () => {
  const hashedPassword = await argon2.hash("correct-password");
  mockUsersService.findOneWithCredentials.mockResolvedValue({
    id: "user-1",
    username: "alice",
    email: "alice@example.com",
    password: hashedPassword,
    createdAt: new Date(),
  });
  mockUsersService.updateRefreshToken.mockResolvedValue({});

  const result = await service.login("alice", "correct-password");

  const [, storedHashedToken] = mockUsersService.updateRefreshToken.mock.calls[0];
  expect(storedHashedToken).not.toBe(result.refreshToken);
});
  });

  describe("logout", () => {
    it("rejects a tampered/invalid refresh token (the original unverified-decode bug)", async () => {
      await expect(service.logout("totally.fake.token")).rejects.toThrow();
    });
  });
});