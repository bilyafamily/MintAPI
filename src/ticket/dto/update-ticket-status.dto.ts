import { IsIn, IsString } from 'class-validator';

export class UpdateTicketStatusDto {
  @IsString()
  @IsIn(['Open', 'In Progress', 'Resolved'])
  status: string;
}
