import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Between, IsNull, Not, Repository } from 'typeorm';
import { UpdateTicketStatusDto } from '../../dto/update-ticket-status.dto';
import { Ticket } from '../../entities/ticket.entity';
import { Agent } from '../../../agent/entities/agent.entity';
// import { Cron, CronExpression } from '@nestjs/schedule';
import { EmailNotificationService } from '../../../services/notification/emailNotification.service';
import { generateRandomString, getCurrentTime } from 'src/utils/ticket.utils';
import { UserService } from '../../../user/user.service';
import { uploadFileToAzure } from '../../../utils/uploadFileToAzure';
import { TicketAttachment } from '../../../ticket/entities/ticket.attachment';
import { EscalationHistory } from '../../../ticket/entities/escalationHistory.entity';
import { EscalateTicketDto } from '../../../ticket/dto/escalate-ticket.dto';
import { ResolveTicketDto } from '../../../ticket/dto/resolve-ticket.dto';
import { Comment } from '../../../comment/entities/comment.entity';
import { TicketStatus } from '../../../types/ticketStatus.enum';
import { EmailService } from '../../../email/email.service';

import { HelpdeskDesk } from '../../../ticket/dto/ticket-desk.enum';
import { UserSummary } from '../../../ticket/dto/user.summary.dto';
import { TicketAgentHistory } from 'src/ticket/entities/ticketAgentHistory.entity';
import { SubcategoryService } from 'src/subcategory/subcategory.service';
import { RateTicketDto } from 'src/ticket/dto/rate-ticket.dto';
import * as moment from 'moment';
import { Category } from '../../../category/entities/category.entity';
import {
  AgentStats,
  ResponseTimeData,
  SatisfactionData,
  TicketData,
} from 'src/types/ticket';
import { GraphService } from '../../../common/graph.service';

@Injectable()
export class TicketService {
  private readonly logger = new Logger(TicketService.name);
  constructor(
    @InjectRepository(Ticket)
    private readonly ticketRepository: Repository<Ticket>,

    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,

    @InjectRepository(TicketAttachment)
    private readonly ticketAttachmentRepository: Repository<TicketAttachment>,

    @InjectRepository(Agent)
    private readonly agentRepository: Repository<Agent>,

    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,

    @InjectRepository(EscalationHistory)
    private readonly escalationHistoryRepository: Repository<EscalationHistory>,

    @InjectRepository(TicketAgentHistory)
    private readonly ticketAgentHistoryRepository: Repository<TicketAgentHistory>,

    private readonly emailNotificationService: EmailNotificationService,
    private readonly subCategoryService: SubcategoryService,

    private readonly userService: UserService,
    private readonly emailService: EmailService,
    private readonly graphService: GraphService,
  ) {}

  async getUser(email: string) {
    return this.userService.findOne(email);
  }

  async create(
    createTicketDto: any,
    files: Express.Multer.File[] | undefined, // Changed parameter to accept array
  ): Promise<Ticket> {
    try {
      const slaHours = await this.subCategoryService.getSubategorySLA(
        createTicketDto.subcategoryId,
      );

      const {
        title,
        description,
        categoryId,
        subcategoryId,
        user,
        locationId,
      } = createTicketDto;

      const decodedUser = JSON.parse(user);

      if (
        !decodedUser?.id ||
        !title ||
        !description ||
        !categoryId ||
        !subcategoryId
      ) {
        throw new BadRequestException('Missing required fields');
      }

      // Find or create user
      const userExist = await this.userService.findOne(
        decodedUser.email.toLowerCase(),
      );

      let newUser;

      if (!userExist) {
        newUser = await this.userService.create({
          firstname: decodedUser.firstname,
          lastname: decodedUser.lastname,
          email: decodedUser.email,
          locationId,
          id: decodedUser.id,
        });
      }

      const userId = userExist ? userExist.id : newUser.id;

      const agent = await this.agentRepository.find({
        where: {
          isActive: true,
          tierLevel: 0,
        },
        order: {
          ticket_count: 'asc',
        },
      });

      const ticket = this.ticketRepository.create({
        title,
        description,
        ticketRef: generateRandomString().toLocaleUpperCase(),
        categoryId: categoryId,
        location: locationId,
        subcategoryId: subcategoryId,
        userId,
        sla_deadline: this.calculateDueDate(slaHours),
        escalationTier: 0,
        agentId: agent.length > 0 ? agent[0].id : null,
        createdAt: getCurrentTime(),
      });

      if (agent[0]) {
        agent[0].ticket_count++;
        await this.agentRepository.update({ id: agent[0].id }, agent[0]);
      }

      const savedTicket = await this.ticketRepository.save(ticket);

      // Handle multiple file uploads
      if (files && files.length > 0) {
        const uploadPromises = files.map((file) =>
          uploadFileToAzure(file).then((attachment) => {
            const ticketAttachment = this.ticketAttachmentRepository.create({
              fileUrl: attachment.fileUrl,
              ticketId: savedTicket.id,
              ticket: savedTicket,
            });
            return this.ticketAttachmentRepository.save(ticketAttachment);
          }),
        );

        await Promise.all(uploadPromises);
      }

      return savedTicket;
    } catch (error) {
      console.log(error);
      this.logger.error(`Error creating ticket: ${error.message}`, error.stack);
      throw error; // Re-throw the error to be handled by NestJS
    }
  }

