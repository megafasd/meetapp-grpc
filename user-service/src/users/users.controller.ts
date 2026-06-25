import { Controller } from "@nestjs/common";
import { GrpcMethod, GrpcStreamMethod } from "@nestjs/microservices";
import { Observable, from } from "rxjs";
import { UsersService } from "./users.service.js";

@Controller()
export class UsersController {
  constructor(private usersService: UsersService) {}

  @GrpcMethod("UserService", "GetUser")
  async getUser(data: { id: string }) {
    const user = await this.usersService.findOne({ id: data.id });
    return { ...user, createdAt: user.createdAt.toISOString() };
  }

  @GrpcMethod("UserService", "GetUserByUsername")
  async getUserByUsername(data: { username: string }) {
    const user = await this.usersService.findOne({ username: data.username });
    return { ...user, createdAt: user.createdAt.toISOString() };
  }

  @GrpcMethod("UserService", "SearchUsers")
  async searchUsers(data: { query: string; excludeUserId: string }) {
    const users = await this.usersService.search(data.query, data.excludeUserId);
    return { users };
  }

  @GrpcMethod("UserService", "UpdateUser")
  async updateUser(data: { id: string; username?: string; password?: string }) {
    const user = await this.usersService.update(data.id, {
      username: data.username,
      password: data.password,
    });
    return { ...user, createdAt: user.createdAt.toISOString() };
  }

  @GrpcMethod("UserService", "DeleteUser")
  async deleteUser(data: { id: string }) {
    return this.usersService.remove(data.id);
  }

  @GrpcStreamMethod("UserService", "ListUsers")
  listUsers(): Observable<any> {
    return from(
      (async function* (usersService: UsersService) {
        const users = await usersService.findAll();
        for (const user of users) {
          yield { ...user, createdAt: user.createdAt.toISOString() };
        }
      })(this.usersService)
    );
  }
}