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

@Entity('computer_assignment_history')
export class ComputerAssignmentHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Computer, (computer) => computer.assignmentHistory)
  computer: Computer;

  @Column()
  computerId: string;

  @ManyToOne(() => User)
  user: User;

  @Column()
  userId: string;

  @Column({ type: 'datetime2' })
  assignedDate: Date;

  @Column({ type: 'datetime2', nullable: true })
  unassignedDate: Date;

  @Column({ type: 'int', nullable: true })
  duration: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
