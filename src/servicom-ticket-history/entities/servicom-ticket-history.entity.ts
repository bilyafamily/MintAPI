import { ServicomTicket } from '../../servicom-ticket/entities/servicom-ticket.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity('servicom_ticket_history')
export class ServicomTicketHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  ticketId: string;

  @Column()
  action: string;

  @ManyToOne(() => ServicomTicket, (ticket) => ticket.ticketHistory)
  ticket: ServicomTicket;
}
