import { Injectable, NotFoundException } from '@nestjs/common';
import { HashingService } from '../iam/hashing/hashing.service';
import { GeneratedApiKeyPayload } from '../iam/types/gnerated-api-key-payload.interface';
import { randomUUID } from 'crypto';
import { ApiKey } from './entities/api-key.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class ApiKeyService {
  constructor(
    private readonly hashingService: HashingService,
    @InjectRepository(ApiKey)
    private readonly apiKeyRepo: Repository<ApiKey>,
  ) {}
  async createAndHash(name: string): Promise<GeneratedApiKeyPayload> {
    const { apiKey, id } = this.generateApiKey();
    const hashedKey = await this.hashingService.hash(apiKey);

    await this.apiKeyRepo.save({
      id,
      hashedKey: hashedKey,
      name,
    });

    return {
      apiKey,
      name,
    };
  }

  async validate(apiKeyId: string, providedKey: string): Promise<boolean> {
    const apiKeyEntity = await this.apiKeyRepo.findOne({
      where: { id: apiKeyId },
    });

    if (!apiKeyEntity || apiKeyEntity.revokedAt) {
      return false;
    }
    return this.hashingService.compare(providedKey, apiKeyEntity.hashedKey);
  }

  async findAll(): Promise<ApiKey[]> {
    return this.apiKeyRepo.find({
      select: ['id', 'name', 'createdAt', 'revokedAt', 'expiredAt'],
    });
  }

  async revokeApiKey(hashedKey: string): Promise<void> {
    const keyId = this.extractIdFromApiKey(hashedKey);

    const apiKey = await this.apiKeyRepo.findOne({
      where: { id: keyId },
    });

    if (!apiKey)
      throw new NotFoundException(`API Key with ID ${keyId} not found`);

    apiKey.revokedAt = new Date();
    await this.apiKeyRepo.save(apiKey);
  }

  async remove(id: string): Promise<void> {
    const apiKey = await this.apiKeyRepo.findOne({ where: { id } });
    if (!apiKey) {
      throw new NotFoundException(`API Key with ID ${id} not found`);
    }
    await this.apiKeyRepo.remove(apiKey);
  }

  extractIdFromApiKey(apiKey: string): string {
    const [id] = Buffer.from(apiKey, 'base64').toString('ascii').split(' ');
    console.log('Extracted ID:', id);
    return id;
  }

  private generateApiKey(): { id: string; apiKey: string } {
    const id = randomUUID();
    const apiKeyPayload = `${id} ${randomUUID()}`;
    const apiKey = Buffer.from(apiKeyPayload).toString('base64'); //create string with no spaces

    return { id, apiKey };
  }
}
