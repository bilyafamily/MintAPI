import { Test, TestingModule } from '@nestjs/testing';
import { PcApplicationsController } from './pc-applications.controller';
import { PcApplicationsService } from './pc-applications.service';

describe('PcApplicationsController', () => {
  let controller: PcApplicationsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PcApplicationsController],
      providers: [PcApplicationsService],
    }).compile();

    controller = module.get<PcApplicationsController>(PcApplicationsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
