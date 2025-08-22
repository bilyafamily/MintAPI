import { Test, TestingModule } from '@nestjs/testing';
import { TicketService } from './ticket.service';
import { Repository } from 'typeorm';
import { Ticket } from '../../entities/ticket.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Agent } from '../../../agent/entities/agent.entity';

describe('TicketService', () => {
  let service: TicketService;
  let ticketRepo: Repository<Ticket>;
  let agentRepo: Repository<Agent>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TicketService,
        {
          provide: getRepositoryToken(Ticket),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(Agent),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<TicketService>(TicketService);
    ticketRepo = module.get<Repository<Ticket>>(getRepositoryToken(Ticket));
    agentRepo = module.get<Repository<Agent>>(getRepositoryToken(Agent));
  });

  it('should assign a ticket to the least loaded agent', async () => {
    const mockAgents = [
      { id: 1, ticket_count: 3 },
      { id: 2, ticket_count: 2 }, // Least loaded agent
    ];
    jest.spyOn(agentRepo, 'find').mockResolvedValue(mockAgents as any);

    const mockTicket = { id: 1, agent: null, status: 'Open' };
    jest.spyOn(ticketRepo, 'findOne').mockResolvedValue(mockTicket as any);
    jest.spyOn(ticketRepo, 'save').mockResolvedValue(mockTicket as any);

    const result = await service.assignTicket('', '');

    expect(result.agent.id).toBe(2); // Should assign to agent with ID 2
    expect(result.status).toBe('In Progress');
  });
});
