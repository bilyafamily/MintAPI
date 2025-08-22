import { Test, TestingModule } from '@nestjs/testing';
import { ServicomTicketController } from './servicom-ticket.controller';
import { ServicomTicketService } from './servicom-ticket.service';

describe('ServicomTicketController', () => {
  let controller: ServicomTicketController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ServicomTicketController],
      providers: [ServicomTicketService],
    }).compile();

    controller = module.get<ServicomTicketController>(ServicomTicketController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
