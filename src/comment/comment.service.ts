import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './entities/comment.entity';
import { User } from '../user/entities/user.entity';
import { uploadFileToAzure } from 'src/utils/uploadFileToAzure';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Comment)
    private readonly ticketRepository: Repository<Comment>,

    @InjectRepository(User)
    private readonly userRepoo: Repository<User>,
  ) {}

  async create(
    createCommentDto: any,

    file: Express.Multer.File,
  ) {
    try {
      const { commentBy } = createCommentDto;

      const payload = {
        ...createCommentDto,
        commentBy,
        fileUrl: '',
      };
      // Save attachments (if they exist)
      if (file) {
        const attachment = await uploadFileToAzure(file);
        payload.fileUrl = attachment.fileUrl;
      }
      const comment = this.ticketRepository.create(payload);
      return this.ticketRepository.save(comment);
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  findAll() {
    return this.ticketRepository.find({ order: { createdAt: 'asc' } });
  }

  findOne(id: number) {
    return `This action returns a #${id} comment`;
  }

  remove(id: number) {
    return `This action removes a #${id} comment`;
  }
}
