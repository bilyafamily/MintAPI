import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Computer } from './computer.entity';
import { User } from 'src/user/entities/user.entity';

@Entity('computer_maintenance')
export class ComputerMaintenance {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Computer, (computer) => computer.maintenanceRecords)
  computer: Computer;

  @Column()
  computerId: string;

  @Column({ type: 'datetime2' })
  maintenanceDate: Date;

  @Column({ type: 'float' })
  cost: number;

  @ManyToOne(() => User, { nullable: true })
  user: User;

  @Column({ nullable: true })
  userId: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
