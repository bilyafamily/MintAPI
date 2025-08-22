import { Ticket } from '../../ticket/entities/ticket.entity';
import { Location } from '../../location/entities/location.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';

@Entity('agents')
export class Agent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  email: string;

  @Column({ type: 'bit', default: false })
  isActive: boolean;

  @Column({ default: 'agent' })
  agentType: string;

  @Column({ nullable: true })
  locationId: string;

  @ManyToOne(() => Location, { eager: true })
  @JoinColumn({ name: 'locationId' })
  location: Location;

  @Column({ default: 1 })
  tierLevel: number;

  @Column({ default: 0 })
  totalRatings: number;

  @Column({ default: 0 })
  averageRating: number;

  @Column({ type: 'int', default: 0 })
  ticket_count: number;

  @OneToMany(() => Ticket, (ticket) => ticket.agent)
  tickets: Ticket[];

  @Column({ type: 'datetime2', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({
    type: 'datetime2',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;
}
