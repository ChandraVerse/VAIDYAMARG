import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { AddAddressDto } from './dto/add-address.dto';
import { AddHealthRecordDto } from './dto/add-health-record.dto';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/v1/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // ─── My Profile ────────────────────────────────────────────────────────────
  @Get('profile')
  @ApiOperation({ summary: 'Get my profile' })
  async getProfile(@CurrentUser() user: { id: string }) {
    return this.usersService.getProfile(user.id);
  }

  @Patch('profile')
  @ApiOperation({ summary: 'Update my profile' })
  async updateProfile(
    @CurrentUser() user: { id: string },
    @Body() dto: UpdateProfileDto,
  ) {
    return this.usersService.updateProfile(user.id, dto);
  }

  // ─── Addresses ─────────────────────────────────────────────────────────────
  @Get('addresses')
  @ApiOperation({ summary: 'Get all my saved addresses' })
  async getAddresses(@CurrentUser() user: { id: string }) {
    return this.usersService.getAddresses(user.id);
  }

  @Post('addresses')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add a new delivery address' })
  async addAddress(
    @CurrentUser() user: { id: string },
    @Body() dto: AddAddressDto,
  ) {
    return this.usersService.addAddress(user.id, dto);
  }

  @Patch('addresses/:id/default')
  @ApiOperation({ summary: 'Set an address as default' })
  async setDefaultAddress(
    @CurrentUser() user: { id: string },
    @Param('id', ParseUUIDPipe) addressId: string,
  ) {
    return this.usersService.setDefaultAddress(user.id, addressId);
  }

  @Delete('addresses/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a saved address' })
  async deleteAddress(
    @CurrentUser() user: { id: string },
    @Param('id', ParseUUIDPipe) addressId: string,
  ) {
    return this.usersService.deleteAddress(user.id, addressId);
  }

  // ─── Health Records ────────────────────────────────────────────────────────
  @Get('health-records')
  @ApiOperation({ summary: 'Get my health records (allergies, conditions)' })
  async getHealthRecords(@CurrentUser() user: { id: string }) {
    return this.usersService.getHealthRecords(user.id);
  }

  @Post('health-records')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add a health record entry' })
  async addHealthRecord(
    @CurrentUser() user: { id: string },
    @Body() dto: AddHealthRecordDto,
  ) {
    return this.usersService.addHealthRecord(user.id, dto);
  }

  @Delete('health-records/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a health record entry' })
  async deleteHealthRecord(
    @CurrentUser() user: { id: string },
    @Param('id', ParseUUIDPipe) recordId: string,
  ) {
    return this.usersService.deleteHealthRecord(user.id, recordId);
  }

  // ─── Dashboard Stats ───────────────────────────────────────────────────────
  @Get('dashboard')
  @ApiOperation({ summary: 'My dashboard — orders, savings, prescriptions summary' })
  async getDashboard(@CurrentUser() user: { id: string }) {
    return this.usersService.getDashboard(user.id);
  }

  // ─── Admin: All Users ──────────────────────────────────────────────────────
  @Get('admin/all')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Admin: list all users' })
  async getAllUsers() {
    return this.usersService.getAllUsers();
  }
}
