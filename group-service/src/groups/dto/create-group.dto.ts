import { IsString, MinLength, MaxLength, IsArray, IsUUID } from "class-validator";

export class CreateGroupDto {
  @IsString()
  @MinLength(1, { message: "Group name is required" })
  @MaxLength(50, { message: "Group name must be at most 50 characters" })
  name!: string;

  @IsUUID()
  creatorUserId!: string;

  @IsArray()
  @IsUUID("4", { each: true })
  memberIds!: string[];
}