import { Module } from '@nestjs/common';
import { AgentService } from './agent.service';
import { AgentController } from './agent.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Agent } from './entities/agent.entity';
import { Ticket } from '../ticket/entities/ticket.entity';
import { EscalationHistory } from '../ticket/entities/escalationHistory.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Agent, Ticket, EscalationHistory])],
  controllers: [AgentController],
  providers: [AgentService],
})
export class AgentModule {}
