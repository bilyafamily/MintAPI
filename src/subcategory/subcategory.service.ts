import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateSubcategoryDto } from './dto/create-subcategory.dto';
import { UpdateSubcategoryDto } from './dto/update-subcategory.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subcategory } from './entities/subcategory.entity';

@Injectable()
export class SubcategoryService {
  @InjectRepository(Subcategory)
  private readonly subcategoryRepo: Repository<Subcategory>;

  async create(createCategoryDto: CreateSubcategoryDto): Promise<Subcategory> {
    try {
      const newCategory = this.subcategoryRepo.create(createCategoryDto);
      return await this.subcategoryRepo.save(newCategory);
    } catch (error) {
      if (error.code === '23505') {
        throw new BadRequestException('Subcategory name already exists');
      }
      throw new InternalServerErrorException('Failed to create category');
    }
  }

  async findAll(): Promise<Subcategory[]> {
    try {
      return await this.subcategoryRepo.find({
        relations: {
          category: true,
        },
      });
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch categories');
    }
  }

  async findOne(id: string): Promise<Subcategory> {
    try {
      const subcategory = await this.subcategoryRepo.findOne({ where: { id } });
      if (!subcategory) {
        throw new NotFoundException(`Subcategory with ID ${id} not found`);
      }
      return subcategory;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to fetch category');
    }
  }

  async update(id: string, updateCategoryDto: UpdateSubcategoryDto) {
    try {
      const subcategory = await this.subcategoryRepo.findOne({ where: { id } });
      if (!subcategory) {
        throw new NotFoundException(`Subcategory with ID ${id} not found`);
      }

      const response = this.subcategoryRepo.update(
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
        throw new BadRequestException('Subcategory name already exists');
      }
      throw new InternalServerErrorException('Failed to update category');
    }
  }

  async remove(id: string): Promise<void> {
    try {
      const result = await this.subcategoryRepo.delete(id);
      if (result.affected === 0) {
        throw new NotFoundException(`Subcategory with ID ${id} not found`);
      }
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error; // Re-throw NotFoundException
      }
      throw new InternalServerErrorException('Failed to delete category');
    }
  }

  async getSubategorySLA(categoryId: string): Promise<number> {
    const category = await this.subcategoryRepo.findOne({
      where: { id: categoryId },
    });

    if (!category) {
      throw new NotFoundException(`Category with ID ${categoryId} not found.`);
    }

    return category.slaHours;
  }
}
