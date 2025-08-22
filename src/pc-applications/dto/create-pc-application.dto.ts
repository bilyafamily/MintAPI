import { IsString } from 'class-validator';

export class CreatePcApplicationDto {
  @IsString()
  name: string;
}
