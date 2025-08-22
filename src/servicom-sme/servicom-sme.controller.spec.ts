import { Test, TestingModule } from '@nestjs/testing';
import { ServicomSmeController } from './servicom-sme.controller';
import { ServicomSmeService } from './servicom-sme.service';

describe('ServicomSmeController', () => {
  let controller: ServicomSmeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ServicomSmeController],
      providers: [ServicomSmeService],
    }).compile();

    controller = module.get<ServicomSmeController>(ServicomSmeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
