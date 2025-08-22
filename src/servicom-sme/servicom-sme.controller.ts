import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ServicomSmeService } from './servicom-sme.service';
import { CreateServicomSmeDto } from './dto/create-servicom-sme.dto';
import { UpdateServicomSmeDto } from './dto/update-servicom-sme.dto';
import { Auth } from '../iam/authentication/decorators/auth.decorator';
import { AuthType } from 'src/iam/enums/auth-type.enum';

@Auth(AuthType.ApiKey)
@Controller('servicom-sme')
export class ServicomSmeController {
  constructor(private readonly servicomSmeService: ServicomSmeService) {}

  @Post()
  create(@Body() createServicomSmeDto: CreateServicomSmeDto) {
    return this.servicomSmeService.create(createServicomSmeDto);
  }

  @Get()
  findAll() {
    return this.servicomSmeService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.servicomSmeService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateServicomSmeDto: UpdateServicomSmeDto,
  ) {
    return this.servicomSmeService.update(id, updateServicomSmeDto);
  }

  @Patch(':id/toggle-status')
  toggleStatus(@Param('id') id: string) {
    console.log('PATCH', id);
    return this.servicomSmeService.toggleStatus(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.servicomSmeService.remove(id);
  }
}
