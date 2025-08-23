import { IsString } from 'class-validator';

export class EscalateTicketDto {
  @IsString()
  ticketId: string;

  @IsString()
  escalatedBy: string;

  @IsString()
  comment: string;
}
