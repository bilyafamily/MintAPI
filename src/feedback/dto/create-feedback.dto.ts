import { IsOptional, IsString } from 'class-validator';

export class CreateFeedbackDto {
  @IsString()
  message: string;

  @IsString()
  @IsOptional()
  id: string;
}
