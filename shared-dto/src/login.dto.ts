import { ApiProperty } from "@nestjs/swagger";
import { IsString, MinLength } from "class-validator";

export class LoginDto {
  @ApiProperty({ example: "alice123" })
  @IsString()
  username!: string;

  @ApiProperty({ example: "password123" })
  @IsString()
  @MinLength(1, { message: "Password is required" })
  password!: string;
}