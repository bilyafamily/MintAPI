import { PartialType } from '@nestjs/swagger';
import { CreateServicomTicketHistoryDto } from './create-servicom-ticket-history.dto';

export class UpdateServicomTicketHistoryDto extends PartialType(CreateServicomTicketHistoryDto) {}
