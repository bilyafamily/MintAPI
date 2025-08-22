import { PartialType } from '@nestjs/swagger';
import { CreateServicomAttachmentDto } from './create-servicom-attachment.dto';

export class UpdateServicomAttachmentDto extends PartialType(CreateServicomAttachmentDto) {}
