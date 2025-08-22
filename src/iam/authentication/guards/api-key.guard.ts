import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { ApiKeyService } from '../../../api-key/api-key.service';
import { REQUEST_USER_KEY } from '../../../iam/iam.constants';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private readonly apiKeyService: ApiKeyService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const apiKey = this.extractKeyFromHeader(request);

    if (!apiKey) {
      throw new UnauthorizedException();
    }

    try {
      const apiKeyId = this.apiKeyService.extractIdFromApiKey(apiKey);

      const isValid = await this.apiKeyService.validate(apiKeyId, apiKey);

      if (!isValid) {
        throw new UnauthorizedException('Invalid API key');
      }

      request[REQUEST_USER_KEY] = apiKeyId;
      // request[REQUEST_USER_KEY] = {
      //   sub: apiKeyEntity.user.id,
      //   email: apiKeyEntity.user.email,
      //   firstname: apiKeyEntity.user.firstname,
      //   lastname: apiKeyEntity.user.lastname,
      //   roles: [apiKeyEntity.user.role],
      // } as ActiveUserData;
      return true;
    } catch (error) {
      throw new UnauthorizedException(error);
    }
    return true;
  }

  private extractKeyFromHeader(request: Request): string | undefined {
    const [type, key] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? key : undefined;
  }
}
