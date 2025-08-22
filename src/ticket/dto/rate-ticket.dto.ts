import { IsNumber, IsString } from 'class-validator';

export class RateTicketDto {
  @IsString()
  ticketId: string;

  @IsNumber()
  rating: number;

  @IsString()
  feedback: string;
}
