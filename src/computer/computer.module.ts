import { Module } from '@nestjs/common';
import { ComputerService } from './computer.service';
import { ComputerController } from './computer.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Computer } from './entities/computer.entity';

import { Department } from 'src/common/entities/Department';
import { PcModel } from 'src/pc-model/entities/pc-model.entity';
import { User } from 'src/user/entities/user.entity';
import { ComputerMaintenance } from './entities/computer-maintenance.entity';
import { ComputerAssignmentHistory } from './entities/assignment-history.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Computer,
      Department,
      PcModel,
      User,
      ComputerMaintenance,
      ComputerAssignmentHistory,
    ]),
  ],
  controllers: [ComputerController],
  providers: [ComputerService],
  exports: [ComputerService],
})
export class ComputerModule {}
