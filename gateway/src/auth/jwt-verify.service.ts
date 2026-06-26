// gateway/src/auth/jwt-verify.service.ts
import { Injectable } from "@nestjs/common";
import * as fs from "fs";
import * as path from "path";
import jwt from "jsonwebtoken";

@Injectable()
export class JwtVerifyService {
  private readonly publicKey: string;

  constructor() {
    this.publicKey = fs.readFileSync(
      path.join(import.meta.dirname, "../../../certs/jwt-public.pem"),
      "utf8"
    );
  }

  verify(token: string): { userId: string; username: string } {
    const decoded = jwt.verify(token, this.publicKey, { algorithms: ["RS256"] }) as {
      sub: string;
      username: string;
    };
    return { userId: decoded.sub, username: decoded.username };
  }
}