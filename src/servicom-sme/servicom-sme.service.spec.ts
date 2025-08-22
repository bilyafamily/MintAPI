import { Test, TestingModule } from '@nestjs/testing';
import { ServicomSmeService } from './servicom-sme.service';

describe('ServicomSmeService', () => {
  let service: ServicomSmeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ServicomSmeService],
    }).compile();

    service = module.get<ServicomSmeService>(ServicomSmeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
