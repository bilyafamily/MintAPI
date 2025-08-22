import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { PcApplicationsService } from './pc-applications.service';
import { CreatePcApplicationDto } from './dto/create-pc-application.dto';
import { UpdatePcApplicationDto } from './dto/update-pc-application.dto';
import { Auth } from '../iam/authentication/decorators/auth.decorator';
import { AuthType } from '../iam/enums/auth-type.enum';

@Auth(AuthType.ApiKey, AuthType.AzureAd, AuthType.Bearer, AuthType.None)
@Controller('pc-applications')
export class PcApplicationsController {
  constructor(private readonly pcApplicationsService: PcApplicationsService) {}

  @Post()
  create(@Body() createPcApplicationDto: CreatePcApplicationDto) {
    return this.pcApplicationsService.create(createPcApplicationDto);
  }

  @Get()
  findAll() {
    return this.pcApplicationsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.pcApplicationsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updatePcApplicationDto: UpdatePcApplicationDto,
  ) {
    return this.pcApplicationsService.update(id, updatePcApplicationDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.pcApplicationsService.remove(id);
  }
}
