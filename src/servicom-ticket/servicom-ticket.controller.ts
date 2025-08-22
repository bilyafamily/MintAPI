import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  MaxFileSizeValidator,
  FileTypeValidator,
  ParseFilePipe,
  UploadedFiles,
  UseInterceptors,
  Put,
  Query,
} from '@nestjs/common';
import { ServicomTicketService } from './servicom-ticket.service';
import { AssignSmeDto } from './dto/assign-sme.dto';
import { CloseServicomTicketDto } from './dto/closeServicom-ticket.dto';
import { Auth } from '../iam/authentication/decorators/auth.decorator';
import { AuthType } from 'src/iam/enums/auth-type.enum';
import { FilesInterceptor } from '@nestjs/platform-express';
import * as multer from 'multer';

@Auth(AuthType.ApiKey)
@Controller('servicom-ticket')
export class ServicomTicketController {
  constructor(private readonly servicomTicketService: ServicomTicketService) {}

  @Post()
  @UseInterceptors(
    FilesInterceptor('files', 10, { storage: multer.memoryStorage() }),
  )
  create(
    @Body() createTicketDto: any,
    @UploadedFiles(
      new ParseFilePipe({
        fileIsRequired: false,
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
          new FileTypeValidator({
            fileType: /^(image\/jpeg|image\/png|application\/pdf)$/,
          }),
        ],
      }),
    )
    files: Express.Multer.File[] | undefined,
  ) {
    return this.servicomTicketService.create(createTicketDto, files);
  }

  @Get()
  findAll() {
    return this.servicomTicketService.findAll();
  }

  @Get('myDesk')
  async myDesk(@Query() query: any) {
    const { email } = query;
    return this.servicomTicketService.findMyDesk(email);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.servicomTicketService.findOne(id);
  }

  @Get('my-tickets/:id')
  findMyTickets(@Param('id') id: string) {
    return this.servicomTicketService.findMyTickets(id);
  }

  @Put(':id/assigne-sme')
  update(@Param('id') id: string, @Body() data: AssignSmeDto) {
    return this.servicomTicketService.assigneSme(id, data);
  }

  @Put(':id/closeTicket')
  closeTicket(@Param('id') id: string, @Body() data: CloseServicomTicketDto) {
    return this.servicomTicketService.closeTicket(id, data);
  }
}
