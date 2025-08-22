import { IsEmail, IsNumberString, IsOptional, IsString } from 'class-validator';

export class SignInDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;

  @IsOptional()
  @IsNumberString()
  tfaCode?: string;
}
