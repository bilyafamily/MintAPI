import { IsNumber, IsString } from 'class-validator';

export class CreateAgentDto {
  @IsNumber()
  tierLevel: number;

  @IsString()
  email: string;

  @IsString()
  locationId: string;
}
