import { PartialType } from '@nestjs/swagger';
import { CreatePcApplicationDto } from './create-pc-application.dto';

export class UpdatePcApplicationDto extends PartialType(CreatePcApplicationDto) {}
