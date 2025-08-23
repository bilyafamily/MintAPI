import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  Put,
  UseInterceptors,
  FileTypeValidator,
  MaxFileSizeValidator,
  ParseFilePipe,
  UploadedFiles,
} from '@nestjs/common';
import { TicketService } from './services/ticket/ticket.service';
import { UpdateTicketStatusDto } from './dto/update-ticket-status.dto';
import { Ticket } from './entities/ticket.entity';
import { ActiveUser } from '../iam/authentication/decorators/active-user.decorator';
import { ActiveUserData } from '../iam/types/active-user-data.interface';
import { Auth } from '../iam/authentication/decorators/auth.decorator';
import { AuthType } from '../iam/enums/auth-type.enum';
import { FilesInterceptor } from '@nestjs/platform-express';
import * as multer from 'multer';
import { EscalateTicketDto } from './dto/escalate-ticket.dto';
import { ResolveTicketDto } from './dto/resolve-ticket.dto';
// import { Roles } from '../iam/authentication/decorators/role.decorator';
// import { Role } from '../iam/enums/role.enum';
import { UserSummary } from './dto/user.summary.dto';
import { RateTicketDto } from './dto/rate-ticket.dto';
import { Agent } from '../agent/entities/agent.entity';
import { AgentStats } from 'src/types/ticket';

@Auth(AuthType.ApiKey, AuthType.None)
@Controller('tickets')
export class TicketController {
  constructor(private readonly ticketService: TicketService) {}

  @Post()
  @UseInterceptors(
    FilesInterceptor('files', 10, { storage: multer.memoryStorage() }),
  )
  async create(
    @Body() createTicketDto: any,
    @UploadedFiles(
      new ParseFilePipe({
        fileIsRequired: false,
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
          new FileTypeValidator({
            fileType: /^(image\/jpeg|image\/png|application\/pdf)$/,
          }),
        ],
      }),
    )
    files: Express.Multer.File[] | undefined,
  ) {
    return this.ticketService.create(createTicketDto, files);
  }

  // @Roles(Role.Admin)
  @Get('admin')
  async adminTickets(@Query() filters: any) {
    return this.ticketService.findAll(filters);
  }

  @Get()
  async findUserTickets(@ActiveUser() user: ActiveUserData) {
    return this.ticketService.findAllUserTickets(user.unique_name);
  }

  @Get('analytics')
  async getAnalytics(): Promise<any> {
    return this.ticketService.getDashboardStats();
  }

  @Get('agents/analytics')
  async getAgentAnalytics(): Promise<AgentStats[]> {
    return this.ticketService.getAgentStats();
  }

  @Get(':id/agents/analytics')
  async getAgentByIdAnalytics(@Param('id') id: string): Promise<AgentStats> {
    return this.ticketService.getAgentByIdStats(id.toLowerCase());
  }

  @Get('my-tickets')
  async myTickets(@Query() query: any) {
    const { email } = query;
    return this.ticketService.getMyTickets(email);
  }

  @Get('UserSummary')
  async userTicketSummary(
    @ActiveUser() user: ActiveUserData,
  ): Promise<UserSummary> {
    return this.ticketService.userTicketSummary(user.unique_name);
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() updateDto: UpdateTicketStatusDto,
  ) {
    return this.ticketService.updateStatus(id, updateDto);
  }

  @Put(':id/assign')
  async assignTicket(
    @Param('id') id: string,
    @Body() body: { agentId: string; assignedBy: string },
  ) {
    return this.ticketService.assignAgentToTicket(
      id,
      body.assignedBy,
      body.agentId,
    );
  }

  @Put(':id/auto-assign')
  async autoAssignTicket(
    @Param('id') id: string,
    @Body() body: { agentId: string; assignedBy: string },
  ) {
    return this.ticketService.autoAssignTicket(id, body.assignedBy);
  }

  @Patch(':id/reassign')
  async reassign(
    @Param('id') id: string,
    @Body() body: { agentId: string; assignedBy: string },
  ) {
    return this.ticketService.reassignTicket(id, body.agentId, body.assignedBy);
  }

  @Post(':id/escalate')
  async escalateTicket(
    @Param('id') id: string,
    @Body() payload: EscalateTicketDto,
  ): Promise<Ticket> {
    return this.ticketService.escalateTicket(id, payload);
  }

  @Get('myDesk')
  async myDesk(@Query() query: any) {
    const { email } = query;
    return await this.ticketService.getMyDesk(email);
  }

  @Get('agents/:id')
  async getAgentTickets(@Param('id') id: string) {
    return await this.ticketService.getAgentTicket(id);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.ticketService.findOne(id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() ticket: Ticket) {
    return this.ticketService.update(ticket);
  }

  @Put(':id/closeTicket')
  async resolveTicket(@Body() payload: ResolveTicketDto): Promise<Ticket> {
    return this.ticketService.resolveTicket(payload);
  }

  @Put(':id/rate')
  async rateTIcket(@Body() payload: RateTicketDto): Promise<Agent> {
    return this.ticketService.rateTicket(payload);
  }
}
