import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString, MinLength, MaxLength, Matches } from "class-validator";

export class RegisterDto {
  @ApiProperty({ example: "alice123", minLength: 3, maxLength: 20 })
  @IsString()
  @MinLength(3)
  @MaxLength(20)
  @Matches(/^[a-zA-Z0-9_]+$/)
  username!: string;

  @ApiProperty({ example: "alice@example.com" })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: "password123", minLength: 8 })
  @IsString()
  @MinLength(8)
  password!: string;
}