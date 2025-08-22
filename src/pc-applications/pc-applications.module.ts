import { Module } from '@nestjs/common';
import { PcApplicationsService } from './pc-applications.service';
import { PcApplicationsController } from './pc-applications.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PcApplication } from './entities/pc-application.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PcApplication])],
  controllers: [PcApplicationsController],
  providers: [PcApplicationsService],
})
export class PcApplicationsModule {}
