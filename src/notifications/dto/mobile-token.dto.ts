import { IsString } from 'class-validator';

export class MobileTokenDto {
  @IsString()
  token: string;
}
