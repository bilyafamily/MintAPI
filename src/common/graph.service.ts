// src/mail/graph.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { Client } from '@microsoft/microsoft-graph-client';
import { ClientSecretCredential } from '@azure/identity';

@Injectable()
export class GraphService {
  private readonly logger = new Logger(GraphService.name);

  private async getClient() {
    const credential = new ClientSecretCredential(
      process.env.AZURE_AD_TENANT_ID,
      process.env.AZURE_CLIENT_ID,
      process.env.AZURE_CLIENT_SECRET,
    );

    const token = await credential.getToken(
      'https://graph.microsoft.com/.default',
    );

    return Client.init({
      authProvider: (done) => {
        done(null, token?.token || '');
      },
    });
  }

  async getUnreadEmails(userEmail: string) {
    try {
      const client = await this.getClient();

      const messages = await client
        .api(`/users/${userEmail}/messages`)
        .filter('isRead eq false')
        .top(10)
        .get();

      return messages.value || [];
    } catch (error) {
      console.log(error);
    }
  }

  async markAsRead(userEmail: string, messageId: string) {
    const client = await this.getClient();

    await client.api(`/users/${userEmail}/messages/${messageId}`).patch({
      isRead: true,
    });
  }
}
