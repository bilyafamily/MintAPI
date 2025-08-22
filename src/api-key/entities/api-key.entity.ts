// import { User } from '../../user/entities/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  BeforeInsert,
} from 'typeorm';
@Entity()
export class ApiKey {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  hashedKey: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  revokedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @CreateDateColumn()
  expiredAt: Date;

  @BeforeInsert()
  setExpirationDate() {
    const now = new Date();
    this.expiredAt = new Date(now.setMonth(now.getMonth() + 6));
  }

  //   @ManyToOne(() => User, (user) => user.apiKeys)
  //   user: User;
}
