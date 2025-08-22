import { Module } from '@nestjs/common';
import { ServicomTicketService } from './servicom-ticket.service';
import { ServicomTicketController } from './servicom-ticket.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServicomTicket } from './entities/servicom-ticket.entity';
import { ServicomTicketHistory } from '../servicom-ticket-history/entities/servicom-ticket-history.entity';
import { SerivcomAttachment } from '../servicom-attachment/entities/servicom-attachment.entity';
import { User } from '../user/entities/user.entity';
import { EmailService } from '../email/email.service';
import { ServicomSme } from '../servicom-sme/entities/servicom-sme.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ServicomTicket,
      ServicomTicketHistory,
      SerivcomAttachment,
      User,
      ServicomSme,
    ]),
  ],
  controllers: [ServicomTicketController],
  providers: [ServicomTicketService, EmailService],
})
export class ServicomTicketModule {}
