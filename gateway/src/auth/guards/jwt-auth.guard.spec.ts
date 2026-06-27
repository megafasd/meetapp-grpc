// src/auth/guards/jwt-auth.guard.spec.ts
import { jest, describe, it, expect, beforeEach } from "@jest/globals";
import { ExecutionContext, UnauthorizedException } from "@nestjs/common";
import { JwtAuthGuard } from "./jwt-auth.guard.js";
import { JwtVerifyService } from "../jwt-verify.service.js";

describe("JwtAuthGuard", () => {
  let guard: JwtAuthGuard;
  let mockJwtVerify: any;

  function createMockContext(headers: Record<string, string>): ExecutionContext {
    return {
      switchToHttp: () => ({
        getRequest: () => ({ headers }),
      }),
    } as any;
  }

  beforeEach(() => {
    mockJwtVerify = { verify: jest.fn() };
    guard = new JwtAuthGuard(mockJwtVerify);
  });

  it("rejects a request with no Authorization header", () => {
    const context = createMockContext({});

    expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
  });

  it("rejects a request with a malformed Authorization header (missing 'Bearer ')", () => {
    const context = createMockContext({ authorization: "NotBearer abc123" });

    expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
  });

  it("rejects a request with an invalid/expired token", () => {
    mockJwtVerify.verify.mockImplementation(() => {
      throw new Error("invalid token");
    });
    const context = createMockContext({ authorization: "Bearer fake-token" });

    expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
  });

  it("allows a request with a valid token and attaches user info to the request", () => {
    mockJwtVerify.verify.mockReturnValue({ userId: "user-1", username: "alice" });
    const request: any = { headers: { authorization: "Bearer valid-token" } };
    const context = {
      switchToHttp: () => ({ getRequest: () => request }),
    } as any;

    const result = guard.canActivate(context);

    expect(result).toBe(true);
    expect(request.user).toEqual({ userId: "user-1", username: "alice" });
  });
});