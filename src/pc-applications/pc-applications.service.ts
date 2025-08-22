import {
  Body,
  Delete,
  Get,
  Injectable,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { CreatePcApplicationDto } from './dto/create-pc-application.dto';
import { UpdatePcApplicationDto } from './dto/update-pc-application.dto';
import { PcApplication } from './entities/pc-application.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class PcApplicationsService {
  constructor(
    @InjectRepository(PcApplication)
    private readonly pcApplicationRepo: Repository<PcApplication>,
  ) {}

  @Post()
  async create(@Body() data: CreatePcApplicationDto) {
    const newItem = this.pcApplicationRepo.create(data);
    await this.pcApplicationRepo.save(newItem);
    return newItem;
  }

  @Get()
  findAll() {
    return this.pcApplicationRepo.find();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.pcApplicationRepo.findOneBy({ id });
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updatePcModelDto: UpdatePcApplicationDto,
  ) {
    return this.pcApplicationRepo.update(id, updatePcModelDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.pcApplicationRepo.delete(id);
  }
}