  update(ticket: Ticket) {
    try {
      const response = this.ticketRepository.update({ id: ticket.id }, ticket);
      return response;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async findAllUserTickets(email: string): Promise<Ticket[] | []> {
    try {
      const user = await this.getUser(email);

      if (!user) {
        return [];
      }
      return this.ticketRepository.find({
        where: {
          userId: user.id,
        },
        relations: {
          user: true,
          comments: true,
        },
        select: {
          user: {
            email: true,
            firstname: true,
            lastname: true,
            id: true,
          },
          comments: true,
        },
        order: { createdAt: 'desc' },
      });
    } catch (error) {}
  }

  async findAll(filters?: any): Promise<Ticket[]> {
    return this.ticketRepository.find({
      where: filters,
      relations: ['user'],
      order: { createdAt: 'desc' },
    });
  }

  async userTicketSummary(email: string): Promise<UserSummary> {
    const user = await this.userService.findByEmail(email);
    if (!user) {
      return {
        Resolved: 0,
        Pending: 0,
        TotalTickets: 0,
      };
    }
    if (user) {
      const tickets = await this.ticketRepository.find({
        where: {
          userId: user.id,
        },
      });

      const resolved = tickets.filter(
        (x) => x.status === TicketStatus.Resolved,
      );

      const pending = tickets.filter(
        (x) => x.status === TicketStatus.InProgress,
      );

      return {
        Resolved: resolved.length ?? 0,
        Pending: pending.length ?? 0,
        TotalTickets: tickets.length ?? 0,
      };
    }
  }

  async findOne(ticketId: string): Promise<Ticket> {
    const ticket = await this.ticketRepository.findOne({
      where: { id: ticketId },
      relations: {
        user: true,
        comments: true,
      },
      select: {
        user: {
          email: true,
          firstname: true,
          lastname: true,
        },
        comments: {
          comment: true,
          createdAt: true,
          fileUrl: true,
          commentBy: true,
          id: true,
        },
      },
    });
    if (!ticket) {
      throw new NotFoundException(`Ticket with ID ${ticketId} not found.`);
    }
    return ticket;
  }

  async getMyDesk(agentEmail: string) {
    const agent = await this.agentRepository.findOne({
      where: { email: agentEmail.toLowerCase() },
    });

    if (!agent) {
      return [];
    }

    return this.ticketRepository.find({
      where: {
        agentId: agent.id,
      },
      relations: ['user'],
      order: {
        createdAt: 'asc',
      },
    });
  }

  async getMyTickets(email: string) {
    const user = await this.userService.findByEmail(email);

    if (!user) {
      return [];
    }

    return await this.ticketRepository.find({
      where: { userId: user.id },
    });
  }

  async updateStatus(
    ticketId: string,
    updateDto: UpdateTicketStatusDto,
  ): Promise<Ticket> {
    const ticket = await this.findOne(ticketId);

    ticket.status = updateDto.status;

    if (updateDto.status === 'resolved') {
      ticket.resolvedAt = new Date();

      if (new Date() > ticket.sla_deadline) {
        ticket.sla_breached = true;
      }
    }

    return this.ticketRepository.save(ticket);
  }

  async getAgentTicket(agentId: string): Promise<{
    totalResolved: number;
    averageResolutionTime: number;
    totalTickets: number;
    tickets: Ticket[];
    agent: Agent;
  }> {
    const agent = await this.agentRepository.findOne({
      where: {
        id: agentId,
      },
      select: {
        email: true,
        id: true,
        location: {
          id: true,
          name: true,
        },
      },
    });

    const tickets = await this.ticketRepository.find({
      where: { agentId: agent!.id },
    });

    const resolvedTickets = tickets.map(
      (ticket) => ticket.status == TicketStatus.Resolved,
    );

    if (resolvedTickets.length === 0) {
      return {
        totalResolved: 0,
        averageResolutionTime: 0,
        totalTickets: tickets.length,
        tickets,
        agent,
      };
    }

    const totalDuration = tickets.reduce(
      (sum, ticket) => sum + (ticket.resolutionDuration || 0),
      0,
    );

    const averageResolutionTime = totalDuration / resolvedTickets.length;

    return {
      totalResolved: resolvedTickets.length,
      averageResolutionTime,
      totalTickets: tickets.length,
      tickets,
      agent,
    };
  }

  async autoAssignTicket(ticketId: string, userEmail: string): Promise<Ticket> {
    this.logger.log(`Assigning ticket #${ticketId} for location `);
    // Get agents for the user's location
    const agents = await this.agentRepository.find({
      where: { isActive: true },
      order: { ticket_count: 'ASC' }, // Start with the agent with the fewest tickets
    });

    if (!agents.length) {
      this.logger.warn(`No agents available for location `);
      throw new NotFoundException(
        'No agents available for the specified location.',
      );
    }

    // Get the least loaded agent
    const assignedAgent = agents[0];

    // Update the agent's ticket count
    assignedAgent.ticket_count += 1;
    await this.agentRepository.save(assignedAgent);

    // Update the ticket with the assigned agent
    const ticket = await this.ticketRepository.findOne({
      where: { id: ticketId },
    });
    if (!ticket) {
      this.logger.error(`Ticket #${ticketId} not found.`);
      throw new NotFoundException(`Ticket with ID ${ticketId} not found.`);
    }

    ticket.agent = assignedAgent;
    ticket.status = 'In Progress';

    await this.ticketRepository.save(ticket);

    this.logger.log(
      `Ticket #${ticketId} assigned to Agent #${assignedAgent.id}`,
    );

    const agentHistory = this.ticketAgentHistoryRepository.create({
      agent: assignedAgent.email.toLowerCase(),
      assignedBy: userEmail.toLowerCase(),
      message: `Ticket was assigned auto assigned to ${assignedAgent.email} by ${userEmail.toLowerCase()} at ${moment(getCurrentTime().toString()).format('LLL')}`,
      ticket: ticket,
    });

    await this.ticketAgentHistoryRepository.save(agentHistory);

    return ticket;
  }

  async assignAgentToTicket(
    ticketId: string,
    userEmail: string,
    agentId,
  ): Promise<Ticket> {
    this.logger.log(`Assigning ticket #${ticketId} for location `);
    // Get agents for the user's location
    const agent = await this.agentRepository.findOne({
      where: { id: agentId.toLowerCase() },
    });

    if (!agent) {
      this.logger.warn(`No agents available for location `);
      throw new NotFoundException(
        'No agents available for the specified location.',
      );
    }

    // Update the agent's ticket count
    agent.ticket_count += 1;
    await this.agentRepository.save(agent);

    // Update the ticket with the assigned agent
    const ticket = await this.ticketRepository.findOne({
      where: { id: ticketId },
    });
    if (!ticket) {
      this.logger.error(`Ticket #${ticketId} not found.`);
      throw new NotFoundException(`Ticket with ID ${ticketId} not found.`);
    }

    ticket.agent = agent;
    ticket.status = 'In Progress';

    await this.ticketRepository.save(ticket);

    this.logger.log(`Ticket #${ticketId} assigned to Agent #${agent.id}`);

    const agentHistory = this.ticketAgentHistoryRepository.create({
      agent: agent.email.toLowerCase(),
      assignedBy: userEmail.toLowerCase(),
      message: `Ticket was auto assigned to ${agent.email} by ${userEmail.toLowerCase()} at ${getCurrentTime().toLocaleString()}`,
      ticket: ticket,
    });

    await this.ticketAgentHistoryRepository.save(agentHistory);

    return ticket;
  }

  async reassignTicket(
    ticketId: string,
    newAgentId: string,
    userEmail: string,
  ): Promise<Ticket> {
    const ticket = await this.ticketRepository.findOne({
      where: { id: ticketId },
    });
    if (!ticket) {
      throw new NotFoundException(`Ticket with ID ${ticketId} not found.`);
    }

    const newAgent = await this.agentRepository.findOne({
      where: { id: newAgentId },
    });
    if (!newAgent) {
      throw new NotFoundException(`Agent with ID ${newAgentId} not found.`);
    }

    ticket.agent = newAgent;

    // Decrement old agent's ticket count
    if (ticket.agent) {
      ticket.agent.ticket_count -= 1;
      await this.agentRepository.save(ticket.agent);
    }

    // Increment new agent's ticket count
    newAgent.ticket_count += 1;
    await this.agentRepository.save(newAgent);

    await this.ticketRepository.save(ticket);

    const ticketAgentHisotory = new TicketAgentHistory();
    ticketAgentHisotory.agent = userEmail.toLowerCase();
    ticketAgentHisotory.assignedAt = getCurrentTime();
    ticketAgentHisotory.assignedBy = userEmail.toLowerCase();
    ticketAgentHisotory.message = `TIcket was reassigned by to ${newAgent.email} by ${userEmail.toLowerCase()} at ${getCurrentTime().toLocaleString()}`;
    ticketAgentHisotory.ticket = ticket;

    await this.ticketAgentHistoryRepository.save(ticketAgentHisotory);

    return ticket;
  }

  async getAnalytics(): Promise<any> {
    const totalTickets = await this.ticketRepository.count();
    const resolvedTickets = await this.ticketRepository.count({
      where: { status: TicketStatus.Resolved },
    });
    const openTickets = await this.ticketRepository.count({
      where: { status: TicketStatus.InProgress },
    });
    const slaBreaches = await this.ticketRepository.count({
      where: { is_escalated: true },
    });

    return {
      totalTickets,
      resolvedTickets,
      openTickets,
      slaBreaches,
      slaCompliance: ((totalTickets - slaBreaches) / totalTickets) * 100,
    };
  }

  async escalateTicket(
    ticketId: string,
    payload: EscalateTicketDto,
  ): Promise<Ticket> {
    try {
      const ticket = await this.ticketRepository.findOne({
        where: { id: ticketId },
      });

      if (!ticket) {
        throw new NotFoundException('Ticket not found');
      }

      if (ticket.escalationTier >= 3) {
        throw new BadRequestException('Ticket is already on the heighest tier');
      }

      const agent = await this.agentRepository.findOne({
        where: {
          email: payload.escalatedBy.toLowerCase(),
        },
      });

      const currentTier = ticket.escalationTier;
      const nextTier = currentTier + 1;
      let nextAgent: Agent;

      const nextTierAgents = await this.agentRepository.find({
        where: {
          tierLevel: nextTier,
          isActive: true,
        },
        order: {
          ticket_count: 'asc',
        },
      });

      //Escalate to the team leads
      if (nextTierAgents.length > 0) {
        nextAgent = nextTierAgents[0];
      } else {
        const getTierTwoAgents = await this.agentRepository.find({
          where: { tierLevel: 2, isActive: true },
          order: { ticket_count: 'asc' },
        });
        nextAgent = getTierTwoAgents[0];
      }

      if (!nextAgent) {
        console.log('nextAgent', nextAgent);
        throw new BadRequestException('No available agent to escalate to');
      }

      nextAgent.ticket_count += 1;
      await this.agentRepository.save(nextAgent);

      let desk = '';
      if (nextTier === 1) {
        desk = HelpdeskDesk.Helpdesk;
      } else if (nextTier === 2) {
        desk = HelpdeskDesk.HelpdeskSupervisor;
      } else {
        desk = HelpdeskDesk.Vendor;
      }

      const now = getCurrentTime();
      const duration = ticket.assignedAt
        ? now.getTime() - ticket.assignedAt.getTime()
        : 0;

      ticket.agent = nextAgent;
      ticket.escalationTier = nextTier;
      ticket.currentDesk = desk;
      ticket.assignedAt = now;

      await this.ticketRepository.save(ticket);

      const escalation = this.escalationHistoryRepository.create({
        escalatedBy: agent.email,
        escalatedTo: nextAgent.email,
        comment: payload.comment,
        duration,
        time: now,
        ticketId: ticket.id,
        ticket: ticket,
        tier: nextTier,
      });
      await this.escalationHistoryRepository.save(escalation);

      // const ticketAgentHisotory = new TicketAgentHistory();
      // ticketAgentHisotory.agent = nextAgent.email;
      // ticketAgentHisotory.assignedAt = getCurrentTime();
      // ticketAgentHisotory.assignedBy = payload.escalatedBy;
      // ticketAgentHisotory.message = payload.comment;
      // ticketAgentHisotory.ticket = ticket;

      // const saveData = [
      // await this.ticketAgentHistoryRepository.save(ticketAgentHisotory);
      // ];

      // await Promise.all(saveData);
      // Optional: Send notification to the next agent
      this.emailNotificationService.sendNotification({
        agentId: nextAgent.id,
        message: `A new ticket has been escalated to you: ${ticket.title}`,
      });

      return ticket;
    } catch (error) {
      console.log(error);
      throw new BadRequestException(error.message);
    }
  }

  async resolveTicket(payload: ResolveTicketDto): Promise<Ticket> {
    const ticket = await this.ticketRepository.findOne({
      where: { id: payload.ticketId },
      relations: {
        user: true,
      },
    });
    if (!ticket) {
      throw new Error('Ticket not found');
    }
    ticket.resolutionEndTime = new Date();
    ticket.resolution = payload.comment;
    ticket.resolutionDuration = Math.floor(
      (ticket.resolutionEndTime.getTime() -
        ticket.resolutionStartTime.getTime()) /
        1000,
    );
    ticket.status = TicketStatus.Resolved;
    ticket.currentDesk = HelpdeskDesk.Completed;
    ticket.resolvedAt = getCurrentTime();

    await this.emailService.sendSupportCloseTicketEmail(ticket);
    return this.ticketRepository.save(ticket);
  }

  async rateTicket(payload: RateTicketDto) {
    const ticket = await this.ticketRepository.findOne({
      where: { id: payload.ticketId },
    });

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    ticket.rating = payload.rating;
    ticket.feedback = payload.feedback;
    ticket.status = TicketStatus.Closed;
    ticket.ratedAt = getCurrentTime();

    this.ticketRepository.save(ticket);

    const agent = await this.agentRepository.findOne({
      where: { id: ticket.agentId },
      relations: {
        tickets: true,
      },
    });

    if (agent) {
      const ratedTickets = agent.tickets.filter(
        (t) => t.rating !== null && t.rating !== undefined,
      );
      const totalRatings = ratedTickets.length;
      const sumRatings = ratedTickets.reduce(
        (acc, t) => acc + (t.rating || 0),
        0,
      );
      agent.averageRating = totalRatings > 0 ? sumRatings / totalRatings : 0;

      return await this.agentRepository.save(agent);
    }
  }

  async getDashboardStats() {
    // Total Tickets: Count of all tickets
    const totalTickets = await this.ticketRepository.count();

    // Active Users: Count of active agents
    const activeUsers = await this.agentRepository.count({
      where: { isActive: true },
    });
    // console.log('Active Users:', activeUsers);

    // Resolved Tickets: Count of tickets with non-null resolvedAt
    const resolvedTickets = await this.ticketRepository.count({
      where: { resolvedAt: Not(IsNull()) },
    });
    // console.log('Resolved Tickets:', resolvedTickets);

    // Resolution Rate: (resolved / total) * 100, rounded to 2 decimal places
    const resolutionRate =
      totalTickets > 0
        ? ((resolvedTickets / totalTickets) * 100).toFixed(2)
        : '0.00';
    // console.log('Resolution Rate Calculation:', { resolvedTickets, totalTickets, resolutionRate });

    // Average Response Time: Average of resolutionDuration (converted from milliseconds to hours)
    const avgResponseQuery = await this.ticketRepository
      .createQueryBuilder('ticket')
      .select('AVG(ticket.resolutionDuration)', 'avg')
      .where('ticket.resolutionDuration IS NOT NULL')
      .andWhere('ticket.resolutionDuration > 0') // Exclude zero or negative durations
      .getRawOne();
    // Convert milliseconds to hours (1 ms = 1/3600000 hours)
    const averageResponseTime = avgResponseQuery?.avg
      ? (parseFloat(avgResponseQuery.avg) / 3600000).toFixed(2) // Convert ms to hours
      : '0.00';
    // console.log('Average Response Time (ms):', avgResponseQuery?.avg, 'Converted to hours:', averageResponseTime);

    // Monthly Data: For the last 6 months (tickets created, resolved, avg resolution time in hours)
    const monthlyData = [];
    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    const currentDate = new Date();
    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() - i,
        1,
      );
      const monthName = months[monthDate.getMonth()];
      const start = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
      const end = new Date(
        monthDate.getFullYear(),
        monthDate.getMonth() + 1,
        0,
        23,
        59,
        59,
      );

      // Tickets created in the month
      const tickets = await this.ticketRepository.count({
        where: { createdAt: Between(start, end) },
      });

      // Tickets resolved in the month
      const resolved = await this.ticketRepository.count({
        where: { resolvedAt: Between(start, end) },
      });

      // Avg resolution time for tickets resolved in the month (in hours)
      const avgTimeQuery = await this.ticketRepository
        .createQueryBuilder('ticket')
        .select('AVG(ticket.resolutionDuration)', 'avg')
        .where('ticket.resolvedAt BETWEEN :start AND :end', { start, end })
        .andWhere('ticket.resolutionDuration IS NOT NULL')
        .andWhere('ticket.resolutionDuration > 0')
        .getRawOne();
      const avgTime = avgTimeQuery?.avg
        ? (parseFloat(avgTimeQuery.avg) / 3600000).toFixed(1)
        : '0.0';

      monthlyData.push({ month: monthName, tickets, resolved, avgTime });
    }

    // Category Data: Distribution of tickets by category with sample colors
    const categories = await this.categoryRepository.find();
    const categoryData = [];
    const sampleColors = [
      '#ef4444',
      '#3b82f6',
      '#10b981',
      '#f59e0b',
      '#8b5cf6',
      '#eab308',
    ];

    for (let i = 0; i < categories.length; i++) {
      const category = categories[i];
      const value = await this.ticketRepository.count({
        where: { categoryId: category.id },
      });
      if (value > 0) {
        // Only include categories with tickets
        categoryData.push({
          name: category.name,
          value,
          color: sampleColors[i % sampleColors.length],
        });
      }
    }

    return {
      totalTickets,
      activeUsers,
      resolutionRate: parseFloat(resolutionRate),
      averageResponseTime: parseFloat(averageResponseTime),
      monthlyData,
      categoryData,
    };
  }

