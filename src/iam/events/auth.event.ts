import { Logger } from '@nestjs/common';
import { User } from '../../user/entities/user.entity';

export class AuthResendToken {
  private readonly logger = new Logger(AuthResendToken.name);
  constructor(public readonly user: User) {}
}

export class ForgotPasswordEvent {
  private readonly logger = new Logger(AuthResendToken.name);
  constructor(public readonly user: User) {}
}

export class AccountVerificationEvent {
  constructor(public readonly email: string) {}
}
