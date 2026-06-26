import { IsUUID, IsDateString } from "class-validator";

export class AddAvailabilityDto {
  @IsUUID()
  userId!: string;

  @IsDateString()
  date!: string;
}