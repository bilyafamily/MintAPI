import { IsString, IsArray, IsOptional, IsNotEmpty } from 'class-validator';

export class CreateComputerDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  modelId: string;

  @IsString()
  @IsNotEmpty()
  serialNumber: string;

  @IsString()
  @IsNotEmpty()
  operatingSystem: string;

  @IsString()
  @IsOptional()
  domainName?: string;

  @IsArray()
  @IsOptional()
  applications?: string[];

  @IsString()
  @IsNotEmpty()
  departmentId: string;

  @IsString()
  @IsOptional()
  userId?: string;

  @IsOptional()
  assignedDate?: Date;
}