  async getAgentStats(): Promise<AgentStats[]> {
    const agents = await this.agentRepository.find();
    const result: AgentStats[] = [];
    const months = ['Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'];
    const currentYear = 2025;

    for (const agent of agents) {
      const ticketData: TicketData[] = [];
      const responseTimeData: ResponseTimeData[] = [];

      // Query ticket data and response time for each month
      for (let i = 0; i < months.length; i++) {
        const monthIndex = 2 + i; // March (2) to August (7)
        const start = new Date(currentYear, monthIndex, 1);
        const end = new Date(currentYear, monthIndex + 1, 0, 23, 59, 59);

        // Ticket counts: resolved, pending, escalated
        const resolved = await this.ticketRepository.count({
          where: {
            agentId: agent.id,
            status: 'resolved',
            resolvedAt: Between(start, end),
          },
        });

        const pending = await this.ticketRepository.count({
          where: {
            agentId: agent.id,
            status: 'pending',
            createdAt: Between(start, end),
          },
        });

        const escalated = await this.ticketRepository.count({
          where: {
            agentId: agent.id,
            is_escalated: true,
            createdAt: Between(start, end),
          },
        });

        ticketData.push({
          month: months[i],
          resolved,
          pending,
          escalated,
        });

        // Average response time (in hours) for resolved tickets
        const avgTimeQuery = await this.ticketRepository
          .createQueryBuilder('ticket')
          .select('AVG(ticket.resolutionDuration)', 'avg')
          .where('ticket.agentId = :agentId', { agentId: agent.id })
          .andWhere('ticket.resolvedAt BETWEEN :start AND :end', { start, end })
          .andWhere('ticket.resolutionDuration IS NOT NULL')
          .andWhere('ticket.resolutionDuration > 0')
          .getRawOne();
        const avgTime = avgTimeQuery?.avg
          ? parseFloat(avgTimeQuery.avg) / 3600000
          : 0; // Convert ms to hours

        responseTimeData.push({
          month: months[i],
          avgTime: parseFloat(avgTime.toFixed(1)),
        });
      }

      // Satisfaction data: Map ratings to categories
      const ratings = await this.ticketRepository
        .createQueryBuilder('ticket')
        .select('ticket.rating, COUNT(*) as count')
        .where('ticket.agentId = :agentId', { agentId: agent.id })
        .andWhere('ticket.rating IS NOT NULL')
        .groupBy('ticket.rating')
        .getRawMany();

      const satisfactionData: SatisfactionData[] = [
        { name: 'Excellent', value: 0, color: '#10b981' },
        { name: 'Good', value: 0, color: '#3b82f6' },
        { name: 'Average', value: 0, color: '#f59e0b' },
        { name: 'Poor', value: 0, color: '#ef4444' },
      ];

      ratings.forEach((rating) => {
        const count = parseInt(rating.count);
        if (rating.rating === 5)
          satisfactionData[0].value += count; // Excellent
        else if (rating.rating === 4)
          satisfactionData[1].value += count; // Good
        else if (rating.rating === 3)
          satisfactionData[2].value += count; // Average
        else if (rating.rating <= 2) satisfactionData[3].value += count; // Poor
      });

      // Additional statistics
      const totalTickets = await this.ticketRepository.find({
        where: { agentId: agent.id },
      });

      const avgRatingQuery = await this.ticketRepository
        .createQueryBuilder('ticket')
        .select('AVG(ticket.rating)', 'avg')
        .where('ticket.agentId = :agentId', { agentId: agent.id })
        .andWhere('ticket.rating IS NOT NULL')
        .getRawOne();
      const averageRating = avgRatingQuery?.avg
        ? parseFloat(avgRatingQuery.avg.toFixed(1))
        : 0;

      result.push({
        agentId: agent.id,
        agentEmail: agent.email,
        ticketData,
        responseTimeData,
        satisfactionData,
        averageRating,
        totalTickets: totalTickets.length,
        resolved: totalTickets.map((x) => x.status === TicketStatus.Resolved)
          .length,
        pending: totalTickets.map((x) => x.status === TicketStatus.InProgress)
          .length,
        escalated: totalTickets.map((x) => x.status === TicketStatus.Resolved)
          .length,
      });
    }

    return result;
  }

