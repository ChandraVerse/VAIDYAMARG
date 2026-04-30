import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiParam,
  ApiResponse,
} from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { VerifyPaymentDto } from './dto/verify-payment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('orders')
@Controller('orders')
@UseGuards(JwtAuthGuard)           // All order routes require login
@ApiBearerAuth()
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  // -------------------------------------------------------
  // POST /orders  — Place a new order
  // -------------------------------------------------------
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Place a new order — creates Razorpay payment order' })
  @ApiResponse({ status: 201, description: 'Order created. Returns Razorpay order ID for payment.' })
  create(
    @Body() dto: CreateOrderDto,
    @CurrentUser() user: any,
  ) {
    return this.ordersService.create(dto, user.id);
  }

  // -------------------------------------------------------
  // POST /orders/verify-payment  — Confirm Razorpay payment
  // -------------------------------------------------------
  @Post('verify-payment')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify Razorpay payment signature after successful payment' })
  @ApiResponse({ status: 200, description: 'Payment verified — order confirmed' })
  @ApiResponse({ status: 400, description: 'Payment verification failed' })
  verifyPayment(
    @Body() dto: VerifyPaymentDto,
    @CurrentUser() user: any,
  ) {
    return this.ordersService.verifyPayment(dto, user.id);
  }

  // -------------------------------------------------------
  // GET /orders/history  — My order history
  // -------------------------------------------------------
  @Get('history')
  @ApiOperation({ summary: 'Get current user\'s order history' })
  getHistory(@CurrentUser() user: any) {
    return this.ordersService.getHistory(user.id);
  }

  // -------------------------------------------------------
  // GET /orders/track/:id  — Real-time tracking
  // -------------------------------------------------------
  @Get('track/:id')
  @ApiOperation({ summary: 'Track a specific order by ID' })
  @ApiParam({ name: 'id', description: 'Order ID' })
  track(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ) {
    return this.ordersService.track(id, user.id);
  }

  // -------------------------------------------------------
  // GET /orders/:id  — Order detail
  // -------------------------------------------------------
  @Get(':id')
  @ApiOperation({ summary: 'Get full order details' })
  findOne(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ) {
    return this.ordersService.findOne(id, user.id);
  }

  // -------------------------------------------------------
  // PATCH /orders/:id/cancel  — Cancel order
  // -------------------------------------------------------
  @Patch(':id/cancel')
  @ApiOperation({ summary: 'Cancel a pending or confirmed order' })
  @ApiParam({ name: 'id', description: 'Order ID' })
  cancel(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ) {
    return this.ordersService.cancel(id, user.id);
  }

  // -------------------------------------------------------
  // PATCH /orders/:id/status  — Update status (Admin/Pharmacist)
  // -------------------------------------------------------
  @Patch(':id/status')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'PHARMACIST')
  @ApiOperation({ summary: '[Admin/Pharmacist] Update order status' })
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: string,
  ) {
    return this.ordersService.updateStatus(id, status);
  }
}
