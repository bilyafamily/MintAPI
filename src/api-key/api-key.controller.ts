import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { ApiKeyService } from './api-key.service';
import { CreateApiKeyDto } from './dto/create-api-key.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthType } from '../iam/enums/auth-type.enum';
import { Auth } from '../iam/authentication/decorators/auth.decorator';
import { RevokeApiKeyDto } from './dto/remove-api-key.dto';
// import { UpdateApiKeyDto } from './dto/update-api-key.dto';

@ApiBearerAuth()
@Auth(AuthType.Bearer, AuthType.AzureAd, AuthType.None)
@ApiTags('API Keys')
@Controller('api-keys')
export class ApiKeyController {
  constructor(private readonly apiKeyService: ApiKeyService) {}

  @Post()
  create(@Body() createApiKeyDto: CreateApiKeyDto) {
    return this.apiKeyService.createAndHash(createApiKeyDto.name);
  }

  @Get()
  findAll() {
    return this.apiKeyService.findAll();
  }

  @Post('revokeKey')
  removeApiKey(@Body() payload: RevokeApiKeyDto) {
    return this.apiKeyService.revokeApiKey(payload.hashedKey);
  }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateApiKeyDto: UpdateApiKeyDto) {
  //   return this.apiKeyService.update(+id, updateApiKeyDto);
  // }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.apiKeyService.remove(id);
  }
}