  async getAgentByIdStats(agentId: string): Promise<AgentStats> {
    const agent = await this.agentRepository.findOne({
      where: { id: agentId.toLowerCase() },
    });

    const months = ['Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'];
    const currentYear = 2025;

    const ticketData: TicketData[] = [];
    const responseTimeData: ResponseTimeData[] = [];

    // Query ticket data and response time for each month
    for (let i = 0; i < months.length; i++) {
      const monthIndex = 2 + i; // March (2) to August (7)
      const start = new Date(currentYear, monthIndex, 1);
      const end = new Date(currentYear, monthIndex + 1, 0, 23, 59, 59);

      // Ticket counts: resolved, pending, escalated
      const resolved = await this.ticketRepository.count({
        where: {
          agentId: agent.id,
          status: 'resolved',
          resolvedAt: Between(start, end),
        },
      });

      const pending = await this.ticketRepository.count({
        where: {
          agentId: agent.id,
          status: 'pending',
          createdAt: Between(start, end),
        },
      });

      const escalated = await this.ticketRepository.count({
        where: {
          agentId: agent.id,
          is_escalated: true,
          createdAt: Between(start, end),
        },
      });

      ticketData.push({
        month: months[i],
        resolved,
        pending,
        escalated,
      });

      // Average response time (in hours) for resolved tickets
      const avgTimeQuery = await this.ticketRepository
        .createQueryBuilder('ticket')
        .select('AVG(ticket.resolutionDuration)', 'avg')
        .where('ticket.agentId = :agentId', { agentId: agent.id })
        .andWhere('ticket.resolvedAt BETWEEN :start AND :end', { start, end })
        .andWhere('ticket.resolutionDuration IS NOT NULL')
        .andWhere('ticket.resolutionDuration > 0')
        .getRawOne();
      const avgTime = avgTimeQuery?.avg
        ? parseFloat(avgTimeQuery.avg) / 3600000
        : 0; // Convert ms to hours

      responseTimeData.push({
        month: months[i],
        avgTime: parseFloat(avgTime.toFixed(1)),
      });
    }

    // Satisfaction data: Map ratings to categories
    const ratings = await this.ticketRepository
      .createQueryBuilder('ticket')
      .select('ticket.rating, COUNT(*) as count')
      .where('ticket.agentId = :agentId', { agentId: agent.id })
      .andWhere('ticket.rating IS NOT NULL')
      .groupBy('ticket.rating')
      .getRawMany();

    const satisfactionData: SatisfactionData[] = [
      { name: 'Excellent', value: 0, color: '#10b981' },
      { name: 'Good', value: 0, color: '#3b82f6' },
      { name: 'Average', value: 0, color: '#f59e0b' },
      { name: 'Poor', value: 0, color: '#ef4444' },
    ];

    ratings.forEach((rating) => {
      const count = parseInt(rating.count);
      if (rating.rating === 5)
        satisfactionData[0].value += count; // Excellent
      else if (rating.rating === 4)
        satisfactionData[1].value += count; // Good
      else if (rating.rating === 3)
        satisfactionData[2].value += count; // Average
      else if (rating.rating <= 2) satisfactionData[3].value += count; // Poor
    });

    // Additional statistics
    const totalTickets = await this.ticketRepository.find({
      where: { agentId: agent.id },
    });

    const avgRatingQuery = await this.ticketRepository
      .createQueryBuilder('ticket')
      .select('AVG(ticket.rating)', 'avg')
      .where('ticket.agentId = :agentId', { agentId: agent.id })
      .andWhere('ticket.rating IS NOT NULL')
      .getRawOne();
    const averageRating = avgRatingQuery?.avg
      ? parseFloat(avgRatingQuery.avg.toFixed(1))
      : 0;

    return {
      agentId: agent.id,
      agentEmail: agent.email,
      ticketData,
      responseTimeData,
      satisfactionData,
      averageRating,
      totalTickets: totalTickets.length,
      resolved: totalTickets.filter((x) => x.status === TicketStatus.Resolved)
        .length,
      pending: totalTickets.filter(
        (x) => x.status === TicketStatus.InProgress || x.status === 'pending',
      ).length,
      escalated: totalTickets.filter((x) => x.is_escalated).length,
    };
  }

