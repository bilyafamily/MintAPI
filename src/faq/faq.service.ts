import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateFaqDto } from './dto/create-faq.dto';
import { UpdateFaqDto } from './dto/update-faq.dto';
import { FAQ } from './entities/faq.entity';

@Injectable()
export class FAQService {
  constructor(
    @InjectRepository(FAQ)
    private readonly faqRepository: Repository<FAQ>,
  ) {}

  async create(createFAQDto: CreateFaqDto): Promise<FAQ> {
    const faq = this.faqRepository.create(createFAQDto);
    return this.faqRepository.save(faq);
  }

  async findAll(): Promise<FAQ[]> {
    return this.faqRepository.find();
  }

  async findOne(id: string): Promise<FAQ> {
    return this.faqRepository.findOne({ where: { id } });
  }

  async update(id: string, updateFAQDto: UpdateFaqDto): Promise<FAQ> {
    await this.faqRepository.update(id, updateFAQDto);
    return this.faqRepository.findOne({ where: { id } });
  }

  async remove(id: string): Promise<void> {
    await this.faqRepository.delete(id);
  }

  async findByCategory(category: string): Promise<FAQ[]> {
    return this.faqRepository.find({ where: { category } });
  }
}
