import { Injectable, NotFoundException } from '@nestjs/common';
import {
  CreateNotificationDto,
  CreateUserNotificationDto,
} from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { Notification } from './entities/notification.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { NotificationCreatedEvent } from 'src/iam/events/notification.event';
import { MobileToken } from './entities/token.entity';
import { MobileTokenDto } from './dto/mobile-token.dto';
import { TrainingData } from 'src/types/trainingData';
import { TrainingNotificationEvent } from 'src/iam/events/training.event';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepo: Repository<Notification>,
    @InjectRepository(MobileToken)
    private readonly mobileTokenRepo: Repository<MobileToken>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async saveToken(token: MobileTokenDto, email: string) {
    const existingToken = await this.mobileTokenRepo.findOne({
      where: { email: email.toLowerCase() },
    });

    if (existingToken) {
      return;
    }

    const createdToken = this.mobileTokenRepo.create({
      token: token.token,
      email: email.toLowerCase(),
    });
    return this.mobileTokenRepo.save(createdToken);
  }

  async markAllRead(email: string) {
    const notifications = await this.notificationRepo.find({
      where: { recipientEmail: email.toLowerCase(), read: false },
    });

    if (!notifications || notifications.length === 0) {
      return;
    }

    const result = await this.notificationRepo.update(
      {
        recipientEmail: email.toLowerCase(),
        read: false,
      },
      { read: true },
    );

    return {
      message:
        result.affected > 0
          ? `${result.affected} notifications marked as read`
          : 'No unread notifications found',
      count: result.affected,
    };
  }

  async deleteAllNotifications(email: string) {
    const notifications = await this.notificationRepo.find({
      where: { recipientEmail: email.toLowerCase() },
    });

    if (!notifications || notifications.length === 0) {
      return;
    }

    const result = await this.notificationRepo.delete({
      recipientEmail: email.toLowerCase(),
    });

    return {
      message:
        result.affected > 0
          ? `${result.affected} notifications marked as read`
          : 'No unread notifications found',
      count: result.affected,
    };
  }

  async sendTrainingNotification(trainingData: TrainingData[]) {
    return this.eventEmitter.emit(
      'training.notification',
      new TrainingNotificationEvent(trainingData),
    );
  }

  async create(createNotificationDto: CreateNotificationDto, sender: string) {
    const tokens = await this.mobileTokenRepo.find();

    if (tokens.length === 0) {
      throw new NotFoundException('No mobile tokens found');
    }

    const notification = tokens.map((token) =>
      this.notificationRepo.create({
        ...createNotificationDto,
        recipientEmail: token.email,
        sender,
        createdBy: sender,
      }),
    );

    const response = await this.notificationRepo.save(notification);

    this.eventEmitter.emit(
      'notification.created',
      new NotificationCreatedEvent(response),
    );

    return response;
  }

  async createMany(
    createNotificationDto: CreateNotificationDto[],
    sender: string,
  ) {
    const notifications = this.notificationRepo.create(
      createNotificationDto.map((dto) => ({
        ...dto,
        createdBy: sender,
      })),
    );
    const response = this.notificationRepo.save(notifications);

    this.eventEmitter.emit(
      'notification.created',
      new NotificationCreatedEvent(notifications),
    );

    return response;
  }

  async createUserNotification(data: CreateUserNotificationDto) {
    const notifications = this.notificationRepo.create(
      data.RecipientEmail.map((email) => ({
        type: data.Type,
        title: data.Title,
        additionalInfo: data.AdditionalInfo,
        message: data.Message,
        sender: data.UserEmail,
        recipientEmail: email,
        createdBy: data.UserEmail,
      })),
    );
    const response = await this.notificationRepo.save(notifications);

    this.eventEmitter.emit(
      'user.notification',
      new NotificationCreatedEvent(notifications),
    );
    return response;
  }

  async createMulitpleNotification(data: CreateUserNotificationDto[]) {
    const notifications = this.notificationRepo.create(
      data.map((item) => ({
        type: item.Type,
        title: item.Title,
        additionalInfo: item.AdditionalInfo,
        message: item.Message,
        sender: item.UserEmail,
        recipientEmail: item.RecipientEmail ? item.RecipientEmail[0] : '',
        createdBy: item.UserEmail,
      })),
    );
    const response = await this.notificationRepo.save(notifications);

    this.eventEmitter.emit(
      'user.notification',
      new NotificationCreatedEvent(notifications),
    );
    return response;
  }

  async findAll() {
    return await this.notificationRepo.find({
      order: { createdAt: 'ASC' },
    });
  }

  async getAllMobileTokens() {
    return await this.mobileTokenRepo.find();
  }

  async getUserToken(userEmail: string) {
    return await this.mobileTokenRepo.findBy({
      email: userEmail.toLowerCase(),
    });
  }

  async markAsRead(id: number) {
    const notification = await this.findOne(id);
    notification.read = true;
    const response = await this.notificationRepo.save(notification);
    return response;
  }

  async findOne(id: number) {
    const notification = await this.notificationRepo.findOne({ where: { id } });
    if (!notification) {
      throw new NotFoundException(`Notification with id ${id} not found`);
    }

    return notification;
  }

  async findMyNotification(email: string) {
    const notifications = await this.notificationRepo.find({
      where: { recipientEmail: email },
      order: { createdAt: 'DESC' },
    });
    return notifications;
  }

  async update(id: number, updateNotificationDto: UpdateNotificationDto) {
    return await this.notificationRepo.update(id, updateNotificationDto);
  }

  remove(id: number) {
    return this.notificationRepo.delete(id);
  }
}
