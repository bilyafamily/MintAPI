import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Computer } from './entities/computer.entity';
import { CreateComputerDto } from './dto/create-computer.dto';
import { UpdateComputerDto } from './dto/update-computer.dto';
import { Department } from 'src/common/entities/Department';
import { User } from 'src/user/entities/user.entity';
import { PcModel } from 'src/pc-model/entities/pc-model.entity';

@Injectable()
export class ComputerService {
  constructor(
    @InjectRepository(Computer)
    private computersRepository: Repository<Computer>,
    @InjectRepository(Department)
    private departmentsRepository: Repository<Department>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(PcModel)
    private modelsRepository: Repository<PcModel>,
  ) {}

  async create(createComputerDto: CreateComputerDto): Promise<Computer> {
    // Check if model exists
    const model = await this.modelsRepository.findOne({
      where: { id: createComputerDto.modelId },
    });
    if (!model) {
      throw new NotFoundException(
        `Model with ID ${createComputerDto.modelId} not found`,
      );
    }

    // Check if department exists
    const department = await this.departmentsRepository.findOne({
      where: { id: createComputerDto.departmentId },
    });
    if (!department) {
      throw new NotFoundException(
        `Department with ID ${createComputerDto.departmentId} not found`,
      );
    }

    // Check if user exists if provided
    let user: User = null;
    if (createComputerDto.userId) {
      user = await this.usersRepository.findOne({
        where: { id: createComputerDto.userId },
      });
      if (!user) {
        throw new NotFoundException(
          `User with ID ${createComputerDto.userId} not found`,
        );
      }
    }

    // Check if serial number is unique
    const existingComputer = await this.computersRepository.findOne({
      where: { serialNumber: createComputerDto.serialNumber },
    });
    if (existingComputer) {
      throw new NotFoundException(
        `Computer with serial number ${createComputerDto.serialNumber} already exists`,
      );
    }

    const computer = this.computersRepository.create({
      ...createComputerDto,
      model,
      department,
      user,
    });

    return await this.computersRepository.save(computer);
  }

  async findAll(): Promise<Computer[]> {
    return await this.computersRepository.find({
      relations: ['model', 'department', 'user'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Computer> {
    const computer = await this.computersRepository.findOne({
      where: { id },
      relations: ['model', 'department', 'user'],
    });

    if (!computer) {
      throw new NotFoundException(`Computer with ID ${id} not found`);
    }

    return computer;
  }

  async update(
    id: string,
    updateComputerDto: UpdateComputerDto,
  ): Promise<Computer> {
    const computer = await this.findOne(id);

    // If modelId is being updated, check if new model exists
    if (
      updateComputerDto.modelId &&
      updateComputerDto.modelId !== computer.modelId
    ) {
      const model = await this.modelsRepository.findOne({
        where: { id: updateComputerDto.modelId },
      });
      if (!model) {
        throw new NotFoundException(
          `Model with ID ${updateComputerDto.modelId} not found`,
        );
      }
      computer.model = model;
      computer.modelId = updateComputerDto.modelId;
    }

    // If departmentId is being updated, check if new department exists
    if (
      updateComputerDto.departmentId &&
      updateComputerDto.departmentId !== computer.departmentId
    ) {
      const department = await this.departmentsRepository.findOne({
        where: { id: updateComputerDto.departmentId },
      });
      if (!department) {
        throw new NotFoundException(
          `Department with ID ${updateComputerDto.departmentId} not found`,
        );
      }
      computer.department = department;
      computer.departmentId = updateComputerDto.departmentId;
    }

    // If userId is being updated, check if new user exists
    if (updateComputerDto.userId !== undefined) {
      if (updateComputerDto.userId === null) {
        computer.user = null;
        computer.userId = null;
      } else if (updateComputerDto.userId !== computer.userId) {
        const user = await this.usersRepository.findOne({
          where: { id: updateComputerDto.userId },
        });
        if (!user) {
          throw new NotFoundException(
            `User with ID ${updateComputerDto.userId} not found`,
          );
        }
        computer.user = user;
        computer.userId = updateComputerDto.userId;
      }
    }

    // Update other fields
    if (updateComputerDto.name !== undefined)
      computer.name = updateComputerDto.name;
    if (updateComputerDto.serialNumber !== undefined)
      computer.serialNumber = updateComputerDto.serialNumber;
    if (updateComputerDto.operatingSystem !== undefined)
      computer.operatingSystem = updateComputerDto.operatingSystem;
    if (updateComputerDto.domainName !== undefined)
      computer.domainName = updateComputerDto.domainName;
    if (updateComputerDto.applications !== undefined)
      computer.applications = updateComputerDto.applications;
    if (updateComputerDto.assignedDate !== undefined)
      computer.assignedDate = updateComputerDto.assignedDate;

    return await this.computersRepository.save(computer);
  }

  async remove(id: string): Promise<void> {
    const computer = await this.findOne(id);
    await this.computersRepository.remove(computer);
  }

  async findBySerialNumber(serialNumber: string): Promise<Computer> {
    const computer = await this.computersRepository.findOne({
      where: { serialNumber },
      relations: ['model', 'department', 'user'],
    });

    if (!computer) {
      throw new NotFoundException(
        `Computer with serial number ${serialNumber} not found`,
      );
    }

    return computer;
  }
}