  @Cron(CronExpression.EVERY_10_HOURS)
  async fetchAndSaveEmails() {
    this.logger.log('Checking mailbox for new emails...');

    const emails = await this.graphService.getUnreadEmails(
      process.env.HELPDESK_EMAIL,
    );

    for (const email of emails) {
      const user = await this.userService.findByEmail(
        email.from?.emailAddress?.address,
      );
      const ticket = this.ticketRepository.create({
        title: email.subject,
        description: email.body?.content || '',
        ticketRef: generateRandomString().toLocaleUpperCase(),
        categoryId: 'f37e433e-f36b-1410-8b2e-00af017e6654',
        locationId: 'c9e7f895-3e92-4e53-ab63-ca2234809102',
        subcategoryId: 'fa7e433e-f36b-1410-8b2e-00af017e6654',
        userId: user.id,
        sla_deadline: this.calculateDueDate(0),
        escalationTier: 0,
        agentId: null,
        createdAt: getCurrentTime(),
      });

      await this.ticketRepository.save(ticket);

      // Mark as read so we don’t process it again
      await this.graphService.markAsRead(process.env.HELPDESK_EMAIL, email.id);

      this.logger.log(`Saved new ticket from ${user.email}: "${ticket.title}"`);
    }
  }

  // @Cron(CronExpression.EVERY_4_HOURS)
  // async checkSLABreaches() {
  //   this.logger.log('Running SLA breach and escalation checks...');

