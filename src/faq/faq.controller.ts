import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
} from '@nestjs/common';
import { FAQService } from './faq.service';
import { CreateFaqDto } from './dto/create-faq.dto';
import { UpdateFaqDto } from './dto/update-faq.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthType } from '../iam/enums/auth-type.enum';
import { Auth } from '../iam/authentication/decorators/auth.decorator';

@ApiBearerAuth()
@Auth(AuthType.Bearer, AuthType.AzureAd)
@ApiTags('Faq')
@Controller('faq')
export class FaqController {
  constructor(private readonly faqService: FAQService) {}

  @Post()
  create(@Body() createFAQDto: CreateFaqDto) {
    return this.faqService.create(createFAQDto);
  }

  @Get()
  findAll() {
    return this.faqService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.faqService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateFAQDto: UpdateFaqDto) {
    return this.faqService.update(id, updateFAQDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.faqService.remove(id);
  }

  @Get('category/:category')
  findByCategory(@Param('category') category: string) {
    return this.faqService.findByCategory(category);
  }
}
