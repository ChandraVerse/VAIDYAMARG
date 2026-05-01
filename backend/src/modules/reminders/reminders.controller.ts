import {
  Controller, Get, Post, Delete, Param, Body, UseGuards, HttpCode,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RemindersService } from './reminders.service';
import { SetReminderDto } from './dto/set-reminder.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Reminders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('reminders')
export class RemindersController {
  constructor(private readonly remindersService: RemindersService) {}

  @Post()
  @ApiOperation({ summary: 'Set or update a refill reminder for a medicine' })
  setReminder(
    @CurrentUser('id') userId: string,
    @Body() dto: SetReminderDto,
  ) {
    return this.remindersService.setReminder(userId, dto);
  }

  @Get()
  @ApiOperation({ summary: "List the authenticated patient's active reminders" })
  getReminders(@CurrentUser('id') userId: string) {
    return this.remindersService.getReminders(userId);
  }

  @Delete(':id')
  @HttpCode(200)
  @ApiOperation({ summary: 'Delete a refill reminder' })
  deleteReminder(
    @CurrentUser('id') userId: string,
    @Param('id') reminderId: string,
  ) {
    return this.remindersService.deleteReminder(userId, reminderId);
  }
}
