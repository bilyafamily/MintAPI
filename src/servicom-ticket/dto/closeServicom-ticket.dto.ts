import { IsString } from 'class-validator';

export class CloseServicomTicketDto {
  @IsString()
  comment: string;

  @IsString()
  ticketId: string;
}
