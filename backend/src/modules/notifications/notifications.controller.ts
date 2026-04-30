import {
  Controller, Get, Post, Patch,
  Param, Body, UseGuards,
  ParseUUIDPipe, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RegisterFcmTokenDto } from './dto/register-fcm-token.dto';

@ApiTags('Notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/v1/notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  // ─── Get my notifications ──────────────────────────────────────────────────
  @Get()
  @ApiOperation({ summary: 'Get all my notifications' })
  async getMyNotifications(@CurrentUser() user: { id: string }) {
    return this.notificationsService.getNotifications(user.id);
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Get unread notification count' })
  async getUnreadCount(@CurrentUser() user: { id: string }) {
    return this.notificationsService.getUnreadCount(user.id);
  }

  // ─── Mark as read ─────────────────────────────────────────────────────────
  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark a notification as read' })
  async markAsRead(
    @CurrentUser() user: { id: string },
    @Param('id', ParseUUIDPipe) notifId: string,
  ) {
    return this.notificationsService.markAsRead(user.id, notifId);
  }

  @Patch('read-all')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark all notifications as read' })
  async markAllRead(@CurrentUser() user: { id: string }) {
    return this.notificationsService.markAllRead(user.id);
  }

  // ─── FCM Token (for push notifications) ────────────────────────────────────
  @Post('fcm-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Register device FCM token for push notifications' })
  async registerFcmToken(
    @CurrentUser() user: { id: string },
    @Body() dto: RegisterFcmTokenDto,
  ) {
    return this.notificationsService.registerFcmToken(user.id, dto.token);
  }
}
