import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { FcmService }           from './fcm.service';
import { JwtAuthGuard }         from '../auth/guards/jwt-auth.guard';
import { RolesGuard }           from '../../common/guards/roles.guard';
import { Roles }                from '../../common/decorators/roles.decorator';

// ─── Patient-facing notification routes ──────────────────────────────────────
@ApiTags('notifications')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly fcm: FcmService,
  ) {}

  /**
   * Register (or refresh) the device FCM token for the logged-in patient.
   * Call this once at app startup and again whenever FCM rotates the token.
   *
   * POST /api/v1/notifications/fcm-token
   * Body: { token: string }
   */
  @Post('fcm-token')
  @ApiOperation({ summary: 'Register device FCM token for push notifications' })
  registerToken(
    @Request() req: any,
    @Body() body: { token: string },
  ) {
    return this.notificationsService.registerFcmToken(req.user.userId, body.token);
  }

  /**
   * List last 50 notifications for the logged-in user.
   * GET /api/v1/notifications
   */
  @Get()
  @ApiOperation({ summary: 'Get notifications for the current user' })
  getAll(@Request() req: any) {
    return this.notificationsService.getNotifications(req.user.userId);
  }

  /**
   * Unread badge count.
   * GET /api/v1/notifications/unread-count
   */
  @Get('unread-count')
  @ApiOperation({ summary: 'Get unread notification count (badge)' })
  unreadCount(@Request() req: any) {
    return this.notificationsService.getUnreadCount(req.user.userId);
  }

  /**
   * Mark a single notification as read.
   * PATCH /api/v1/notifications/:id/read
   */
  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark a notification as read' })
  markRead(
    @Request() req: any,
    @Param('id') id: string,
  ) {
    return this.notificationsService.markAsRead(req.user.userId, id);
  }

  /**
   * Mark all notifications as read.
   * PATCH /api/v1/notifications/read-all
   */
  @Patch('read-all')
  @ApiOperation({ summary: 'Mark all notifications as read' })
  markAllRead(@Request() req: any) {
    return this.notificationsService.markAllRead(req.user.userId);
  }
}

// ─── Admin manual push route ──────────────────────────────────────────────────
@ApiTags('admin')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'PHARMACIST')
@Controller('admin/notifications')
export class AdminNotificationsController {
  constructor(private readonly fcm: FcmService) {}

  /**
   * Send a manual push notification to any device token.
   * POST /api/v1/admin/notifications/send
   */
  @Post('send')
  @ApiOperation({ summary: 'Manually send a push notification to a device token' })
  async send(
    @Body() body: { token: string; title: string; body: string; data?: Record<string, string> },
  ) {
    await this.fcm.sendToToken(body);
    return { success: true };
  }
}
