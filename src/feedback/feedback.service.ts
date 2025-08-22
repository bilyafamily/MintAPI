import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { Feedback } from './entities/feedback.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdateFeedbackDto } from './dto/update-feedback.dto';

@Injectable()
export class FeedbackService {
  @InjectRepository(Feedback)
  private readonly feedbackRepo: Repository<Feedback>;

  async findAll(): Promise<Feedback[]> {
    try {
      return await this.feedbackRepo.find();
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch categories');
    }
  }

  async findOne(id: string): Promise<Feedback> {
    try {
      const category = await this.feedbackRepo.findOne({ where: { id } });
      if (!category) {
        throw new NotFoundException(`Feedback with ID ${id} not found`);
      }
      return category;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to fetch category');
    }
  }

  async create(createCategoryDto: CreateFeedbackDto): Promise<Feedback> {
    try {
      const newCategory = this.feedbackRepo.create(createCategoryDto);
      return await this.feedbackRepo.save(newCategory);
    } catch (error) {
      if (error.code === '23505') {
        throw new BadRequestException('Feedback name already exists');
      }
      throw new InternalServerErrorException('Failed to create feedback');
    }
  }

  async update(id: string, updateCategoryDto: UpdateFeedbackDto) {
    try {
      const category = await this.feedbackRepo.findOne({ where: { id } });
      if (!category) {
        throw new NotFoundException(`Feedback with ID ${id} not found`);
      }

      const response = this.feedbackRepo.update(
        {
          id,
        },
        updateCategoryDto,
      );
      return response;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      if (error.code === '23505') {
        throw new BadRequestException('Feedback name already exists');
      }
      throw new InternalServerErrorException('Failed to update category');
    }
  }

  async remove(id: string): Promise<void> {
    try {
      const result = await this.feedbackRepo.delete(id);
      if (result.affected === 0) {
        throw new NotFoundException(`Feedback with ID ${id} not found`);
      }
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error; // Re-throw NotFoundException
      }
      throw new InternalServerErrorException('Failed to delete category');
    }
  }
}
