import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class CacheService implements OnModuleInit {
  private readonly logger = new Logger(CacheService.name);
  private client: Redis;

  constructor(private config: ConfigService) {}

  onModuleInit() {
    this.client = new Redis({
      host: this.config.get('REDIS_HOST', 'localhost'),
      port: this.config.get<number>('REDIS_PORT', 6379),
      password: this.config.get('REDIS_PASSWORD'),
      retryStrategy: (times) => Math.min(times * 50, 2000),
      lazyConnect: true,
    });

    this.client.on('connect', () => this.logger.log('Cache Redis connecte'));
    this.client.on('error', (err) => this.logger.warn(`Cache Redis erreur : ${err.message}`));
  }

  // Lire depuis le cache
  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.client.get(key);
      if (!value) return null;
      return JSON.parse(value) as T;
    } catch {
      return null;
    }
  }

  // Ecrire dans le cache
  async set(key: string, value: any, ttlSeconds = 300): Promise<void> {
    try {
      await this.client.setex(key, ttlSeconds, JSON.stringify(value));
    } catch (err) {
      this.logger.warn(`Cache set failed for key ${key}: ${err.message}`);
    }
  }

  // Supprimer une clé
  async del(key: string): Promise<void> {
    try {
      await this.client.del(key);
    } catch {}
  }

  // Supprimer toutes les clés qui matchent un pattern
  async delPattern(pattern: string): Promise<void> {
    try {
      const keys = await this.client.keys(pattern);
      if (keys.length > 0) {
        await this.client.del(...keys);
        this.logger.debug(`Cache invalidé : ${keys.length} clés supprimées (${pattern})`);
      }
    } catch {}
  }

  // Helper : get ou set (cache-aside pattern)
  async getOrSet<T>(
    key: string,
    fetchFn: () => Promise<T>,
    ttlSeconds = 300,
  ): Promise<T> {
    // 1. Chercher dans le cache
    const cached = await this.get<T>(key);
    if (cached !== null) {
      this.logger.debug(`Cache HIT : ${key}`);
      return cached;
    }

    // 2. Cache miss — appeler la fonction
    this.logger.debug(`Cache MISS : ${key}`);
    const fresh = await fetchFn();

    // 3. Stocker dans le cache
    await this.set(key, fresh, ttlSeconds);

    return fresh;
  }
}