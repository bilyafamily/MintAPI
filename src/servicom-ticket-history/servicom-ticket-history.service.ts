import { Injectable } from '@nestjs/common';
import { CreateServicomTicketHistoryDto } from './dto/create-servicom-ticket-history.dto';
import { UpdateServicomTicketHistoryDto } from './dto/update-servicom-ticket-history.dto';

@Injectable()
export class ServicomTicketHistoryService {
  create(createServicomTicketHistoryDto: CreateServicomTicketHistoryDto) {
    return 'This action adds a new servicomTicketHistory';
  }

  findAll() {
    return `This action returns all servicomTicketHistory`;
  }

  findOne(id: number) {
    return `This action returns a #${id} servicomTicketHistory`;
  }

  update(id: number, updateServicomTicketHistoryDto: UpdateServicomTicketHistoryDto) {
    return `This action updates a #${id} servicomTicketHistory`;
  }

  remove(id: number) {
    return `This action removes a #${id} servicomTicketHistory`;
  }
}
