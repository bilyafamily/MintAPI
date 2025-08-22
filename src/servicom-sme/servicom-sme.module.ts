import { Module } from '@nestjs/common';
import { ServicomSmeService } from './servicom-sme.service';
import { ServicomSmeController } from './servicom-sme.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServicomSme } from './entities/servicom-sme.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ServicomSme])],
  controllers: [ServicomSmeController],
  providers: [ServicomSmeService],
})
export class ServicomSmeModule {}
