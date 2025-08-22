import { Module } from '@nestjs/common';
import { ServicomAttachmentService } from './servicom-attachment.service';
import { ServicomAttachmentController } from './servicom-attachment.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SerivcomAttachment } from './entities/servicom-attachment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SerivcomAttachment])],
  controllers: [ServicomAttachmentController],
  providers: [ServicomAttachmentService],
})
export class ServicomAttachmentModule {}
