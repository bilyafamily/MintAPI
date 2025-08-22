import { PartialType } from '@nestjs/swagger';
import { CreateServicomSmeDto } from './create-servicom-sme.dto';
import { IsString, IsOptional, IsEmail, IsBoolean } from 'class-validator';

export class UpdateServicomSmeDto extends PartialType(CreateServicomSmeDto) {
  @IsString()
  @IsOptional()
  firstname?: string;

  @IsString()
  @IsOptional()
  lastname?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  directorate?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
