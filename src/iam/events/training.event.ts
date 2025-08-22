import { Logger } from '@nestjs/common';
import { TrainingData } from 'src/types/trainingData';

export class TrainingNotificationEvent {
  private readonly logger = new Logger(TrainingNotificationEvent.name);
  constructor(public readonly trainingData: TrainingData[]) {}
}
