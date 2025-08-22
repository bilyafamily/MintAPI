import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Department } from './entities/Department';
import { CommonService } from './common.service';
import { CommonController } from './common.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Department])],
  controllers: [CommonController],
  providers: [CommonService],
  exports: [CommonService],
})
export class CommonModule {}
