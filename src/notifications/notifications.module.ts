import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from './entities/notification.entity';
import { MobileToken } from './entities/token.entity';
import { NotificationCreatedListener } from './notification-created.listener';
import { EmailService } from './../email/email.service';
import { GraphService } from '../common/graph.service';
// import { EventEmitter2 } from '@nestjs/event-emitter';

@Module({
  imports: [TypeOrmModule.forFeature([Notification, MobileToken])],
  controllers: [NotificationsController],
  providers: [
    NotificationsService,
    NotificationCreatedListener,
    EmailService,
    GraphService,
  ],
})
export class NotificationsModule {}
