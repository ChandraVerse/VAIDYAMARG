import { Module } from '@nestjs/common';
import { PartnersService } from './partners.service';
import { PartnersController, AdminPartnersController } from './partners.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports:     [PrismaModule, NotificationsModule],
  controllers: [PartnersController, AdminPartnersController],
  providers:   [PartnersService],
  exports:     [PartnersService],   // exported so OrdersModule can call recordEarning()
})
export class PartnersModule {}
