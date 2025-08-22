import { Injectable } from '@nestjs/common';
import { CreateServicomAttachmentDto } from './dto/create-servicom-attachment.dto';
import { UpdateServicomAttachmentDto } from './dto/update-servicom-attachment.dto';

@Injectable()
export class ServicomAttachmentService {
  create(createServicomAttachmentDto: CreateServicomAttachmentDto) {
    return 'This action adds a new servicomAttachment';
  }

  findAll() {
    return `This action returns all servicomAttachment`;
  }

  findOne(id: number) {
    return `This action returns a #${id} servicomAttachment`;
  }

  update(id: number, updateServicomAttachmentDto: UpdateServicomAttachmentDto) {
    return `This action updates a #${id} servicomAttachment`;
  }

  remove(id: number) {
    return `This action removes a #${id} servicomAttachment`;
  }
}
