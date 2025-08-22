import { Agent } from '../../agent/entities/agent.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity('locations')
export class Location {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 100, nullable: true })
  name: string;

  @OneToMany(() => Agent, (agent) => agent.location)
  agents: Agent[];
}
