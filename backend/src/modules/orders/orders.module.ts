import { Module, forwardRef } from '@nestjs/common';
import { OrdersController }    from './orders.controller';
import { OrdersService }       from './orders.service';
import { PaymentService }      from './payment.service';
import { OrderGateway }        from './order.gateway';
import { AdminOrdersController } from './admin-orders.controller';
import { AdminOrdersService }  from './admin-orders.service';
import { PrismaModule }        from '../../prisma/prisma.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { RemindersModule }     from '../reminders/reminders.module';
import { PartnersModule }      from '../partners/partners.module';

@Module({
  imports: [
    PrismaModule,
    NotificationsModule,
    RemindersModule,
    // forwardRef here mirrors the forwardRef in OrdersService constructor.
    // Without it NestJS throws a circular dependency error at bootstrap.
    forwardRef(() => require('../partners/partners.module').PartnersModule),
    PartnersModule,
  ],
  controllers: [OrdersController, AdminOrdersController],
  providers:   [OrdersService, PaymentService, OrderGateway, AdminOrdersService],
  exports:     [OrdersService, OrderGateway],
})
export class OrdersModule {}
