import { IsNotEmpty, IsPositive } from 'class-validator';

export class SignRefreshToken {
  @IsNotEmpty()
  userId: string;

  @IsNotEmpty()
  @IsPositive()
  refreshTokenTtl: number;

  refreshTokenId: any;
}
