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
import { Category } from '../../category/entities/category.entity';
import { Agent } from '../../agent/entities/agent.entity';
import { User } from '../../user/entities/user.entity';
import { Location } from '../../location/entities/location.entity';
import { Comment } from '../../comment/entities/comment.entity';
import { TicketAttachment } from './ticket.attachment';
import { EscalationHistory } from './escalationHistory.entity';
import { Subcategory } from '../../subcategory/entities/subcategory.entity';
import { TicketAgentHistory } from './ticketAgentHistory.entity';

@Entity('tickets')
export class Ticket {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ nullable: true })
  ticketRef: string;

  @ManyToOne(() => Location, { eager: true })
  @JoinColumn({ name: 'locationId' })
  location: Location;

  @Column({ nullable: true })
  categoryId: string;

  @ManyToOne(() => Category, { eager: true })
  @JoinColumn({ name: 'categoryId' })
  category: Category;

  @Column({ nullable: true })
  subcategoryId: string;

  @ManyToOne(() => Subcategory, { eager: true })
  @JoinColumn({ name: 'subcategoryId' })
  subcategory: Subcategory;

  @Column()
  userId: string;

  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ nullable: true, type: 'datetime2' })
  assignedAt: Date;

  @Column({ nullable: false, default: 1 })
  escalationTier: number;

  @Column({ nullable: true, default: new Date().toLocaleDateString() })
  resolutionStartTime: Date;

  @Column({ default: 'Helpdesk' })
  currentDesk: string;

  @Column({ nullable: true })
  resolutionEndTime: Date;

  @Column({ nullable: true })
  resolutionDuration: number;

  @OneToMany(
    () => EscalationHistory,
    (esclationHistory) => esclationHistory.ticket,
    { eager: true },
  )
  escalationHistory: EscalationHistory[];

  @OneToMany(() => TicketAgentHistory, (agentHistory) => agentHistory.ticket, {
    eager: true,
  })
  agentHistory: TicketAgentHistory[];

  @Column({ nullable: true })
  agentId: string;

  @ManyToOne(() => Agent, { eager: true, nullable: true })
  @JoinColumn({ name: 'agentId' })
  agent: Agent;

  @Column({ type: 'nvarchar', length: 'MAX', nullable: true })
  resolution: string;

  @Column({ type: 'varchar', default: 'in_progress' })
  status: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'datetime2', nullable: true })
  resolvedAt: Date;

  @Column({ type: 'datetime2', nullable: true })
  sla_deadline: Date;

  @Column({ type: 'bit', default: false })
  sla_breached: boolean;

  @Column({ type: 'bit', default: false })
  is_escalated: boolean;

  @Column({ type: 'datetime2', nullable: true })
  escalation_time: Date;

  @Column({ type: 'datetime2', nullable: true })
  admin_escalation_time: Date;

  @Column({ nullable: true })
  rating: number;

  @Column({ nullable: true, type: 'text' })
  feedback: string;

  @Column({ nullable: true })
  ratedAt: Date;

  @OneToMany(() => Comment, (comment) => comment.ticket)
  comments: Comment[];

  @OneToMany(
    () => TicketAttachment,
    (ticketAttachment) => ticketAttachment.ticket,
    { eager: true },
  )
  ticketAttachments: TicketAttachment[];
}
