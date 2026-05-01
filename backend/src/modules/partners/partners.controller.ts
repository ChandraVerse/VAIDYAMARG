import {
  Controller, Get, Post, Patch, Param, Body,
  UseGuards, Request, Query, DefaultValuePipe, ParseIntPipe,
} from '@nestjs/common';
import { PartnersService } from './partners.service';
import { OnboardPartnerDto } from './dto/onboard-partner.dto';
import { ReviewPartnerDto } from './dto/review-partner.dto';
import { UpdatePartnerDto } from './dto/update-partner.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

// ─────────────────────────────────────────────────────────────────────────────
// PHARMACIST routes  /partners/*
// ─────────────────────────────────────────────────────────────────────────────
@Controller('partners')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PartnersController {
  constructor(private readonly svc: PartnersService) {}

  /** POST /partners/onboard  — Submit pharmacy application */
  @Post('onboard')
  @Roles('PHARMACIST', 'ADMIN')
  onboard(@Body() dto: OnboardPartnerDto, @Request() req: any) {
    return this.svc.onboard(dto, req.user.id);
  }

  /** GET /partners/me  — Own pharmacy profile + last 5 earnings */
  @Get('me')
  @Roles('PHARMACIST', 'ADMIN')
  getMyPharmacy(@Request() req: any) {
    return this.svc.getMyPharmacy(req.user.id);
  }

  /** PATCH /partners/me  — Update own pharmacy profile */
  @Patch('me')
  @Roles('PHARMACIST', 'ADMIN')
  updateMyPharmacy(@Body() dto: UpdatePartnerDto, @Request() req: any) {
    return this.svc.updateMyPharmacy(dto, req.user.id);
  }

  /** GET /partners/me/analytics  — Revenue + orders chart (last 30 days) */
  @Get('me/analytics')
  @Roles('PHARMACIST', 'ADMIN')
  getMyAnalytics(@Request() req: any) {
    return this.svc.getMyAnalytics(req.user.id);
  }

  /** GET /partners/me/earnings  — Paginated earnings history */
  @Get('me/earnings')
  @Roles('PHARMACIST', 'ADMIN')
  getMyEarnings(
    @Request() req: any,
    @Query('page',  new DefaultValuePipe(1),  ParseIntPipe) page:  number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.svc.getMyEarnings(req.user.id, page, limit);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN routes  /admin/partners/*
// ─────────────────────────────────────────────────────────────────────────────
@Controller('admin/partners')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class AdminPartnersController {
  constructor(private readonly svc: PartnersService) {}

  /** GET /admin/partners  — List all pharmacies (filter by ?status=PENDING) */
  @Get()
  list(
    @Query('status') status: string,
    @Query('page',  new DefaultValuePipe(1),  ParseIntPipe) page:  number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.svc.adminListPharmacies(status, page, limit);
  }

  /** GET /admin/partners/:id  — Single pharmacy detail */
  @Get(':id')
  get(@Param('id') id: string) {
    return this.svc.adminGetPharmacy(id);
  }

  /** PATCH /admin/partners/:id/review  — Approve or reject */
  @Patch(':id/review')
  review(
    @Param('id') id: string,
    @Body() dto: ReviewPartnerDto,
    @Request() req: any,
  ) {
    return this.svc.adminReviewPharmacy(id, dto, req.user.id);
  }

  /** PATCH /admin/partners/:id/suspend  — Suspend */
  @Patch(':id/suspend')
  suspend(@Param('id') id: string, @Request() req: any) {
    return this.svc.adminToggleSuspend(id, true, req.user.id);
  }

  /** PATCH /admin/partners/:id/reinstate  — Lift suspension */
  @Patch(':id/reinstate')
  reinstate(@Param('id') id: string, @Request() req: any) {
    return this.svc.adminToggleSuspend(id, false, req.user.id);
  }
}
