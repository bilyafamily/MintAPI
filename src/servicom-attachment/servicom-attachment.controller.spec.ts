import { Test, TestingModule } from '@nestjs/testing';
import { ServicomAttachmentController } from './servicom-attachment.controller';
import { ServicomAttachmentService } from './servicom-attachment.service';

describe('ServicomAttachmentController', () => {
  let controller: ServicomAttachmentController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ServicomAttachmentController],
      providers: [ServicomAttachmentService],
    }).compile();

    controller = module.get<ServicomAttachmentController>(ServicomAttachmentController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
