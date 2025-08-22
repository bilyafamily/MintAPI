import { Module } from '@nestjs/common';
import { FAQService } from './faq.service';
import { FaqController } from './faq.controller';
import { FAQ } from './entities/faq.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([FAQ])],
  controllers: [FaqController],
  providers: [FAQService],
})
export class FaqModule {}
