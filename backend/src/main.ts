import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Security
  app.use(helmet());
  app.enableCors({
    origin: configService.get('CORS_ORIGINS', 'http://localhost:3001').split(','),
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
  });

  // Global prefix
  app.setGlobalPrefix('api/v1');

  // Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // ── Swagger API Docs ─────────────────────────────────────────────────────
  const config = new DocumentBuilder()
    .setTitle('VaidyaMarg API')
    .setDescription(
      `## Affordable Medicine Platform — REST API\n\n` +
      `All endpoints are prefixed with \`/api/v1\`.\n\n` +
      `**Authentication:** Send the JWT access token as \`Authorization: Bearer <token>\`.\n\n` +
      `**OTP flow:** \`POST /auth/send-otp\` → \`POST /auth/verify-otp\` → receive \`accessToken\` + \`refreshToken\`.`,
    )
    .setVersion('1.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT', in: 'header' },
      'access-token',
    )
    // ── Tags (appear as sections in Swagger UI) ──
    .addTag('auth',          'OTP-based authentication & token refresh')
    .addTag('users',         'Patient profile management')
    .addTag('medicines',     'Medicine catalogue, search & stock')
    .addTag('orders',        'Order placement, tracking & payment')
    .addTag('prescriptions', 'Prescription upload & pharmacist verification')
    .addTag('reminders',     'Refill reminder preferences (Bull-queued)')
    .addTag('admin',         'Admin & pharmacist dashboard KPIs + charts')
    .addTag('notifications', 'In-app & push notification management')
    .addTag('partners',      'B2B partner / pharmacy onboarding')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,   // keeps the Bearer token across page refreshes
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
    customSiteTitle: 'VaidyaMarg API Docs',
  });

  const port = configService.get<number>('PORT', 3000);
  await app.listen(port);

  logger.log(`🏥 VaidyaMarg API running on: http://localhost:${port}/api/v1`);
  logger.log(`📖 Swagger Docs:              http://localhost:${port}/api/docs`);
}

bootstrap();
