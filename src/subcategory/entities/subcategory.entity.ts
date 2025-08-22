import { ApiProperty } from '@nestjs/swagger';
import { Category } from '../../category/entities/category.entity';
import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Ticket } from 'src/ticket/entities/ticket.entity';

@Entity('subcategories')
export class Subcategory {
  @ApiProperty({ example: 1, description: 'Subcategory Id' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ example: 'xxxqqsss', description: 'Subcategory name' })
  @Column({ unique: true })
  name: string;

  @ApiProperty({ example: '', description: 'Subcategory name' })
  @Column()
  categoryId: string;

  @ApiProperty({ example: '2', description: 'Category SLA in minutes' })
  @Column({ nullable: true })
  slaHours: number;

  @ManyToOne(() => Category, (category) => category.subcategories)
  category: Category;

  @OneToMany(() => Ticket, (ticket) => ticket.subcategory)
  ticket: Ticket;
}
