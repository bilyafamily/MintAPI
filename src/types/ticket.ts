export interface SatisfactionData {
  name: string;
  value: number;
  color: string;
}

export interface TicketData {
  month: string;
  resolved: number;
  pending: number;
  escalated: number;
}

export interface ResponseTimeData {
  month: string;
  avgTime: number;
}

export interface AgentStats {
  agentId: string;
  agentEmail: string;
  ticketData: TicketData[];
  responseTimeData: ResponseTimeData[];
  satisfactionData: SatisfactionData[];
  averageRating: number;
  totalTickets: number;
  resolved: number;
  escalated: number;
  pending: number;
}
