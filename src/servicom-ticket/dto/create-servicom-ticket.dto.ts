import { IsString } from 'class-validator';

export class CreateServicomTicketDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsString()
  category: string;

  @IsString()
  userId: string;
}
