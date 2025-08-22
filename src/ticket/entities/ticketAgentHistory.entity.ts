import {
  Column,
  Entity,
  //   JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Ticket } from './ticket.entity';

@Entity('ticketAgentHistory')
export class TicketAgentHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  assignedBy: string;

  @Column()
  agent: string;

  @Column()
  message: string;

  @Column({ nullable: false })
  ticketId: string;

  @ManyToOne(() => Ticket, (ticket) => ticket.agentHistory)
  //   @JoinColumn({ name: 'ticketId' })
  ticket: Ticket;

  @Column({ type: 'datetime2', default: () => 'CURRENT_TIMESTAMP' })
  assignedAt: Date;
}
