import { IsString, MinLength, MaxLength, IsArray, IsUUID, ArrayMinSize } from "class-validator";

export class CreateGroupDto {
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  name!: string;

  @IsArray()
  @ArrayMinSize(0) // explicitly allow empty arrays
  @IsUUID("4", { each: true })
  memberIds!: string[];
}