import { IsNumber, IsOptional, IsString } from 'class-validator';

export class EscalateTicketDto {
  @IsString()
  ticketId: string;

  @IsOptional()
  @IsString()
  agentType: string;

  @IsOptional()
  @IsNumber()
  tierLevel: number;

  @IsOptional()
  @IsString()
  unit: string;

  @IsString()
  comment: string;
}
