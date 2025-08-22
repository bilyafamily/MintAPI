import { Logger } from '@nestjs/common';
import { User } from '../../user/entities/user.entity';

export class UserCreatedEvent {
  private readonly logger = new Logger(UserCreatedEvent.name);
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly firstname: string,
    public readonly lastname: string,
  ) {}
}

export class UsersCreatedEvent {
  private readonly logger = new Logger(UserCreatedEvent.name);
  constructor(public readonly users: User[]) {}
}
