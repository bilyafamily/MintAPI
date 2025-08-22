import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreatePcModelDto } from './dto/create-pc-model.dto';
import { UpdatePcModelDto } from './dto/update-pc-model.dto';
import { PcModel } from './entities/pc-model.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class PcModelService {
  @InjectRepository(PcModel)
  private readonly pcModPcModelRepo: Repository<PcModel>;

  async create(createPcModelDto: CreatePcModelDto): Promise<PcModel> {
    try {
      const newPcModel = this.pcModPcModelRepo.create(createPcModelDto);
      return await this.pcModPcModelRepo.save(newPcModel);
    } catch (error) {
      if (error.code === '23505') {
        throw new BadRequestException('PcModel name already exists');
      }
      throw new InternalServerErrorException('Failed to create pcModPcModel');
    }
  }

  async findAll(): Promise<PcModel[]> {
    try {
      return await this.pcModPcModelRepo.find();
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch categories');
    }
  }

  async findOne(id: string): Promise<PcModel> {
    try {
      const pcModPcModel = await this.pcModPcModelRepo.findOne({
        where: { id },
      });
      if (!pcModPcModel) {
        throw new NotFoundException(`PcModel with ID ${id} not found`);
      }
      return pcModPcModel;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to fetch pcModPcModel');
    }
  }

  async update(id: string, updatePcModelDto: UpdatePcModelDto) {
    try {
      const pcModPcModel = await this.pcModPcModelRepo.findOne({
        where: { id },
      });
      if (!pcModPcModel) {
        throw new NotFoundException(`PcModel with ID ${id} not found`);
      }

      const response = this.pcModPcModelRepo.update(
        {
          id,
        },
        updatePcModelDto,
      );
      return response;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      if (error.code === '23505') {
        throw new BadRequestException('PcModel name already exists');
      }
      throw new InternalServerErrorException('Failed to update pcModPcModel');
    }
  }

  async remove(id: string): Promise<void> {
    try {
      const result = await this.pcModPcModelRepo.delete(id);
      if (result.affected === 0) {
        throw new NotFoundException(`PcModel with ID ${id} not found`);
      }
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to delete pcModPcModel');
    }
  }
}
