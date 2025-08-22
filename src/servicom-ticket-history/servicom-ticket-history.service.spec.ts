import { Test, TestingModule } from '@nestjs/testing';
import { ServicomTicketHistoryService } from './servicom-ticket-history.service';

describe('ServicomTicketHistoryService', () => {
  let service: ServicomTicketHistoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ServicomTicketHistoryService],
    }).compile();

    service = module.get<ServicomTicketHistoryService>(ServicomTicketHistoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
