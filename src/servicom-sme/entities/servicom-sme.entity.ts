import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('servicom_smes')
export class ServicomSme {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  firstname: string;

  @Column()
  lastname: string;

  @Column()
  email: string;

  @Column()
  directorate: string;

  @Column({ default: true })
  isActive: boolean;
}
