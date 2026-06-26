import { IsString, MinLength } from "class-validator";

export class LoginDto {
  @IsString()
  username!: string;

  @IsString()
  @MinLength(1, { message: "Password is required" })
  password!: string;
}