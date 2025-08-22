import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateAgentDto } from './dto/create-agent.dto';
import { UpdateAgentDto } from './dto/update-agent.dto';
import { Agent } from './entities/agent.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ticket } from '../ticket/entities/ticket.entity';
import { TicketStatus } from '../types/ticketStatus.enum';
import { EscalationHistory } from 'src/ticket/entities/escalationHistory.entity';

@Injectable()
export class AgentService {
  constructor(
    @InjectRepository(Agent) private agentRepo: Repository<Agent>,
    @InjectRepository(Ticket) private ticketRepository: Repository<Ticket>,
    @InjectRepository(EscalationHistory)
    private escalationRepository: Repository<EscalationHistory>,
  ) {}

  async create(createAgentDto: CreateAgentDto) {
    try {
      const agent = new Agent();
      agent.email = createAgentDto.email;
      agent.locationId = createAgentDto.locationId.toLowerCase();
      agent.tierLevel = createAgentDto.tierLevel;

      switch (agent.tierLevel) {
        case 1:
          agent.agentType = 'agent';
          break;
        case 2:
          agent.agentType = 'supervisor';
          break;
        case 3:
          agent.agentType = 'sme';
          break;
        default:
          agent.agentType = 'vendor';
          break;
      }

      const newAgent = this.agentRepo.create(agent);
      const result = await this.agentRepo.save(newAgent);

      return result;
    } catch (error) {
      console.log(error);
      if (error.code === '23505') {
        throw new BadRequestException('Agent name already exists');
      }
      throw new InternalServerErrorException('Failed to create agent');
    }
  }

  async findAll(): Promise<Agent[]> {
    try {
      return await this.agentRepo.find({
        relations: {
          tickets: true,
          location: true,
        },
      });
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch categories');
    }
  }

  async findOne(id: string): Promise<Agent> {
    try {
      const agent = await this.agentRepo.findOne({
        where: { id: id.toLowerCase() },
      });
      if (!agent) {
        throw new NotFoundException(`Agent with ID ${id} not found`);
      }
      return agent;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to fetch category');
    }
  }

  async toggleStatus(id: string): Promise<Agent> {
    try {
      const agent = await this.agentRepo.findOne({
        where: { id: id.toLowerCase() },
      });
      if (!agent) {
        throw new NotFoundException(`Agent with ID ${id} not found`);
      }

      agent.isActive = !agent.isActive;
      // await this.agentRepo.update(id, agent);
      await this.agentRepo.save(agent);
      return agent;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to fetch category');
    }
  }

  async update(id: string, updateAgentDto: UpdateAgentDto) {
    try {
      const agent = await this.agentRepo.findOne({ where: { id } });
      if (!agent) {
        throw new NotFoundException(`Agent with ID ${id} not found`);
      }

      switch (agent.tierLevel) {
        case 1:
          agent.agentType = 'agent';
          break;
        case 2:
          agent.agentType = 'supervisor';
          break;
        case 3:
          agent.agentType = 'sme';
          break;
        default:
          agent.agentType = 'vendor';
          break;
      }

      const response = this.agentRepo.update(
        {
          id,
        },
        updateAgentDto,
      );
      return response;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      if (error.code === '23505') {
        throw new BadRequestException('Agent name already exists');
      }
      throw new InternalServerErrorException('Failed to update category');
    }
  }

  remove(id: number) {
    return `This action removes a #${id} agent`;
  }

  async getAgentStatistics() {
    const agents = await this.agentRepo.find({ relations: ['location'] });

    const agentStats = await Promise.all(
      agents.map(async (agent) => {
        const totalTicketsAssigned = await this.ticketRepository.count({
          where: { agent: { id: agent.id } },
        });

        // Get tickets resolved
        const ticketsResolved = await this.ticketRepository.count({
          where: { agent: { id: agent.id }, status: 'Closed' },
        });

        // Get average resolution time
        const avgResolutionTime = await this.ticketRepository
          .createQueryBuilder('ticket')
          .select('AVG(ticket.resolutionDuration)', 'avgResolutionTime')
          .where('ticket.agentId = :agentId', { agentId: agent.id })
          .getRawOne();

        // Get number of escalations by the agent
        const escalationsByAgent = await this.escalationRepository.count({
          where: { escalatedBy: agent.id },
        });

        return {
          agentId: agent.id,
          email: agent.email,
          location: agent.location ? agent.location.name : 'Unknown',
          totalTicketsAssigned,
          ticketsResolved,
          averageResolutionTime: avgResolutionTime?.avgResolutionTime || 0,
          escalationsByAgent,
        };
      }),
    );

    return agentStats;
  }

  async getAgentPerformance(agentEmail: string): Promise<{
    totalResolved: number;
    averageResolutionTime: number;
    totalTickets: number;
  }> {
    const agent = await this.agentRepo.findOne({
      where: {
        email: agentEmail,
      },
    });

    const totalTickets = await this.ticketRepository.find({
      where: { agentId: agent!.id },
    });

    const resolvedTickets = totalTickets.map(
      (ticket) => ticket.status == TicketStatus.Resolved,
    );

    if (resolvedTickets.length === 0) {
      return {
        totalResolved: 0,
        averageResolutionTime: 0,
        totalTickets: totalTickets.length,
      };
    }

    const totalDuration = totalTickets.reduce(
      (sum, ticket) => sum + (ticket.resolutionDuration || 0),
      0,
    );

    const averageResolutionTime = totalDuration / resolvedTickets.length;

    return {
      totalResolved: resolvedTickets.length,
      averageResolutionTime,
      totalTickets: totalTickets.length,
    };
  }
}
