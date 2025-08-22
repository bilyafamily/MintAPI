import { Test, TestingModule } from '@nestjs/testing';
import { PcApplicationsService } from './pc-applications.service';

describe('PcApplicationsService', () => {
  let service: PcApplicationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PcApplicationsService],
    }).compile();

    service = module.get<PcApplicationsService>(PcApplicationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
