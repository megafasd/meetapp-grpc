import { IsString, MinLength, MaxLength, Matches, IsOptional } from "class-validator";

export class UpdateUserDto {
  @IsString()
  id!: string;

  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(20)
  @Matches(/^[a-zA-Z0-9_]+$/)
  username?: string;

  @IsOptional()
  @IsString()
  @MinLength(8)
  password?: string;
}