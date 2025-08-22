import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import * as jwksRsa from 'jwks-rsa';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AzureAdAuthenticationService extends PassportStrategy(
  Strategy,
  'azure-ad',
) {
  constructor(protected configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      audience: `api://${configService.get('AZURE_CLIENT_ID')}`,
      issuer: `https://sts.windows.net/${configService.get('AZURE_AD_TENANT_ID')}/`,
      algorithms: ['RS256'],
      ignoreExpiration: false,
      secretOrKeyProvider: jwksRsa.passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: `https://login.microsoftonline.com/${configService.get('AZURE_AD_TENANT_ID')}/discovery/v2.0/keys`,
      }),
    });
  }

  async validate(payload: any) {
    if (!payload.aud || !payload.iss || !payload.sub) {
      throw new Error('Invalid token payload');
    }
    return payload;
  }
}
