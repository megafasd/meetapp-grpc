var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Controller } from "@nestjs/common";
import { GrpcMethod, GrpcStreamMethod } from "@nestjs/microservices";
import { Observable, from } from "rxjs";
import { UsersService } from "./users.service.js";
let UsersController = class UsersController {
    usersService;
    constructor(usersService) {
        this.usersService = usersService;
    }
    async getUser(data) {
        const user = await this.usersService.findOne({ id: data.id });
        return { ...user, createdAt: user.createdAt.toISOString() };
    }
    async getUserByUsername(data) {
        const user = await this.usersService.findOne({ username: data.username });
        return { ...user, createdAt: user.createdAt.toISOString() };
    }
    async searchUsers(data) {
        const users = await this.usersService.search(data.query, data.excludeUserId);
        return { users };
    }
    async updateUser(data) {
        const user = await this.usersService.update(data.id, {
            username: data.username,
            password: data.password,
        });
        return { ...user, createdAt: user.createdAt.toISOString() };
    }
    async deleteUser(data) {
        return this.usersService.remove(data.id);
    }
    listUsers() {
        return from((async function* (usersService) {
            const users = await usersService.findAll();
            for (const user of users) {
                yield { ...user, createdAt: user.createdAt.toISOString() };
            }
        })(this.usersService));
    }
};
__decorate([
    GrpcMethod("UserService", "GetUser"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getUser", null);
__decorate([
    GrpcMethod("UserService", "GetUserByUsername"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getUserByUsername", null);
__decorate([
    GrpcMethod("UserService", "SearchUsers"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "searchUsers", null);
__decorate([
    GrpcMethod("UserService", "UpdateUser"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "updateUser", null);
__decorate([
    GrpcMethod("UserService", "DeleteUser"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "deleteUser", null);
__decorate([
    GrpcStreamMethod("UserService", "ListUsers"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Observable)
], UsersController.prototype, "listUsers", null);
UsersController = __decorate([
    Controller(),
    __metadata("design:paramtypes", [UsersService])
], UsersController);
export { UsersController };
