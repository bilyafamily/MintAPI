import { ServicomTicket } from '../../servicom-ticket/entities/servicom-ticket.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('servicom_attachments')
export class SerivcomAttachment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  ticketId: string;

  @Column()
  fileUrl: string;

  @ManyToOne(() => ServicomTicket, (ticket) => ticket.attachements)
  @JoinColumn({ name: 'ticketId' })
  ticket: ServicomTicket;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
