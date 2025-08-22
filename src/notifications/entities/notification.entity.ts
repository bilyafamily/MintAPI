import { Column, CreateDateColumn, PrimaryGeneratedColumn } from 'typeorm';
import { Entity } from 'typeorm/decorator/entity/Entity';

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column('text')
  message: string;

  @Column({ default: false })
  read: boolean;

  @Column({ nullable: true, default: 'message' })
  type: string;

  @Column()
  sender: string;

  @Column()
  recipientEmail: string;

  @Column({ nullable: true })
  additionalInfo: string;

  @Column()
  createdBy: string;

  @CreateDateColumn()
  createdAt: Date;
}
