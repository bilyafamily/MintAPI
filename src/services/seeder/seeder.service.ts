import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from '../../category/entities/category.entity';
import { Repository } from 'typeorm';
import {
  AGENTS,
  CATEGORIES,
  DEPARTMENTS,
  LOCATIONS,
  REGIONS,
  SECTORS,
  SUBCATEGORIES,
  USERS,
} from '../../data/seed.data';
import { User } from '../../user/entities/user.entity';
import { Location } from '../../location/entities/location.entity';
import { Region } from '../../location/entities/regiion.entity';
import { Sector } from './sector.entity';
import { Subcategory } from '../../subcategory/entities/subcategory.entity';
import { Agent } from '../../agent/entities/agent.entity';
import { Department } from 'src/common/entities/Department';

@Injectable()
export class SeederService {
  @InjectRepository(Category)
  private readonly categoriesRepository: Repository<Category>;

  @InjectRepository(Subcategory)
  private readonly subcategoriesRepository: Repository<Subcategory>;

  @InjectRepository(User)
  private readonly userRepository: Repository<User>;

  @InjectRepository(Location)
  private readonly locationRepository: Repository<Location>;

  @InjectRepository(Region)
  private readonly regionRepository: Repository<Region>;

  @InjectRepository(Sector)
  private readonly sectorRepository: Repository<Sector>;

  @InjectRepository(Agent)
  private readonly agentRepository: Repository<Agent>;

  @InjectRepository(Department)
  private readonly departmentRepository: Repository<Department>;

  async seed() {
    await this.categories();
    await this.subcategories();
    await this.users();
    await this.locations();
    await this.agents();
    await this.departments();
    // await this.sectors();
  }

  async categories() {
    const data = await this.categoriesRepository.find();

    if (data.length <= 0) {
      await this.categoriesRepository.save(CATEGORIES);
    }
  }

  async subcategories() {
    const data = await this.subcategoriesRepository.find();

    if (data.length <= 0) {
      await this.subcategoriesRepository.save(SUBCATEGORIES);
    }
  }

  async users() {
    const data = await this.userRepository.find();

    if (data.length <= 0) {
      await this.userRepository.save(USERS);
    }
  }

  async region() {
    const data = await this.regionRepository.find();
    // console.log('SEEDING CALLED');
    if (data.length <= 0) {
      await this.regionRepository.save(REGIONS);
    }
  }

  async locations() {
    const data = await this.locationRepository.find();

    if (data.length <= 0) {
      await this.locationRepository.save(LOCATIONS);
    }
  }

  async sectors() {
    const data = await this.sectorRepository.find();

    if (data.length <= 0) {
      await this.sectorRepository.save(SECTORS);
    }
  }

  async agents() {
    const data = await this.agentRepository.find();

    if (data.length <= 0) {
      await this.agentRepository.save(AGENTS);
    }
  }

  async departments() {
    const data = await this.departmentRepository.find();

    if (data.length <= 0) {
      await this.departmentRepository.save(DEPARTMENTS);
    }
  }
}
