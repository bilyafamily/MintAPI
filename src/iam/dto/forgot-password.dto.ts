import { IsString } from 'class-validator';

export class ForgotPassword {
  @IsString()
  email: string;
}
