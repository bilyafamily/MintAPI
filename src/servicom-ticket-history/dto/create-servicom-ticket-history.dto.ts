import { IsString } from 'class-validator';

export class CreateServicomTicketHistoryDto {
  @IsString()
  action: string;

  @IsString()
  ticketId: string;
}
