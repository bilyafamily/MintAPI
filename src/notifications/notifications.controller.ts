import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ValidationPipe,
  UsePipes,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import {
  CreateNotificationDto,
  CreateUserNotificationDto,
} from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { ActiveUser } from '../iam/authentication/decorators/active-user.decorator';
import { ActiveUserData } from '../iam/types/active-user-data.interface';
import { AuthType } from '../iam/enums/auth-type.enum';
import { Auth } from '../iam/authentication/decorators/auth.decorator';
import { MobileTokenDto } from './dto/mobile-token.dto';
import { TrainingData } from 'src/types/trainingData';

@Controller('notifications')
@Auth(AuthType.AzureAd)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post('saveToken')
  saveMobileToken(
    @Body() createNotificationDto: MobileTokenDto,
    @ActiveUser() user: ActiveUserData,
  ) {
    return this.notificationsService.saveToken(
      createNotificationDto,
      user.unique_name,
    );
  }
  @Post('markAllRead')
  markAllRead(@ActiveUser() user: ActiveUserData) {
    return this.notificationsService.markAllRead(user.unique_name);
  }

  @Post()
  create(
    @Body() createNotificationDto: CreateNotificationDto,
    @ActiveUser() user: ActiveUserData,
  ) {
    return this.notificationsService.create(
      createNotificationDto,
      user.unique_name,
    );
  }

  @Post('bulk')
  createUsersNotification(
    @Body() createNotificationDto: CreateNotificationDto[],
    @ActiveUser() user: ActiveUserData,
  ) {
    return this.notificationsService.createMany(
      createNotificationDto,
      user.unique_name,
    );
  }

  @Get('myNotifications')
  getMyNotification(@ActiveUser() user: ActiveUserData) {
    return this.notificationsService.findMyNotification(user.unique_name);
  }

  @Get()
  findAll() {
    return this.notificationsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.notificationsService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateNotificationDto: UpdateNotificationDto,
  ) {
    return this.notificationsService.update(+id, updateNotificationDto);
  }

  @Patch(':id/markAsRead')
  markAsRead(@Param('id') id: string) {
    return this.notificationsService.markAsRead(+id);
  }

  @Delete('deleteAll')
  deleteAllMessages(@ActiveUser() user: ActiveUserData) {
    return this.notificationsService.deleteAllNotifications(user.unique_name);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.notificationsService.remove(+id);
  }

  @Post('send-training-email')
  @Auth(AuthType.ApiKey)
  sendTrainingNotification(@Body() trainingData: TrainingData[]) {
    return this.notificationsService.sendTrainingNotification(trainingData);
  }

  @Post('send-mobile-notification')
  @Auth(AuthType.ApiKey)
  sendUserNotification(@Body() data: CreateUserNotificationDto) {
    console.log(data);
    return this.notificationsService.createUserNotification(data);
  }

  @Post('send-multiple-notifications')
  @UsePipes(new ValidationPipe({ transform: true }))
  @Auth(AuthType.ApiKey)
  sendMulitipleNotification(@Body() data: CreateUserNotificationDto[]) {
    return this.notificationsService.createMulitpleNotification(data);
  }

  // @OnEvent('notification.created', { async: true })
  // async handleNotificationCreatedEvent(event: NotificationCreatedEvent) {
  //   const messages = [];
  //   const tokens = await this.notificationsService.getAllMobileTokens();

  //   console.log('Tokens:', tokens);

  //   console.log('Received Notification Created Event:', event);

  //   for (const notification of event.notifications) {
  //     const { title, message } = notification;

  //     tokens.map((token) => {
  //       if (!Expo.isExpoPushToken(token.token)) {
  //         this.logger.warn(`Invalid Expo Push Token: ${token.token}`);
  //       }

  //       messages.push({
  //         to: token.token,
  //         sound: 'default',
  //         title: title,
  //         body: message,
  //         data: {
  //           actionUrl: notification.actionUrl,
  //           additionalInfo: notification.additionalInfo,
  //         },
  //       });
  //     });
  //   }

  //   const chunks = this.expo.chunkPushNotifications(messages);

  //   console.log('Chunks:', chunks);

  //   for (const chunk of chunks) {
  //     try {
  //       const receipts = await this.expo.sendPushNotificationsAsync(chunk);
  //       this.logger.log('Push receipts:', receipts);
  //     } catch (error) {
  //       this.logger.error('Failed to send push notifications:', error);
  //     }
  //   }
  // }
}
