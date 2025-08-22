import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { Expo } from 'expo-server-sdk';
import { NotificationCreatedEvent } from '../iam/events/notification.event';
import { NotificationsService } from './notifications.service';
import { TrainingNotificationEvent } from '../iam/events/training.event';
import { EmailService } from '../email/email.service';
import { Notification } from './entities/notification.entity';
import { MobileToken } from './entities/token.entity';

@Injectable()
export class NotificationCreatedListener {
  constructor(
    private readonly notificationService: NotificationsService,
    private emailService: EmailService,
  ) {}
  private readonly logger = new Logger(NotificationCreatedListener.name);
  private expo = new Expo({
    accessToken: process.env.MobileNotificationToken,
  });

  @OnEvent('notification.created', { async: true })
  async handleNotificationCreatedEvent(event: NotificationCreatedEvent) {
    const tokens = await this.notificationService.getAllMobileTokens();
    await this.sendMobileNotification(event.notifications, tokens);
  }

  @OnEvent('user.notification', { async: true })
  async handleUserNotificationEvent(event: NotificationCreatedEvent) {
    const messages = [];
    const tokensArray = await Promise.all(
      event.notifications.map((item) =>
        this.notificationService.getUserToken(item.recipientEmail),
      ),
    );

    for (let i = 0; i < event.notifications.length; i++) {
      const notification = event.notifications[i];
      const { title, message } = notification;
      const tokens = tokensArray[i];

      tokens.forEach((token) => {
        if (!Expo.isExpoPushToken(token.token)) {
          this.logger.warn(`Invalid Expo Push Token: ${token.token}`);
        }

        messages.push({
          to: token.token,
          sound: 'default',
          title: title,
          body: message,
          data: {
            screen: '/(protected)/(notification)',
            params: {
              additionalInfo: notification.additionalInfo,
              id: notification.id,
            },
          },
        });
      });
    }

    const chunks = this.expo.chunkPushNotifications(messages);

    for (const chunk of chunks) {
      try {
        const receipts = await this.expo.sendPushNotificationsAsync(chunk);
        console.log('Res', receipts);
        this.logger.log('Push receipts:', receipts);
      } catch (error) {
        this.logger.error('Failed to send push notifications:', error);
      }
    }
  }

  @OnEvent('training.notification', { async: true })
  async handleTrainingNotificationCreatedEvent(
    event: TrainingNotificationEvent,
  ) {
    for (const training of event.trainingData) {
      await this.emailService.sendTrainingNotification(training);
    }
  }

  private async sendMobileNotification(
    notifications: Notification[],
    tokens: MobileToken[],
  ) {
    const messages = [];

    for (const notification of notifications) {
      const { title, message } = notification;

      tokens.map((token) => {
        if (!Expo.isExpoPushToken(token.token)) {
          this.logger.warn(`Invalid Expo Push Token: ${token.token}`);
        }

        messages.push({
          to: token.token,
          sound: 'default',
          title: title,
          body: message,
          data: {
            screen: '/(protected)/(notification)',
            params: {
              additionalInfo: notification.additionalInfo,
              id: notification.id,
            },
          },
        });
      });
    }
    const chunks = this.expo.chunkPushNotifications(messages);

    for (const chunk of chunks) {
      try {
        const receipts = await this.expo.sendPushNotificationsAsync(chunk);
        console.log('Res', receipts);
        this.logger.log('Push receipts:', receipts);
      } catch (error) {
        this.logger.error('Failed to send push notifications:', error);
      }
    }
  }
}
