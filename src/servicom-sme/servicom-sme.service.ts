import { Injectable } from '@nestjs/common';
import { CreateServicomSmeDto } from './dto/create-servicom-sme.dto';
import { UpdateServicomSmeDto } from './dto/update-servicom-sme.dto';
import { ServicomSme } from './entities/servicom-sme.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class ServicomSmeService {
  constructor(
    @InjectRepository(ServicomSme)
    private readonly servicomSmeRepository: Repository<ServicomSme>,
  ) {}

  async create(createDto: CreateServicomSmeDto): Promise<ServicomSme> {
    const sme = this.servicomSmeRepository.create(createDto);
    return await this.servicomSmeRepository.save(sme);
  }

  async findAll(): Promise<ServicomSme[]> {
    return await this.servicomSmeRepository.find();
  }

  async findOne(id: string): Promise<ServicomSme> {
    return await this.servicomSmeRepository.findOneBy({ id });
  }

  async update(
    id: string,
    updateDto: UpdateServicomSmeDto,
  ): Promise<ServicomSme> {
    await this.servicomSmeRepository.update(id, updateDto);
    return this.findOne(id);
  }

  async toggleStatus(id: string): Promise<ServicomSme> {
    const sme = await this.findOne(id);
    sme.isActive = !sme.isActive;
    return await this.servicomSmeRepository.save(sme);
  }

  async remove(id: string): Promise<void> {
    await this.servicomSmeRepository.delete(id);
  }
}