  //   const now = new Date();
  //   const tickets = await this.ticketRepository.find({
  //     where: { status: 'In Progress' },
  //     relations: ['category', 'agent', 'user'],
  //   });

  //   this.logger.log(JSON.stringify(tickets));

  //   for (const ticket of tickets) {
  //     const slaDeadline = new Date(ticket.createdAt);
  //     slaDeadline.setHours(slaDeadline.getHours() + ticket.category.slaHours);

  //     this.logger.log('Timecheck...', now < slaDeadline);

  //     if (now > slaDeadline) {
  //       // Notify agent if not already escalated
  //       if (!ticket.is_escalated) {
  //         this.logger.warn(
  //           `SLA breached for Ticket #${ticket.id}. Notifying agent.`,
  //         );
  //         await this.emailNotificationService.notifySLABreach(ticket);
  //         ticket.is_escalated = true;
  //         ticket.escalation_time = now;
  //         await this.ticketRepository.save(ticket);
  //       }

  //       const category = ticket.category;
  //       const escalationThreshold = new Date(ticket.escalation_time);
  //       escalationThreshold.setHours(
  //         escalationThreshold.getHours() + category.escalation_threshold,
  //       );

  //       const adminThreshold = new Date(ticket.admin_escalation_time);
  //       adminThreshold.setHours(
  //         adminThreshold.getHours() + category.admin_threshold,
  //       );

