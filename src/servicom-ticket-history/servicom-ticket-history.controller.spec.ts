import { Test, TestingModule } from '@nestjs/testing';
import { ServicomTicketHistoryController } from './servicom-ticket-history.controller';
import { ServicomTicketHistoryService } from './servicom-ticket-history.service';

describe('ServicomTicketHistoryController', () => {
  let controller: ServicomTicketHistoryController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ServicomTicketHistoryController],
      providers: [ServicomTicketHistoryService],
    }).compile();

    controller = module.get<ServicomTicketHistoryController>(ServicomTicketHistoryController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
