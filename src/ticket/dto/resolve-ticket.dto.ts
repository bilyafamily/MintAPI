import { IsString } from 'class-validator';

export class ResolveTicketDto {
  @IsString()
  ticketId: string;

  @IsString()
  comment: string;
}
