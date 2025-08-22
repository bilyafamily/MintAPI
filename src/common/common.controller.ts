import { Controller, Get } from '@nestjs/common';

import { Auth } from 'src/iam/authentication/decorators/auth.decorator';
import { AuthType } from 'src/iam/enums/auth-type.enum';
import { CommonService } from './common.service';

@Auth(AuthType.ApiKey, AuthType.AzureAd, AuthType.Bearer)
@Controller('common')
export class CommonController {
  constructor(private readonly commonService: CommonService) {}

  @Get('departments')
  findAll() {
    return this.commonService.getDepartments();
  }
}
