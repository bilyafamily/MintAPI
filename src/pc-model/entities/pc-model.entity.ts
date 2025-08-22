import { ApiProperty } from '@nestjs/swagger';
import { Computer } from '../../computer/entities/computer.entity';
// import { Subcategory } from 'src/subcategory/entities/subcategory.entity';
import { PrimaryGeneratedColumn, Column, Entity, OneToMany } from 'typeorm';

@Entity('pc_models')
export class PcModel {
  @ApiProperty({ example: '1', description: 'PC Model Id' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ example: '1', description: 'PC Model name' })
  @Column({ unique: true })
  name: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  manufacturer: string;

  @OneToMany(() => Computer, (computer) => computer.model)
  computers: Computer[];
}
