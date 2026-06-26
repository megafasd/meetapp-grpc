import { Injectable } from "@nestjs/common";
import { createChannel, createClient, Channel, Client } from "nice-grpc";
import { GroupServiceDefinition } from "../generated/group.js";

@Injectable()
export class GroupClientService {
  private channel: Channel;
  private client: Client<typeof GroupServiceDefinition>;

  constructor() {
    this.channel = createChannel(process.env.GROUP_SERVICE_URL ?? "localhost:50052");
    this.client = createClient(GroupServiceDefinition, this.channel);
  }

  get instance() {
    return this.client;
  }
}