import { Module } from '@nestjs/common';
import { ServicomTicketHistoryService } from './servicom-ticket-history.service';
import { ServicomTicketHistoryController } from './servicom-ticket-history.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServicomTicketHistory } from './entities/servicom-ticket-history.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ServicomTicketHistory])],
  controllers: [ServicomTicketHistoryController],
  providers: [ServicomTicketHistoryService],
})
export class ServicomTicketHistoryModule {}
