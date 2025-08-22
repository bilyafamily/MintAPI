import { Test, TestingModule } from '@nestjs/testing';
import { ServicomTicketService } from './servicom-ticket.service';

describe('ServicomTicketService', () => {
  let service: ServicomTicketService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ServicomTicketService],
    }).compile();

    service = module.get<ServicomTicketService>(ServicomTicketService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
