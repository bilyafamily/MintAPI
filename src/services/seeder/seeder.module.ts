import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeederService } from './seeder.service';
import { Category } from '../../category/entities/category.entity';
import { User } from '../../user/entities/user.entity';
import { Location } from '../../location/entities/location.entity';
import { Region } from '../../location/entities/regiion.entity';
import { Sector } from './sector.entity';
import { Subcategory } from '../../subcategory/entities/subcategory.entity';
import { Agent } from '../../agent/entities/agent.entity';
import { Department } from '../../common/entities/Department';
import { Ticket } from '../../ticket/entities/ticket.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Category,
      User,
      Location,
      Region,
      Sector,
      Subcategory,
      Agent,
      Department,
      Ticket,
    ]),
  ],
  providers: [SeederService],
  exports: [SeederService],
})
export class SeederModule {}
