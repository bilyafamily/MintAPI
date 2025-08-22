import { Logger } from '@nestjs/common';
import { ServicomTicket } from '../../servicom-ticket/entities/servicom-ticket.entity';

export class ServicomTicketCloseNotificationEvent {
  private readonly logger = new Logger(
    ServicomTicketCloseNotificationEvent.name,
  );
  constructor(public readonly ticket: ServicomTicket) {}
}