  //       if (now > escalationThreshold && !ticket.admin_escalation_time) {
  //         this.logger.warn(`Escalating Ticket #${ticket.id} to supervisor.`);
  //         await this.emailNotificationService.notifySupervisor(ticket);
  //         ticket.admin_escalation_time = now;
  //         await this.ticketRepository.save(ticket);
  //       }

  //       if (now > adminThreshold) {
  //         this.logger.warn(`Escalating Ticket #${ticket.id} to admin.`);
  //         await this.emailNotificationService.notifyAdmin(ticket);
  //       }
  // // Escalate to supervisor if 2+ hours after SLA breach
  // const escalationThreshold = new Date(ticket.escalation_time);
  // escalationThreshold.setHours(escalationThreshold.getHours() + 2);
  // if (now > escalationThreshold && !ticket.admin_escalation_time) {
  //   this.logger.warn(`Escalating Ticket #${ticket.id} to supervisor.`);
  //   await this.notificationService.notifySupervisor(ticket);
  //   ticket.admin_escalation_time = now;
  //   await this.ticketRepository.save(ticket);
  // }

  // // Escalate to admin if 4+ hours after SLA breach
  // const adminThreshold = new Date(ticket.admin_escalation_time);
  // adminThreshold.setHours(adminThreshold.getHours() + 2);
  // if (now > adminThreshold) {
  //   this.logger.warn(`Escalating Ticket #${ticket.id} to admin.`);
  //   await this.notificationService.notifyAdmin(ticket);
  // }
  //     }
  //   }
  // }

