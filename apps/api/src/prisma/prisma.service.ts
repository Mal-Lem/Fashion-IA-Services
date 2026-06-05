import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
  super({
    datasources: {
      db: {
        url: 'postgresql://fap_user:fap_password@localhost:5432/fap_dev?connection_limit=10&pool_timeout=20',
      },
    },
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });
}

  async onModuleInit() {
    await this.$connect();
    this.logger.log('Connexion PostgreSQL etablie');
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
