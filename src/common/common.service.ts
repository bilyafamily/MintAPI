import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Department } from 'src/common/entities/Department';

@Injectable()
export class CommonService {
  constructor(
    @InjectRepository(Department)
    private departmentsRepository: Repository<Department>,
  ) {}

  async getDepartments(): Promise<Department[]> {
    return await this.departmentsRepository.find();
  }
}
