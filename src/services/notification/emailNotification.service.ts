import { Injectable } from '@nestjs/common';
import { Ticket } from '../../ticket/entities/ticket.entity';
import { NotificationGateway } from './notification.gateway';

@Injectable()
export class EmailNotificationService {
  constructor(private readonly notificationGateway: NotificationGateway) {}

  sendNotification(data: { agentId: string; message: string }) {
    this.notificationGateway.server.emit(
      `notification:${data.agentId}`,
      data.message,
    );
  }
  async notifySLABreach(ticket: Ticket): Promise<void> {
    const agentEmail = ticket.agent.email;
    const adminEmail = 'admin@example.com'; // Replace with your admin email

    // Notify the agent
    console.log(
      `Email sent to agent (${agentEmail}): SLA breached for Ticket #${ticket.id}`,
    );
    this.notificationGateway.sendNotification(
      'sla-breach',
      `Email sent to agent (${agentEmail}): SLA breached for Ticket #${ticket.id}`,
    );

    // Notify the admin
    console.log(
      `Email sent to admin (${adminEmail}): SLA breached for Ticket #${ticket.id}`,
    );
  }

  async notifySupervisor(ticket: Ticket): Promise<void> {
    const supervisorEmail = 'supervisor@example.com'; // Replace with real email
    console.log(supervisorEmail);
    console.log(`Supervisor notified: Escalation for Ticket #${ticket.id}`);
    this.notificationGateway.sendNotification(
      'supervisor-escalation',
      `Email sent to agent (${supervisorEmail}): SLA breached for Ticket #${ticket.id}`,
    );
  }

  async notifyAdmin(ticket: Ticket): Promise<void> {
    const adminEmail = 'admin@example.com'; // Replace with real email
    // console.log(adminEmail);
    // console.log(`Admin notified: Final escalation for Ticket #${ticket.id}`);
    this.notificationGateway.sendNotification(
      'admin-escalation',
      `Email sent to agent (${adminEmail}): SLA breached for Ticket #${ticket.id}`,
    );
  }
}
