import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
  ) {}
  async create(createUserDto: CreateUserDto) {
    const user = this.userRepo.create(createUserDto);
    user.email = createUserDto.email.toLowerCase();
    user.firstname = createUserDto.firstname.toLowerCase();
    user.lastname = createUserDto.lastname.toLowerCase();
    await this.userRepo.save(user);
    return user;
  }

  async findAll() {
    return await this.userRepo.find({ order: { createdAt: 'desc' } });
  }

  async findOne(email: string): Promise<User> {
    this.logger.log(`Getting user with id ${email}`);
    return this.userRepo.findOne({ where: { email } });
  }

  save(user: User) {
    return this.userRepo.save(user);
  }

  async toggleUserStatus(id: string) {
    this.logger.log(`Getting user with id ${id}`);
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    user.isEnabled = !user.isEnabled;
    return this.userRepo.save(user);
  }

  async findByEmail(email: string): Promise<User | undefined> {
    this.logger.log(`Getting user with id ${email}`);
    return this.userRepo.findOneBy({ email });
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    return await this.userRepo.update(
      {
        id,
      },
      updateUserDto,
    );
  }

  async remove(id: number) {
    return await this.userRepo.delete(id);
  }
}
