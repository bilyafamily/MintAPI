import { Injectable } from '@nestjs/common';
import { EmailDto } from './email.dto';
import { MailerService } from '@nestjs-modules/mailer';
import { TicketResolutionEmailDto } from './ticket-resoution.dto';
import { EmailInterface } from './email.interface';
import axios from 'axios';
import { TrainingData } from '../types/trainingData';
import { ServicomTicket } from '../servicom-ticket/entities/servicom-ticket.entity';
import { Ticket } from 'src/ticket/entities/ticket.entity';
// import { join } from 'path';

@Injectable()
export class EmailService {
  constructor(private mailerService: MailerService) {
    // console.log('Template directory:', join(__dirname, 'templates'));
  }

  async sendEmail(payload: EmailDto): Promise<void> {
    try {
      await this.mailerService.sendMail({
        to: payload.email,
        subject: payload.subject,
        template: './account-creation',
        context: {
          name: 'Bilyaminu Abubakar',
          activationLink: payload.body,
        },
      });
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }

  async sendTicketResolutionEmail(
    payload: TicketResolutionEmailDto,
  ): Promise<void> {
    try {
      await this.mailerService.sendMail({
        to: payload.email,
        subject: `Ticket-${payload.ticketRef} Resolved`,
        template: './ticket-resolution',
        context: {
          name: `${payload.name} `,
          comment: payload.comment,
          ticketRef: payload.ticketRef,
        },
      });
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }

  async sendAccountConfirmationEmail(
    to: string,
    name: string,
    activationLink: string,
  ) {
    try {
      await this.mailerService.sendMail({
        to: to,
        subject: 'Account Confirmation - NMDPRA',
        template: './account-creation',
        context: {
          name: name,
          activationLink,
        },
      });
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }

  async sendServicomCloseTicketEmail(ticket: ServicomTicket) {
    try {
      await this.mailerService.sendMail({
        to: ticket.user.email,
        subject: `MINT Support - Ref: ${ticket.ticketRef}`,
        template: './mint-support-resolution',
        context: {
          name: `${ticket.user.firstname} ${ticket.user.lastname} `,
          resolution: ticket.resolution,
          ticketId: ticket.id,
          ticketRef: ticket.ticketRef,
        },
      });
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }

  async passwordResetEmail(to: string, name: string, activationLink: string) {
    try {
      await this.mailerService.sendMail({
        to: to,
        subject: 'NMDPRA Password Reset',
        template: './reset-password',
        context: {
          name: name,
          activationLink,
        },
      });
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }

  async sendTrainingNotification(data: TrainingData) {
    let subject = '';
    if (data.IsRescheduled) {
      subject = 'Training Rescheduled';
    } else if (data.IsReminder) {
      subject = 'Reminder: Training Notification';
    } else {
      subject = 'Training Notification';
    }
    const response = await this.mailerService.sendMail({
      to: data?.StaffEmail,
      subject,
      cc: data?.SupervisorEmail ? data?.SupervisorEmail : '',
      template: './training-notification',
      context: {
        staffName: data?.StaffName,
        data,
      },
    });

    return response;
  }

  async sendSupportCloseTicketEmail(ticket: Ticket) {
    try {
      await this.mailerService.sendMail({
        to: ticket.user.email + ';Rowland.Adeoye@nmdpra.gov.ng',
        subject: `MINT Support - Ref: ${ticket.ticketRef}`,
        template: './mint-support-resolution',
        context: {
          name: `${ticket.user.firstname} ${ticket.user.lastname} `,
          resolution: ticket.resolution,
          ticketId: ticket.id,
          ticketRef: ticket.ticketRef,
        },
      });
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }

  async sendEmailNotification(payload: EmailInterface) {
    try {
      await axios.post(process.env.EMAIL_URL, payload, {
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      console.error('Error:', error.message);
    }
  }
}
