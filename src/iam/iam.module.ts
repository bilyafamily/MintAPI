import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApiKey } from 'src/api-key/entities/api-key.entity';
import { User } from 'src/user/entities/user.entity';
import jwtConfig from './config/jwt.config';
import { AuthenticationController } from './authentication/authentication.controller';
import { BcryptService } from './hashing/bcrypt.service';
import { HashingService } from './hashing/hashing.service';
import { APP_GUARD } from '@nestjs/core';
import { AuthenticationGuard } from './authentication/guards/authentication.guard';
import { EmailService } from 'src/email/email.service';
import { AccessTokenGuard } from './authentication/guards/access-token.guard';
import { ApiKeyGuard } from './authentication/guards/api-key.guard';
import { AzureAdGuard } from './authentication/guards/azure-ad.guard';
import { RoleGuard } from './authentication/guards/role.guard';

import { UserService } from '../user/user.service';

import { ApiKeyService } from '../api-key/api-key.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AzureAdAuthenticationService } from './authentication/services/azure-ad-authentication.service';
import { AuthenticationService } from './authentication/services/authentication.service';
import { OtpAuthenticationService } from './authentication/services/otp-authentication.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, ApiKey]),
    JwtModule.registerAsync(jwtConfig.asProvider()),
    ConfigModule.forFeature(jwtConfig),
  ],
  providers: [
    BcryptService,
    { provide: HashingService, useClass: BcryptService },
    {
      provide: APP_GUARD,
      useClass: AuthenticationGuard,
    },
    AccessTokenGuard,
    ApiKeyGuard,
    AzureAdGuard,
    RoleGuard,
    AzureAdAuthenticationService,
    ApiKeyService,
    EmailService,
    UserService,
    AuthenticationService,
    OtpAuthenticationService,
    EventEmitter2,
  ],
  controllers: [AuthenticationController],
})
export class IamModule {}
