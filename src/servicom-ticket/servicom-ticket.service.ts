import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { AssignSmeDto } from './dto/assign-sme.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ServicomTicket } from './entities/servicom-ticket.entity';
import { Repository } from 'typeorm';
import { generateRandomString } from '../utils/ticket.utils';
import { uploadFileToAzure } from '../utils/uploadFileToAzure';
import { SerivcomAttachment } from '../servicom-attachment/entities/servicom-attachment.entity';
import { CloseServicomTicketDto } from './dto/closeServicom-ticket.dto';
import { User } from '../user/entities/user.entity';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { ServicomTicketCloseNotificationEvent } from '../iam/events/ticket.event';
import { EmailService } from '../email/email.service';
import { ServicomSme } from '../servicom-sme/entities/servicom-sme.entity';

@Injectable()
export class ServicomTicketService {
  private readonly logger = new Logger(ServicomTicketService.name);
  constructor(
    @InjectRepository(ServicomTicket)
    private readonly ticketRepository: Repository<ServicomTicket>,
    @InjectRepository(ServicomSme)
    private readonly smeRepository: Repository<ServicomSme>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(SerivcomAttachment)
    private readonly servicomAttachmentRepository: Repository<SerivcomAttachment>,
    private readonly eventEmitter: EventEmitter2,
    private readonly emailService: EmailService,
  ) {}
  async create(createTicketDto: any, files: Express.Multer.File[] | undefined) {
    try {
      const { title, description, category, user } = createTicketDto;

      const decodedUser = JSON.parse(user);

      if (!decodedUser?.id || !title || !description || !category) {
        throw new BadRequestException('Missing required fields');
      }

      // Find or create user
      const userExist = await this.userRepository.findOne({
        where: { id: decodedUser.id.toLowerCase() },
      });

      const userId = userExist
        ? userExist.id
        : (
            await this.userRepository.save(
              this.userRepository.create({
                firstname: decodedUser.firstname,
                lastname: decodedUser.lastname,
                email: decodedUser.email,
                id: decodedUser.id,
              }),
            )
          ).id;

      const ticket = this.ticketRepository.create({
        title,
        description,
        ticketRef: generateRandomString().toLocaleUpperCase(),
        category: category,
        userId,
      });

      const savedTicket = await this.ticketRepository.save(ticket);

      // Handle multiple file uploads
      if (files && files.length > 0) {
        const uploadPromises = files.map((file) =>
          uploadFileToAzure(file).then((attachment) => {
            const ticketAttachment = this.servicomAttachmentRepository.create({
              fileUrl: attachment.fileUrl,
              ticketId: savedTicket.id,
              ticket: savedTicket,
            });
            return this.servicomAttachmentRepository.save(ticketAttachment);
          }),
        );

        await Promise.all(uploadPromises);
      }

      return savedTicket;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  findAll() {
    return this.ticketRepository.find({
      relations: ['user', 'sme', 'attachements'],
      order: { createdAt: 'desc' },
      select: {
        user: {
          firstname: true,
          lastname: true,
          email: true,
        },
      },
    });
  }

  async findMyDesk(email: string) {
    const sme = await this.smeRepository.findOne({
      where: { email: email.toLowerCase() },
    });

    if (!sme) {
      throw new NotFoundException(
        `user with email ${email.toLowerCase()} is not found`,
      );
    }

    return this.ticketRepository.find({
      where: {
        smeId: sme.id,
      },
      relations: ['user', 'sme', 'attachements'],
      order: { createdAt: 'desc' },
      select: {
        user: {
          firstname: true,
          lastname: true,
          email: true,
        },
      },
    });
  }

  findMyTickets(userId: string) {
    return this.ticketRepository.find({
      where: {
        userId: userId.toLowerCase(),
      },
      relations: ['user', 'sme', 'attachements'],
      order: { createdAt: 'desc' },
      select: {
        user: {
          firstname: true,
          lastname: true,
          email: true,
        },
      },
    });
  }

  async findOne(ticketId: string) {
    try {
      const ticket = await this.ticketRepository.findOne({
        where: { id: ticketId },
        relations: {
          user: true,
          attachements: true,
        },
        select: {
          user: {
            email: true,
            firstname: true,
            lastname: true,
          },
        },
      });
      if (!ticket) {
        throw new NotFoundException(`Ticket with ID ${ticketId} not found.`);
      }
      return ticket;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async assigneSme(id: string, assignSme: AssignSmeDto) {
    try {
      const ticket = await this.ticketRepository.findOne({ where: { id } });

      if (!ticket) {
        return new NotFoundException(`Ticket with ID ${id} not found.`);
      }

      const sme = await this.smeRepository.findOne({
        where: { id: assignSme.smeId.toLowerCase() },
      });

      ticket.assignedBy = assignSme.assignedBy;
      ticket.smeId = assignSme.smeId;
      ticket.sme = sme;
      ticket.currentDesk = 'sme';
      ticket.assignedAt = new Date();
      ticket.status = 'in_progress';
      await this.ticketRepository.save(ticket);

      return ticket;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async closeTicket(id: string, data: CloseServicomTicketDto) {
    try {
      const ticket = await this.ticketRepository.findOne({
        where: { id },
        relations: ['user'],
      });

      ticket.resolution = data.comment;
      ticket.resolvedAt = new Date();
      ticket.currentDesk = 'completed';
      ticket.status = 'resolved';
      await this.ticketRepository.save(ticket);

      this.eventEmitter.emit(
        'servicom-ticket-closed',
        new ServicomTicketCloseNotificationEvent(ticket),
      );

      return ticket;
    } catch (error) {
      console.log(error);
      throw new BadRequestException(error.message);
    }
  }

  @OnEvent('servicom-ticket-closed', { async: true })
  async sendServiceCloseTicketNotification(
    payload: ServicomTicketCloseNotificationEvent,
  ) {
    try {
      await this.emailService.sendServicomCloseTicketEmail(payload.ticket);

      this.logger.log('Sending resolution email to user');
    } catch (error) {}
  }
}
