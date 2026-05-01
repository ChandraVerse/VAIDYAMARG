import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { PaymentService } from './payment.service';
import { OrderGateway } from './order.gateway';
import { AdminOrdersController } from './admin-orders.controller';
import { AdminOrdersService } from './admin-orders.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { RemindersModule } from '../reminders/reminders.module';
import { PartnersModule } from '../partners/partners.module';

@Module({
  imports: [
    PrismaModule,
    NotificationsModule, // NotificationsService
    RemindersModule,     // RemindersService
    PartnersModule,      // PartnersService — recordEarning() on DELIVERED
  ],
  controllers: [OrdersController, AdminOrdersController],
  providers:   [OrdersService, PaymentService, OrderGateway, AdminOrdersService],
  exports:     [OrdersService],
})
export class OrdersModule {}
