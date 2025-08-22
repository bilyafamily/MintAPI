import { Module } from '@nestjs/common';
import { PcModelService } from './pc-model.service';
import { PcModelController } from './pc-model.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PcModel } from './entities/pc-model.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PcModel])],
  controllers: [PcModelController],
  providers: [PcModelService],
})
export class PcModelModule {}
