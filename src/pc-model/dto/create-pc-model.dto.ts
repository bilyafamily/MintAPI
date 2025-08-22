import { IsString } from 'class-validator';

export class CreatePcModelDto {
  @IsString()
  name: string;
}
