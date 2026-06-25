import { Injectable } from "@nestjs/common";
import { createChannel, createClient, Channel, Client } from "nice-grpc";
import { UserServiceDefinition } from "../generated/user.js";

@Injectable()
export class UserClientService {
  private channel: Channel;
  private client: Client<typeof UserServiceDefinition>;

  constructor() {
    this.channel = createChannel(process.env.USER_SERVICE_URL ?? "localhost:50051");
    this.client = createClient(UserServiceDefinition, this.channel);
  }

  async getUser(id: string) {
    return this.client.getUser({ id });
  }

  async validateAccessToken(accessToken: string) {
    return this.client.validateToken({ accessToken });
  }
}