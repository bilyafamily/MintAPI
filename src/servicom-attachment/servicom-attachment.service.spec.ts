import { Test, TestingModule } from '@nestjs/testing';
import { ServicomAttachmentService } from './servicom-attachment.service';

describe('ServicomAttachmentService', () => {
  let service: ServicomAttachmentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ServicomAttachmentService],
    }).compile();

    service = module.get<ServicomAttachmentService>(ServicomAttachmentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
