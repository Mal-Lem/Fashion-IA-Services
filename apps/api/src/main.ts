import { setDefaultResultOrder } from 'dns';
setDefaultResultOrder('ipv4first');
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import * as compression from 'compression';
import { AppModule } from './app.module';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { GlobalExceptionFilter } from './common/filters/http-exception.filter';

// ── Crash handlers (empêche le process de mourir sans log) ──
const crashLogger = new Logger('Process');

process.on('uncaughtException', (error: Error) => {
  crashLogger.error(`[uncaughtException] ${error.message}`, error.stack);
  process.exit(1);
});

process.on('unhandledRejection', (reason: unknown) => {
  const message = reason instanceof Error ? reason.message : String(reason);
  const stack = reason instanceof Error ? reason.stack : undefined;
  crashLogger.error(`[unhandledRejection] ${message}`, stack);
});

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT', 3001);
  const nodeEnv = configService.get<string>('NODE_ENV', 'development');

  // ── Sécurité ──────────────────────────────────
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          imgSrc: ["'self'", 'storage.scaleway.com', 'data:'],
          scriptSrc: ["'self'"],
        },
      },
      crossOriginEmbedderPolicy: false,
    }),
  );

  // ── Compression ───────────────────────────────
  app.use(compression());

  // ── CORS ─────────────────────────────────────
  app.enableCors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
});

  // ── Validation globale ────────────────────────
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,           // Strip les propriétés non déclarées dans les DTOs
      forbidNonWhitelisted: true, // Rejette les requêtes avec des propriétés inconnues
      transform: true,            // Auto-transform les types
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );
// Intercepteur de logs
app.useGlobalInterceptors(new LoggingInterceptor());

// Filtre d'exceptions global
app.useGlobalFilters(new GlobalExceptionFilter());
  // ── Préfixe API ────────────────────────────────
  app.setGlobalPrefix('v1');
// ── Swagger Documentation ─────────────────────────
if (process.env.NODE_ENV !== 'production') {
  const config = new DocumentBuilder()
    .setTitle('Fashion AI Platform API')
    .setDescription('API complète de la plateforme Fashion AI — Génération de vêtements, Marketplace couturières, Messagerie')
    .setVersion('1.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'JWT'
    )
    .addTag('auth', 'Authentification et gestion de compte')
    .addTag('designs', 'Génération et gestion des designs IA')
    .addTag('couturieres', 'Marketplace et profils couturières')
    .addTag('orders', 'Commandes et workflow')
    .addTag('messages', 'Messagerie temps réel')
    .addTag('users', 'Profil utilisateur et morphologie')
    .addTag('health', 'Monitoring et santé de l\'API')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  console.log(`📚 Swagger disponible sur : http://localhost:${port}/api/docs`);
}
  await app.listen(port);

  console.log(`
╔════════════════════════════════════════╗
║  Fashion AI Platform — API             ║
║  Environnement : ${nodeEnv.padEnd(22)}║
║  Port          : ${String(port).padEnd(22)}║
║  URL           : http://localhost:${port}  ║
╚════════════════════════════════════════╝
  `);
}

bootstrap();
