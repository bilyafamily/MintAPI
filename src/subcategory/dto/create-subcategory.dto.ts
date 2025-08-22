import { IsNumber, IsString } from 'class-validator';

export class CreateSubcategoryDto {
  @IsString()
  readonly name: string;

  @IsString()
  readonly categoryId: string;

  @IsNumber()
  slaHours: number;
}
