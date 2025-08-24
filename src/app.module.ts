import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CategoryModule } from './category/category.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import typeorm from './config/typeorm';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MailerModule } from '@nestjs-modules/mailer';
import { EjsAdapter } from '@nestjs-modules/mailer/dist/adapters/ejs.adapter';
import { join } from 'path';
import { EmailService } from './email/email.service';
import { SeederModule } from './services/seeder/seeder.module';
import { FeedbackModule } from './feedback/feedback.module';
import { TicketModule } from './ticket/ticket.module';
import { AgentModule } from './agent/agent.module';
import { UserModule } from './user/user.module';
import { LocationModule } from './location/location.module';
import { EmailNotificationService } from './services/notification/emailNotification.service';
import { NotificationGateway } from './services/notification/notification.gateway';
import { ScheduleModule } from '@nestjs/schedule';
import { CommentModule } from './comment/comment.module';
import { IamModule } from './iam/iam.module';
import { ApiKeyModule } from './api-key/api-key.module';
import { SubcategoryModule } from './subcategory/subcategory.module';
// import { SeederService } from './services/seeder/seeder.service';
import { CommonModule } from './common/common.module';
import { ComputerModule } from './computer/computer.module';
import { PcApplicationsModule } from './pc-applications/pc-applications.module';
import { PcModelModule } from './pc-model/pc-model.module';
import { FaqModule } from './faq/faq.module';
import { NotificationsModule } from './notifications/notifications.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ServicomTicketModule } from './servicom-ticket/servicom-ticket.module';
import { ServicomAttachmentModule } from './servicom-attachment/servicom-attachment.module';
import { ServicomSmeModule } from './servicom-sme/servicom-sme.module';
import { ServicomTicketHistoryModule } from './servicom-ticket-history/servicom-ticket-history.module';
import { GraphService } from './common/graph.service';
// import { SeederService } from './services/seeder/seeder.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [typeorm],
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) =>
        configService.get('typeorm'),
    }),
    MailerModule.forRoot({
      transport: {
        host: process.env.SMTPHost,
        port: process.env.SMTPPort,
        secure: false,
        auth: {
          user: process.env.SMTPUserName,
          pass: process.env.SMTPUserPassword,
        },
      },
      defaults: {
        from: '"NMDPRA NO-REPLY" <nmdpra-no-reply@nmdpra.gov.ng>',
      },
      template: {
        dir: join(__dirname, 'email', 'templates'),
        adapter: new EjsAdapter(),
        options: {
          strict: false,
        },
      },
    }),
    CategoryModule,
    FeedbackModule,
    TicketModule,
    AgentModule,
    UserModule,
    LocationModule,
    ScheduleModule.forRoot(),
    EventEmitterModule.forRoot(),
    CommentModule,
    IamModule,
    ApiKeyModule,
    SubcategoryModule,
    SeederModule,
    FaqModule,
    NotificationsModule,
    ServicomTicketModule,
    ServicomAttachmentModule,
    ServicomSmeModule,
    ServicomTicketHistoryModule,
    PcModelModule,
    PcApplicationsModule,
    ComputerModule,
    CommonModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    EmailService,
    EmailNotificationService,
    NotificationGateway,
    GraphService,
  ],
})
export class AppModule {
  //  implements OnApplicationBootstrap
  // constructor(private readonly seederService: SeederService) {}
  // async onApplicationBootstrap() {
  //   console.log('Starting seeding process...');
  //   await this.seederService.seed();
  //   console.log('Seeding completed!');
  // }
}
