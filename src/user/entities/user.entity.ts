import { Computer } from '../../computer/entities/computer.entity';
import { Sector } from '../../services/seeder/sector.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  firstname: string;

  @Column()
  lastname: string;

  @Column({ nullable: true })
  password: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true, default: false })
  isEnabled: boolean;

  @Column({ default: false })
  isTfaEnabled: boolean;

  @Column({ nullable: true })
  tfaSecret: string;

  @Column({ nullable: true })
  sectorId: string;

  @OneToMany(() => Sector, (sector) => sector.sector)
  sector: Sector;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Computer, (computer) => computer.user)
  computers: Computer[];

  @Column({ type: 'simple-array', nullable: true })
  roles: string[];
}
