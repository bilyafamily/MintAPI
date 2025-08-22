import { Test, TestingModule } from '@nestjs/testing';
import { PcModelService } from './pc-model.service';

describe('PcModelService', () => {
  let service: PcModelService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PcModelService],
    }).compile();

    service = module.get<PcModelService>(PcModelService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
