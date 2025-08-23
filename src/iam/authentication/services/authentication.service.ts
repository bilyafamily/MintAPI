import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { ConfigType } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { SchedulerRegistry } from '@nestjs/schedule';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { EmailService } from 'src/email/email.service';
import jwtConfig from 'src/iam/config/jwt.config';
import { RefreshTokenDto } from 'src/iam/dto/refresh-token.dto';
import { SignInDto } from 'src/iam/dto/sign-in.dto';
import { SignUpDto } from 'src/iam/dto/sign-up.dto';
import { InvalidateRefreshTokenError } from 'src/iam/error/invalidate-refresh-token-error';
import { UserCreatedEvent } from 'src/iam/events/user-created.event';
import { HashingService } from 'src/iam/hashing/hashing.service';
import { pgUniqueViolationErrorCode } from 'src/iam/iam.constants';
import { ActiveUserData } from 'src/iam/types/active-user-data.interface';
import { User } from 'src/user/entities/user.entity';
import { UserService } from 'src/user/user.service';
import { OtpAuthenticationService } from './otp-authentication.service';
import { ServicomTicketCloseNotificationEvent } from 'src/iam/events/ticket.event';

@Injectable()
export class AuthenticationService {
  private readonly logger = new Logger(AuthenticationService.name);
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    private readonly hashingService: HashingService,
    private readonly jwtService: JwtService,
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
    private readonly otpAuthService: OtpAuthenticationService,
    // private readonly refreshTokenIdsStorage: RefreshTokenIdsStorage,
    private readonly eventEmitter: EventEmitter2,
    private readonly emailService: EmailService,
    private readonly scheduleRegistry: SchedulerRegistry,
    private readonly userService: UserService,
  ) {}

  async signUp(signUp: SignUpDto): Promise<User> {
    try {
      const userExist = await this.userRepo.findOne({
        where: {
          email: signUp.email.toLowerCase(),
        },
      });

      if (userExist) {
        throw new ConflictException({
          statusCode: 409,
          message: 'Email address is already taken, please use another email',
        });
      }
      const user = new User();
      user.email = signUp.email.toLowerCase();
      user.password = await this.hashingService.hash(signUp.password);
      user.firstname = signUp.firstname.toLowerCase();
      user.lastname = signUp.lastname.toLowerCase();

      await this.userRepo.save(user);

      //Register the event emitter
      this.eventEmitter.emit(
        'user.created',
        new UserCreatedEvent(
          user.email,
          user.id,
          user.firstname,
          user.lastname,
        ),
      );

      //register connection
      // const establishedTimeOut = setTimeout(
      //   () => this.establishConnection(user.id),
      //   5000,
      // );
      // this.scheduleRegistry.addTimeout(
      //   `${user.id}_connection`,
      //   establishedTimeOut,
      // );

      return user;
    } catch (error) {
      if (error.code === pgUniqueViolationErrorCode) {
        throw new ConflictException({
          statusCode: 409,
          message: 'Email address is already taken, please use another email',
        });
      }
      throw new BadRequestException(error.message);
    }
  }

  @OnEvent('user.created', { async: true })
  async sendConfirmationEmail(userEvent: UserCreatedEvent) {
    //Generate JWT token
    const payload = { email: userEvent.email, sub: userEvent.id };
    const activationToken = await this.jwtService.signAsync(payload, {
      expiresIn: '1h',
    });

    const activationLink = `http://localhost:3000/activate-account?token=${activationToken}`;
    const name = userEvent.firstname + ' ' + userEvent.lastname;

    await this.emailService.sendAccountConfirmationEmail(
      userEvent.email,
      name,
      activationLink,
    );

    this.logger.log('Sending confirmation email to users');
  }

  @OnEvent('servicom-ticket-closed', { async: true })
  async sendServiceCloseTicketNotification(
    payload: ServicomTicketCloseNotificationEvent,
  ) {
    await this.emailService.sendServicomCloseTicketEmail(payload.ticket);

    this.logger.log('Sending confirmation email to users');
  }

  private establishConnection(userId: string) {
    this.logger.log('Establishing connection for user ' + userId);
  }

  async forgotPassword(email: string): Promise<string> {
    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new NotFoundException(`user not found`);
    }

    //Generate JWT token
    const payload = { email: user.email, sub: user.id };
    const resetToken = await this.jwtService.signAsync(payload, {
      expiresIn: '1h',
    });

    //Create resetLink
    const resetLink = `http://localhost:3000/reset-password?token=${resetToken}`;
    return resetLink;
  }

  async resendToken(email: string, verifyAccount: boolean) {
    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new NotFoundException(`user not found`);
    }

    //Generate JWT token
    const payload = { email: user.email, sub: user.id };
    const resetToken = await this.jwtService.signAsync(payload, {
      expiresIn: '1h',
    });
    let link = '';
    //Create resetLink
    if (verifyAccount) {
      link = `http://localhost:4200/auth/verify-account/${resetToken}`;
    } else {
      link = `http://localhost:4200/auth/forgot-password/${resetToken}`;
    }
    return link;
  }

  async validateToken(token: string) {
    try {
      return await this.jwtService.verifyAsync(token);
    } catch (error) {
      console.log(error);
      throw new BadRequestException('Invalid or expired token');
    }
  }

  async updatePassword(userId: string, newPassword: string): Promise<void> {
    const user = await this.userService.findOne(userId);

    if (user.email.toLowerCase().includes('@nmdpra.gov.ng')) {
      throw new BadRequestException('Password cannot be set for this account');
    }
    const hashedPassword = await this.hashingService.hash(newPassword);

    if (!user) {
      throw new NotFoundException(`user not found`);
    }
    user.password = hashedPassword;
    await this.userService.update(userId, user);
  }

  async activateAccount(userId: string): Promise<boolean> {
    const user = await this.userService.findOne(userId);

    if (!user) {
      throw new NotFoundException(`user not found`);
    }
    user.isEnabled = true;
    const response = await this.userService.update(userId, user);
    if (response) {
      return true;
    } else {
      return false;
    }
  }

  async signIn(signInDto: SignInDto) {
    const user = await this.userRepo.findOneBy({
      email: signInDto.email.toLowerCase(),
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email for password');
    }

    if (!user.password) {
      throw new UnauthorizedException('Invalid email for password');
    }

    const isEqual = await this.hashingService.compare(
      signInDto.password,
      user.password,
    );

    if (!isEqual) {
      throw new BadRequestException('Wrong email or password');
    }

    if (user.isTfaEnabled) {
      const isValid = this.otpAuthService.verifyCode(
        signInDto.tfaCode,
        user.tfaSecret,
      );

      if (!isValid) {
        throw new UnauthorizedException('Invalid 2FA code');
      }
    }

    return await this.generateTokens(user);
  }

  async generateTokens(user: User) {
    const refreshTokenId = randomUUID();
    const [accessToken, refreshToken] = await Promise.all([
      this.signToken<Partial<ActiveUserData>>(
        user.id,
        this.jwtConfiguration.accessTokenTtl,
        {
          unique_name: user.email,
          oid: user.id,
          name: `${user.firstname} ${user.lastname}`,
          roles: [...user.roles],
        },
      ),

      this.signToken<any>(user.id, this.jwtConfiguration.refreshTokenTtl, {
        refreshTokenId,
      }),

      //   await this.refreshTokenIdsStorage.insert(user.id, refreshTokenId),
    ]);

    return { accessToken, refreshToken };
  }

  async refreshTokens(refreshToken: RefreshTokenDto) {
    try {
      const { unique_name } = await this.jwtService.verifyAsync<
        Pick<ActiveUserData, 'unique_name'> & { refreshTokenId: string }
      >(refreshToken.refreshToken, {
        secret: this.jwtConfiguration.secret,
        audience: this.jwtConfiguration.audience,
        issuer: this.jwtConfiguration.issuer,
      });

      const user = await this.userRepo.findOneByOrFail({ email: unique_name });

      // console.log(refreshTokenId);
      // const isValid = await this.refreshTokenIdsStorage.validate(
      //   user.id,
      //   refreshTokenId,
      // );

      // if (isValid) {
      //   await this.refreshTokenIdsStorage.invalidate(user.id);
      // } else {
      //   throw new Error('Refresh token is invalid');
      // }

      return await this.generateTokens(user);
    } catch (error) {
      if (error instanceof InvalidateRefreshTokenError) {
        throw new UnauthorizedException('Access denied');
      }
      throw new UnauthorizedException(error);
    }
  }

  private async signToken<T>(userId: string, expiresIn: number, payload?: T) {
    return await this.jwtService.signAsync(
      {
        sub: userId,
        id: userId,
        ...payload,
      },
      {
        audience: this.jwtConfiguration.audience,
        issuer: this.jwtConfiguration.issuer,
        secret: this.jwtConfiguration.secret,
        expiresIn,
      },
    );
  }

  // @Cron(CronExpression.EVERY_6_MONTHS, { name: 'deleteInactiveUsers' })
  // deleteInactiveUsers() {
  //   this.logger.log('Deleting expired users');
  // }
}
