import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ServicomAttachmentService } from './servicom-attachment.service';
import { CreateServicomAttachmentDto } from './dto/create-servicom-attachment.dto';
import { UpdateServicomAttachmentDto } from './dto/update-servicom-attachment.dto';

@Controller('servicom-attachment')
export class ServicomAttachmentController {
  constructor(private readonly servicomAttachmentService: ServicomAttachmentService) {}

  @Post()
  create(@Body() createServicomAttachmentDto: CreateServicomAttachmentDto) {
    return this.servicomAttachmentService.create(createServicomAttachmentDto);
  }

  @Get()
  findAll() {
    return this.servicomAttachmentService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.servicomAttachmentService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateServicomAttachmentDto: UpdateServicomAttachmentDto) {
    return this.servicomAttachmentService.update(+id, updateServicomAttachmentDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.servicomAttachmentService.remove(+id);
  }
}
