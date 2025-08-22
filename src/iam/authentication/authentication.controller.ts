import {
  BadGatewayException,
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { JwtService } from '@nestjs/jwt';
import { ApiTags } from '@nestjs/swagger';
import { toFileStream } from 'qrcode';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { plainToInstance } from 'class-transformer';
import { EmailService } from 'src/email/email.service';
import { User } from 'src/user/entities/user.entity';
import { ActivateAccountDto } from '../dto/activate-account.dto';
import { ForgotPassword } from '../dto/forgot-password.dto';
import { PasswordResetDto } from '../dto/password-reset.dto';
import { RefreshTokenDto } from '../dto/refresh-token.dto';
import { SetPassword } from '../dto/setPassword.dto';
import { SignInDto } from '../dto/sign-in.dto';
import { SignUpDto } from '../dto/sign-up.dto';
import { AuthType } from '../enums/auth-type.enum';
import { UsersCreatedEvent } from '../events/user-created.event';
import { HashingService } from '../hashing/hashing.service';
import { AuthenticationService } from './services/authentication.service';
import { OtpAuthenticationService } from './services/otp-authentication.service';
import { ActiveUserData } from '../types/active-user-data.interface';
import { ActiveUser } from './decorators/active-user.decorator';
import { Auth } from './decorators/auth.decorator';
import { UserService } from '../../user/user.service';
import { UserResponseDto } from '../dto/user-response.dto';
import { ForgotPasswordEvent } from '../events/auth.event';

@ApiTags('Auth')
@Auth(AuthType.None)
@Controller('authentication')
export class AuthenticationController {
  constructor(
    private readonly authService: AuthenticationService,
    private readonly otpAuthServie: OtpAuthenticationService,
    private readonly userService: UserService,
    private readonly hashService: HashingService,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  @Post('register')
  async signUp(@Body() signUpDto: SignUpDto) {
    const user = await this.authService.signUp(signUpDto);
    return user;
  }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async signIn(
    // @Res({ passthrough: true }) response: Response,
    @Body() signInDto: SignInDto,
  ) {
    const response = await this.authService.signIn(signInDto);
    return response;
  }

  @HttpCode(HttpStatus.OK)
  @Post('refresh-tokens')
  refreshToken(@Body() refreshToken: RefreshTokenDto) {
    return this.authService.refreshTokens(refreshToken);
  }

  @HttpCode(HttpStatus.OK)
  @Post('forgot-password')
  async forgotPassword(@Body() payload: ForgotPassword): Promise<void> {
    const user = await this.userService.findByEmail(payload.email);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    this.eventEmitter.emit('forgot.password', new ForgotPasswordEvent(user));
  }

  @HttpCode(HttpStatus.OK)
  @Post('reset-password')
  async resetPassword(@Body() passwordReset: PasswordResetDto): Promise<void> {
    const payload = await this.authService.validateToken(passwordReset.token);
    if (!payload) {
      throw new BadGatewayException('Invalid or expired token');
    }
    return this.authService.updatePassword(
      payload.sub,
      passwordReset.newPassword,
    );
  }

  @HttpCode(HttpStatus.OK)
  @Post('activate-account')
  async activateAccount(
    @Body() activateAccount: ActivateAccountDto,
  ): Promise<boolean> {
    const payload = await this.authService.validateToken(activateAccount.token);
    if (!payload) {
      throw new BadGatewayException('Invalid or expired token');
    }
    return this.authService.activateAccount(payload.sub);
  }

  @HttpCode(HttpStatus.OK)
  @Get('verify-account/:token')
  async verifyToken(@Param('token') token: string): Promise<boolean> {
    const payload = await this.authService.validateToken(token);
    if (!payload) {
      return false;
    }
    return true;
  }

  @HttpCode(HttpStatus.OK)
  @Auth(AuthType.None)
  @Post('set-password')
  async setPassword(@Body() data: SetPassword) {
    const user = await this.userService.findOne(data.userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const hashPassword = await this.hashService.hash(data.password);
    user.password = hashPassword;
    this.userService.save(user);
    return plainToInstance(UserResponseDto, user);
  }

  @Auth(AuthType.None)
  @HttpCode(HttpStatus.OK)
  @Post('resend-verification-token')
  async resendToken(@Body() data: ForgotPassword) {
    const user = await this.userService.findByEmail(data.email);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const users: User[] = [];
    users.push(user);
    this.eventEmitter.emit('users.created', new UsersCreatedEvent(users));
  }

  @Auth(AuthType.Bearer)
  @HttpCode(HttpStatus.OK)
  @Post('2fa/generate')
  async generateQrCode(
    @ActiveUser() activeUser: ActiveUserData,
    @Res() response: Response,
  ) {
    const { secret, uri } = await this.otpAuthServie.generateSecret(
      activeUser.unique_name,
    );

    await this.otpAuthServie.enableTfaForUser(activeUser.unique_name, secret);

    response.type('png');
    return toFileStream(response, uri);
  }

  @OnEvent('forgot.password', { async: true })
  async resendTokenEvent(authData: ForgotPasswordEvent) {
    const { user } = authData;
    const name = user.firstname + ' ' + user.lastname;
    try {
      //Generate JWT token
      const payload = { email: user.email, sub: user.id };
      const token = await this.jwtService.signAsync(payload, {
        expiresIn: '1h',
      });
      const baseUrl = `http://localhost:4200/auth/forgot-password/${token}`;
      this.emailService.passwordResetEmail(user.email, name, baseUrl);
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  @OnEvent('users.created', { async: true })
  async userCreated(data: UsersCreatedEvent) {
    const { users } = data;
    try {
      for (let index = 0; index < users.length; index++) {
        const name = users[index].firstname + ' ' + users[index].lastname;
        //Generate JWT token
        const payload = { email: users[index].email, sub: users[index].id };
        const token = await this.jwtService.signAsync(payload, {
          expiresIn: '1h',
        });
        const baseUrl = `http://localhost:4200/auth/verify-account/${token}`;
        this.emailService.sendAccountConfirmationEmail(
          users[index].email,
          name,
          baseUrl,
        );
      }
    } catch (error) {}
  }
}
