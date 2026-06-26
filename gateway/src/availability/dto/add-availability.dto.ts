import { IsDateString } from "class-validator";

export class AddAvailabilityDto {
  @IsDateString()
  date!: string;
}