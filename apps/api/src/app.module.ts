import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthModule } from './auth/auth.module';
import { CacheModule } from './cache/cache.module';
import { PrismaModule } from './prisma/prisma.module';
import { EventsModule } from './events/events.module';
import { DesignsModule } from './designs/designs.module';
import { CouturieresModule } from './couturieres/couturieres.module';
import { UsersModule } from './users/users.module';
import { OrdersModule } from './orders/orders.module';
import { MessagesModule } from './messages/messages.module';
import { StorageModule } from './storage/storage.module';
import { HealthModule } from './health/health.module';
import { ReviewsModule } from './reviews/reviews.module';


@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: ['.env.local', '.env'] }),
    ThrottlerModule.forRoot([{ name: 'default', ttl: 60000, limit: 100 }]),
    PrismaModule,
    EventsModule,
    AuthModule,
    UsersModule,
    DesignsModule,
    CouturieresModule,
    MessagesModule,
    OrdersModule,
    CacheModule,
    StorageModule,
    HealthModule,
    ReviewsModule,
  ],
})
export class AppModule {}
