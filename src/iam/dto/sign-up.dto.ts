import { IsEmail, IsString, MinLength } from 'class-validator';

export class SignUpDto {
  @IsEmail()
  @IsString()
  email: string;

  @MinLength(10)
  password: string;

  @IsString()
  firstname: string;

  @IsString()
  lastname: string;
}
