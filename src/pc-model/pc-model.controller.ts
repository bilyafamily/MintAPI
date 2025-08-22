import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
} from '@nestjs/common';
import { PcModelService } from './pc-model.service';
import { CreatePcModelDto } from './dto/create-pc-model.dto';
import { UpdatePcModelDto } from './dto/update-pc-model.dto';
import { Auth } from '../iam/authentication/decorators/auth.decorator';
import { AuthType } from 'src/iam/enums/auth-type.enum';

@Auth(AuthType.ApiKey, AuthType.AzureAd, AuthType.Bearer)
@Controller('pc-models')
export class PcModelController {
  constructor(private readonly pcModelService: PcModelService) {}

  @Post()
  create(@Body() createPcModelDto: CreatePcModelDto) {
    return this.pcModelService.create(createPcModelDto);
  }

  @Get()
  findAll() {
    return this.pcModelService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.pcModelService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updatePcModelDto: UpdatePcModelDto) {
    return this.pcModelService.update(id, updatePcModelDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.pcModelService.remove(id);
  }
}
