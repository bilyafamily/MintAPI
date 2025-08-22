import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('pc_applications')
export class PcApplication {
  @ApiProperty({ example: '1', description: 'PC applications Id' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ example: '1', description: 'PC applications name' })
  @Column({ unique: true })
  name: string;
}
