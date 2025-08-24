import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Department } from './entities/Department';
import { CommonService } from './common.service';
import { CommonController } from './common.controller';
import { GraphService } from './graph.service';

@Module({
  imports: [TypeOrmModule.forFeature([Department])],
  controllers: [CommonController],
  providers: [CommonService, GraphService],
  exports: [CommonService, GraphService],
})
export class CommonModule {}
