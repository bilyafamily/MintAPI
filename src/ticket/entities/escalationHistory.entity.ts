import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Ticket } from './ticket.entity';

@Entity('escalationHistory')
export class EscalationHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  escalatedBy: string;

  @Column({ nullable: true })
  comment: string;

  @Column()
  escalatedTo: string;

  @Column({ default: 1 })
  tier: number;

  @Column()
  time: Date;

  @Column()
  duration: number;

  @Column()
  ticketId: string;

  @ManyToOne(() => Ticket, (ticket) => ticket.escalationHistory)
  @JoinColumn({ name: 'ticketId' })
  ticket: Ticket;

  @Column({ type: 'datetime2', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({
    type: 'datetime2',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;
}