  calculateDueDate(slaHours: number): Date {
    const now = new Date(); // Current date and time

    // Calculate the due date based on business hours (8 AM to 5 PM) and working days
    const dueDate = this.calculateBusinessDueDate(now, slaHours);

    return dueDate;
  }

  private isWorkingDay(date: Date): boolean {
    const day = date.getDay();
    return day !== 0 && day !== 6; // 0 = Sunday, 6 = Saturday
  }

  private moveToNextWorkingDay(date: Date): Date {
    const nextDay = new Date(date);
    nextDay.setDate(date.getDate() + 1);

    // If the next day is a weekend, skip to the following Monday
    while (!this.isWorkingDay(nextDay)) {
      nextDay.setDate(nextDay.getDate() + 1);
    }

    return nextDay;
  }

  private calculateBusinessDueDate(startTime: Date, slaHours: number): Date {
    const BUSINESS_START_HOUR = 8; // 8 AM
    const BUSINESS_END_HOUR = 17; // 5 PM
    //const HOURS_PER_DAY = BUSINESS_END_HOUR - BUSINESS_START_HOUR; // 9 working hours per day

    let remainingHours = slaHours;
    let currentTime = startTime;

    while (remainingHours > 0) {
      // Check if current day is a working day (Monday to Friday)
      if (this.isWorkingDay(currentTime)) {
        const currentHour = currentTime.getHours();

        if (
          currentHour >= BUSINESS_START_HOUR &&
          currentHour < BUSINESS_END_HOUR
        ) {
          // Calculate remaining hours in the business day
          const hoursLeftInDay = BUSINESS_END_HOUR - currentHour;

          if (remainingHours <= hoursLeftInDay) {
            // If SLA hours fit in the current day, calculate the due time
            currentTime.setHours(currentHour + remainingHours);
            return currentTime;
          } else {
            // Move to the next business day
            remainingHours -= hoursLeftInDay;
          }
        }
      }

      // Move to the start of the next working day
      currentTime = this.moveToNextWorkingDay(currentTime);
      currentTime.setHours(BUSINESS_START_HOUR, 0, 0, 0);
    }

    return currentTime;
  }
}
