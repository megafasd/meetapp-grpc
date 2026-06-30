import { ApiProperty } from "@nestjs/swagger";
import { IsDateString } from "class-validator";

export class AddAvailabilityDto {
  @ApiProperty({ example: "2026-07-04", description: "Date in YYYY-MM-DD format" })
  @IsDateString()
  date!: string;
}