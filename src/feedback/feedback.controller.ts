import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
} from '@nestjs/common';
import { FeedbackService } from './feedback.service';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiParam,
} from '@nestjs/swagger';
import { Feedback } from './entities/feedback.entity';
import { UpdateFeedbackDto } from './dto/update-feedback.dto';
import { AuthType } from '../iam/enums/auth-type.enum';
import { Auth } from '../iam/authentication/decorators/auth.decorator';

@ApiBearerAuth()
@ApiTags('feedbacks')
@Controller('feedbacks')
@Auth(AuthType.AzureAd, AuthType.Bearer)
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Post()
  @ApiOperation({ summary: 'Create feedback' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({
    status: 201,
    description: 'Feedback successfully created.',
    type: Feedback,
  })
  create(@Body() createCategoryDto: CreateFeedbackDto) {
    return this.feedbackService.create(createCategoryDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all feedbacks' })
  @ApiResponse({
    status: 200,
    description: 'List of feedbacks',
    type: [Feedback],
  })
  findAll() {
    return this.feedbackService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a feedback by ID' })
  @ApiParam({ name: 'id', description: 'Feedback ID', type: String })
  @ApiResponse({
    status: 200,
    description: 'The found record',
    type: Feedback,
  })
  @ApiResponse({ status: 404, description: 'Feedback not found' })
  findOne(@Param('id') id: string) {
    return this.feedbackService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a Feedback by ID' })
  @ApiParam({ name: 'id', description: 'Feedback ID', type: String })
  @ApiResponse({
    status: 200,
    description: 'Feedback successfully updated.',
    type: Feedback,
  })
  @ApiResponse({ status: 404, description: 'Feedback not found' })
  update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateFeedbackDto,
  ) {
    return this.feedbackService.update(id, updateCategoryDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a category by ID' })
  @ApiParam({ name: 'id', description: 'Feedback ID', type: String })
  @ApiResponse({ status: 200, description: 'Feedback successfully deleted.' })
  @ApiResponse({ status: 404, description: 'Feedback not found' })
  remove(@Param('id') id: string) {
    return this.feedbackService.remove(id);
  }
}
