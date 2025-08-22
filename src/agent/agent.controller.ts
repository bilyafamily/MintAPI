import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  Patch,
} from '@nestjs/common';
import { AgentService } from './agent.service';
import { CreateAgentDto } from './dto/create-agent.dto';
import { UpdateAgentDto } from './dto/update-agent.dto';
import { Auth } from 'src/iam/authentication/decorators/auth.decorator';
import { AuthType } from '../iam/enums/auth-type.enum';
import { ActiveUser } from '../iam/authentication/decorators/active-user.decorator';
import { ActiveUserData } from '../iam/types/active-user-data.interface';

@Controller('agents')
@Auth(AuthType.ApiKey, AuthType.AzureAd, AuthType.Bearer)
export class AgentController {
  constructor(private readonly agentService: AgentService) {}

  @Post()
  create(@Body() createAgentDto: CreateAgentDto) {
    return this.agentService.create(createAgentDto);
  }

  @Get()
  findAll() {
    return this.agentService.findAll();
  }

  @Get('statistics')
  getAgentStatus(@ActiveUser() user: ActiveUserData) {
    return this.agentService.getAgentPerformance(user.unique_name);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.agentService.findOne(id);
  }

  @Patch(':id/toggle-status')
  toggleAgentStatus(@Param('id') id: string) {
    return this.agentService.toggleStatus(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateAgentDto: UpdateAgentDto) {
    return this.agentService.update(id, updateAgentDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.agentService.remove(+id);
  }
}
