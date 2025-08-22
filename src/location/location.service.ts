import { Injectable } from '@nestjs/common';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Location } from './entities/location.entity';
import { Repository } from 'typeorm';

@Injectable()
export class LocationService {
  constructor(
    @InjectRepository(Location)
    private readonly locationRepository: Repository<Location>,
  ) {}
  create(createLocationDto: CreateLocationDto) {
    const response = this.locationRepository.create(createLocationDto);
    return this.locationRepository.save(response);
  }

  findAll() {
    return this.locationRepository.find({ order: { name: 'ASC' } });
  }

  findOne(id: string) {
    return this.locationRepository.findOneByOrFail({ id });
  }

  update(id: string, updateLocationDto: UpdateLocationDto) {
    return this.locationRepository.update({ id }, { ...updateLocationDto });
  }

  remove(id: number) {
    return this.locationRepository.delete(id);
  }
}
