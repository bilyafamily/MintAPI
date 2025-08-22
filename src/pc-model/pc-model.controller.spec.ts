import { Test, TestingModule } from '@nestjs/testing';
import { PcModelController } from './pc-model.controller';
import { PcModelService } from './pc-model.service';

describe('PcModelController', () => {
  let controller: PcModelController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PcModelController],
      providers: [PcModelService],
    }).compile();

    controller = module.get<PcModelController>(PcModelController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
