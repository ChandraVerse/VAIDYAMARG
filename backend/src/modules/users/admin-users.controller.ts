import { Controller, Get, Query, Param, UseGuards } from '@nestjs/common';
import { AdminUsersService } from './admin-users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('admin/users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class AdminUsersController {
  constructor(private readonly adminUsersService: AdminUsersService) {}

  @Get()
  list(
    @Query('search') search?: string,
    @Query('page')   page = '1',
    @Query('limit')  limit = '20',
  ) {
    return this.adminUsersService.listUsers({
      search,
      page:  Number(page),
      limit: Number(limit),
    });
  }

  @Get(':id')
  detail(@Param('id') id: string) {
    return this.adminUsersService.getUser(id);
  }
}
