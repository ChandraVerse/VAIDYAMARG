import { NestFactory }   from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService }  from '@nestjs/config';
import { IoAdapter }      from '@nestjs/platform-socket.io';
import helmet            from 'helmet';
import { AppModule }      from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // ── Security ─────────────────────────────────────────────────────────────────
  app.use(helmet());
  app.enableCors({
    origin:      configService.get('CORS_ORIGINS', 'http://localhost:3001').split(','),
    methods:     ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
  });

  // ── WebSocket adapter ─────────────────────────────────────────────────────────
  // REQUIRED: without this NestJS uses the default ws adapter and Socket.io
  // rooms, namespaces, and cors on WebSocketGateway all silently break.
  app.useWebSocketAdapter(new IoAdapter(app));

  // ── Global prefix ─────────────────────────────────────────────────────────────
  app.setGlobalPrefix('api/v1');

  // ── Validation ───────────────────────────────────────────────────────────────
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist:             true,
      forbidNonWhitelisted:  true,
      transform:             true,
      transformOptions:      { enableImplicitConversion: true },
    }),
  );

  // ── Swagger API Docs ─────────────────────────────────────────────────────────
  const config = new DocumentBuilder()
    .setTitle('VaidyaMarg API')
    .setDescription(
      `## Affordable Medicine Platform \u2014 REST API\n\n` +
      `All endpoints are prefixed with \`/api/v1\`.\n\n` +
      `**Authentication:** Send the JWT access token as \`Authorization: Bearer <token>\`.\n\n` +
      `**OTP flow:** \`POST /auth/send-otp\` \u2192 \`POST /auth/verify-otp\` \u2192 receive \`accessToken\` + \`refreshToken\`.\n\n` +
      `**WebSocket:** Connect to \`ws://host/orders\` (Socket.io namespace).\n` +
      `  Emit \`join_user_room\`  with \`{ userId }\` to receive all order updates for a user.\n` +
      `  Emit \`join_order_room\` with \`{ orderId }\` to track a single order in real time.\n` +
      `  Listen for \`order_updated\` event: \`{ orderId, status }\`.`,
    )
    .setVersion('1.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT', in: 'header' },
      'access-token',
    )
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
      persistAuthorization: true,
      tagsSorter:           'alpha',
      operationsSorter:     'alpha',
    },
    customSiteTitle: 'VaidyaMarg API Docs',
  });

  const port = configService.get<number>('PORT', 3000);
  await app.listen(port);

  logger.log(`\ud83c\udfe5 VaidyaMarg API     : http://localhost:${port}/api/v1`);
  logger.log(`\ud83d\udcd6 Swagger Docs       : http://localhost:${port}/api/docs`);
  logger.log(`\ud83d\udd0c WebSocket (orders) : ws://localhost:${port}/orders`);
}

bootstrap();
