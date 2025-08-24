import { User } from 'src/user/entities/user.entity';
import { Department } from '../../common/entities/Department';
import { PcModel } from '../../pc-model/entities/pc-model.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
  OneToMany,
} from 'typeorm';
import { ComputerMaintenance } from './computer-maintenance.entity';
import { ComputerAssignmentHistory } from './assignment-history.entity';

@Entity('computers')
export class Computer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @ManyToOne(() => PcModel, { eager: true })
  @JoinColumn({ name: 'modelId' })
  model: PcModel;

  @Column({ name: 'modelId' })
  modelId: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  serialNumber: string;

  @Column({ type: 'varchar', length: 100 })
  operatingSystem: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  domainName: string;

  @Column({ type: 'simple-array', nullable: true })
  applications: string[];

  @ManyToOne(() => Department, { eager: true })
  @JoinColumn({ name: 'departmentId' })
  department: Department;

  @Column({ name: 'departmentId' })
  departmentId: string;

  @ManyToOne(() => User, { eager: true, nullable: true })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ name: 'userId', nullable: true })
  userId: string;

  @Column({ type: 'date', nullable: true })
  assignedDate: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'datetime2' })
  endOfLife: Date;

  @OneToMany(() => ComputerMaintenance, (maintenance) => maintenance.computer, {
    eager: true,
  })
  maintenanceRecords: ComputerMaintenance[];

  @OneToMany(() => ComputerAssignmentHistory, (history) => history.computer, {
    eager: true,
  })
  assignmentHistory: ComputerAssignmentHistory[];

  @BeforeInsert()
  setEndOfLife() {
    const now = new Date();
    now.setFullYear(now.getFullYear() + 5);
    this.endOfLife = now;
  }
}
