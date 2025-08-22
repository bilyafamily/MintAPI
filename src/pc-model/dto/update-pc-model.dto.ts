import { PartialType } from '@nestjs/swagger';
import { CreatePcModelDto } from './create-pc-model.dto';

export class UpdatePcModelDto extends PartialType(CreatePcModelDto) {}
