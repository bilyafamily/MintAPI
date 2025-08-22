import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ComputerService } from './computer.service';
import { CreateComputerDto } from './dto/create-computer.dto';
import { UpdateComputerDto } from './dto/update-computer.dto';
import { Auth } from 'src/iam/authentication/decorators/auth.decorator';
import { AuthType } from 'src/iam/enums/auth-type.enum';

@Auth(AuthType.None)
@Controller('computers')
export class ComputerController {
  constructor(private readonly computerService: ComputerService) {}

  @Post()
  create(@Body() createComputerDto: CreateComputerDto) {
    return this.computerService.create(createComputerDto);
  }

  @Get()
  findAll() {
    return this.computerService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.computerService.findOne(id);
  }

  @Get('serial/:serialNumber')
  findBySerialNumber(@Param('serialNumber') serialNumber: string) {
    return this.computerService.findBySerialNumber(serialNumber);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateComputerDto: UpdateComputerDto,
  ) {
    return this.computerService.update(id, updateComputerDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.computerService.remove(id);
  }
}
