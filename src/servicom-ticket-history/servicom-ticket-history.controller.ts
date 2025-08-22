import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ServicomTicketHistoryService } from './servicom-ticket-history.service';
import { CreateServicomTicketHistoryDto } from './dto/create-servicom-ticket-history.dto';

@Controller('servicom-ticket-history')
export class ServicomTicketHistoryController {
  constructor(
    private readonly servicomTicketHistoryService: ServicomTicketHistoryService,
  ) {}

  @Post()
  create(
    @Body() createServicomTicketHistoryDto: CreateServicomTicketHistoryDto,
  ) {
    return this.servicomTicketHistoryService.create(
      createServicomTicketHistoryDto,
    );
  }

  @Get()
  findAll() {
    return this.servicomTicketHistoryService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.servicomTicketHistoryService.findOne(+id);
  }
}
