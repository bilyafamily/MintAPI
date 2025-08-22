import { IsEmail, IsString } from 'class-validator';

export class EmailDto {
  @IsString()
  body: string;

  @IsString()
  subject: string;

  @IsEmail()
  email: string;
}
