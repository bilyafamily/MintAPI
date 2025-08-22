import { Logger } from '@nestjs/common';
import { Notification } from '../../notifications/entities/notification.entity';

export class NotificationCreatedEvent {
  private readonly logger = new Logger(NotificationCreatedEvent.name);
  constructor(public readonly notifications: Notification[]) {}
}
