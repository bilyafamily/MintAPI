import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { SerivcomAttachment } from '../../servicom-attachment/entities/servicom-attachment.entity';
import { ServicomSme } from 'src/servicom-sme/entities/servicom-sme.entity';
import { ServicomTicketHistory } from 'src/servicom-ticket-history/entities/servicom-ticket-history.entity';

@Entity('servicom_tickets')
export class ServicomTicket {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column()
  ticketRef: string;

  @Column({
    default: 'complaint',
  })
  category: string;

  @Column({ nullable: true })
  smeId: string;

  @ManyToOne(() => ServicomSme, { eager: true })
  @JoinColumn({ name: 'smeId' })
  sme: ServicomSme;

  @Column()
  userId: string;

  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ nullable: true })
  assignedBy: string;

  @Column({ nullable: true, type: 'datetime2' })
  assignedAt: Date;

  @Column({ default: 'Admin' })
  currentDesk: string;

  @Column({ type: 'varchar', default: 'unassigned' })
  status: string;

  @Column({ type: 'nvarchar', length: 'MAX', nullable: true })
  resolution: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'datetime2', nullable: true })
  resolvedAt: Date;

  @OneToMany(() => SerivcomAttachment, (attachment) => attachment.ticket)
  attachements: SerivcomAttachment[];

  @OneToMany(() => ServicomTicketHistory, (history) => history.ticket)
  ticketHistory: ServicomTicketHistory[];
}
