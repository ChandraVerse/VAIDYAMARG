import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { FcmService } from './fcm.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('admin/notifications')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'PHARMACIST')
export class NotificationsController {
  constructor(private readonly fcm: FcmService) {}

  @Post('send')
  async send(@Body() body: { token: string; title: string; body: string; data?: Record<string, string> }) {
    await this.fcm.sendToToken(body);
    return { success: true };
  }
}
