import { Exclude } from 'class-transformer';

export class UserResponseDto {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
  isEnabled: boolean;
  isTfaEnabled: boolean;
  tfaSecret?: string | null;
  role: string;

  @Exclude()
  password: string;
}
