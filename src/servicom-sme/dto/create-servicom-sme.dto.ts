import { IsString, IsEmail } from 'class-validator';

export class CreateServicomSmeDto {
  @IsString()
  firstname: string;

  @IsString()
  lastname: string;

  @IsEmail()
  email: string;

  @IsString()
  directorate: string;
}
