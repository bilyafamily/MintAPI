import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('feedbacks')
export class Feedback {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  message: string;

  @Column({ nullable: false })
  title: string;
}
