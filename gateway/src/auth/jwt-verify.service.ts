import { Injectable } from "@nestjs/common";
import * as fs from "fs";
import * as path from "path";
import jwt from "jsonwebtoken";

@Injectable()
export class JwtVerifyService {
  private readonly publicKey: string;

  constructor() {
    this.publicKey = process.env.JWT_PUBLIC_KEY ?? this.readKeyFile(
    process.env.JWT_PUBLIC_KEY_PATH ??
    path.join(import.meta.dirname, "../../../certs/jwt-public.pem")
    );
  }

  private readKeyFile(filePath: string): string {
    try {
      return fs.readFileSync(filePath, "utf8");
    } catch {
      throw new Error(`JWT public key not found at ${filePath}, and no JWT_PUBLIC_KEY env var set`);
    }
  }

  verify(token: string): { userId: string; username: string } {
    const decoded = jwt.verify(token, this.publicKey, { algorithms: ["RS256"] }) as {
      sub: string;
      username: string;
    };
    return { userId: decoded.sub, username: decoded.username };
  }
}