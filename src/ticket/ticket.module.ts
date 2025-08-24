import { Module } from '@nestjs/common';
import { TicketService } from './services/ticket/ticket.service';
import { TicketController } from './ticket.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ticket } from './entities/ticket.entity';
import { CategoryService } from 'src/category/category.service';
import { Agent } from '../agent/entities/agent.entity';
import { EmailNotificationService } from '../services/notification/emailNotification.service';
import { NotificationGateway } from '../services/notification/notification.gateway';
import { Category } from '../category/entities/category.entity';
import { UserService } from '../user/user.service';
import { User } from '../user/entities/user.entity';
import { TicketAttachment } from './entities/ticket.attachment';
import { EscalationHistory } from './entities/escalationHistory.entity';
import { Comment } from '../comment/entities/comment.entity';
import { EmailService } from '../email/email.service';
import { Location } from '../location/entities/location.entity';
import { TicketAgentHistory } from './entities/ticketAgentHistory.entity';
import { Subcategory } from '../subcategory/entities/subcategory.entity';
import { SubcategoryService } from '../subcategory/subcategory.service';
import { GraphService } from '../common/graph.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Ticket,
      Agent,
      Category,
      User,
      TicketAttachment,
      EscalationHistory,
      Comment,
      Location,
      TicketAgentHistory,
      Subcategory,
    ]),
  ],
  controllers: [TicketController],
  providers: [
    TicketService,
    CategoryService,
    UserService,
    NotificationGateway,
    EmailNotificationService,
    EmailService,
    SubcategoryService,
    GraphService,
  ],
})
export class TicketModule {}
