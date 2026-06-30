import { ApiProperty } from "@nestjs/swagger";
import { IsString, MinLength, MaxLength, IsArray, IsUUID } from "class-validator";

export class CreateGroupDto {
  @ApiProperty({ example: "Weekend Hangout Crew", minLength: 1, maxLength: 50 })
  @IsString()
  @MinLength(1, { message: "Group name is required" })
  @MaxLength(50, { message: "Group name must be at most 50 characters" })
  name!: string;

  @ApiProperty({
    example: ["f47ac10b-58cc-4372-a567-0e02b2c3d479"],
    description: "User IDs to invite as members (the creator is added automatically)",
    type: [String],
  })
  @IsArray()
  @IsUUID("4", { each: true })
  memberIds!: string[];
}