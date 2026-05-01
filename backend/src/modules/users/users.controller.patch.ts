/**
 * PATCH /users/me/fcm-token
 *
 * Add this endpoint to your existing UsersController.
 * The snippet below is a self-contained diff-style reference;
 * copy the method into UsersController and add the import.
 *
 * ─── Imports to add ──────────────────────────────────────────────────────────
 *   import { RegisterFcmTokenDto } from './dto/fcm-token.dto';
 *
 * ─── Method to add inside UsersController class ──────────────────────────────
 *
 *   @Patch('me/fcm-token')
 *   @UseGuards(JwtAuthGuard)
 *   @HttpCode(HttpStatus.OK)
 *   @ApiOperation({ summary: 'Register or refresh FCM push token for this device' })
 *   @ApiOkResponse({ description: 'Token registered' })
 *   async registerFcmToken(
 *     @Request() req: any,
 *     @Body() dto: RegisterFcmTokenDto,
 *   ) {
 *     return this.usersService.registerFcmToken(req.user.sub, dto.token);
 *   }
 *
 * UsersService.registerFcmToken() already exists on NotificationsService
 * (delegated via users.service). If it is not on UsersService yet, add:
 *
 *   async registerFcmToken(userId: string, token: string) {
 *     await this.prisma.user.update({ where: { id: userId }, data: { fcmToken: token } });
 *     return { success: true, message: 'Push notifications enabled' };
 *   }
 */

// This file is documentation only — it is not compiled by NestJS.
export {};
