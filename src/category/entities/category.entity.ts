import { ApiProperty } from '@nestjs/swagger';
import { Subcategory } from '../../subcategory/entities/subcategory.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity('categories')
export class Category {
  @ApiProperty({ example: '1', description: 'Category Id' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ example: '1', description: 'Category name' })
  @Column({ unique: true })
  name: string;

  @OneToMany(() => Subcategory, (subcategory) => subcategory.category, {
    eager: true,
  })
  subcategories: Subcategory[];
}
