import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiQuery,
  ApiParam,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';
import { MedicinesService } from './medicines.service';
import { SearchMedicineDto } from './dto/search-medicine.dto';
import { CreateMedicineDto } from './dto/create-medicine.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('medicines')
@Controller('medicines')
export class MedicinesController {
  constructor(private readonly medicinesService: MedicinesService) {}

  // -------------------------------------------------------
  // GET /medicines/search?q=paracetamol
  // Public — no auth needed
  // -------------------------------------------------------
  @Get('search')
  @ApiOperation({ summary: 'Search medicines by name (brand or generic)' })
  @ApiQuery({ name: 'q', description: 'Medicine name to search', example: 'paracetamol' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiResponse({ status: 200, description: 'List of matching medicines with generic alternatives' })
  search(@Query() dto: SearchMedicineDto) {
    return this.medicinesService.search(dto);
  }

  // -------------------------------------------------------
  // GET /medicines/compare?brand=Dolo650
  // Public — core VaidyaMarg feature!
  // -------------------------------------------------------
  @Get('compare')
  @ApiOperation({ summary: 'Compare branded medicine vs generic alternatives (price difference)' })
  @ApiQuery({ name: 'brand', description: 'Brand medicine name', example: 'Dolo 650' })
  @ApiResponse({ status: 200, description: 'Brand vs generic price comparison' })
  compare(@Query('brand') brand: string) {
    return this.medicinesService.compareBrandVsGeneric(brand);
  }

  // -------------------------------------------------------
  // GET /medicines/categories
  // Public
  // -------------------------------------------------------
  @Get('categories')
  @ApiOperation({ summary: 'Get all medicine categories' })
  getCategories() {
    return this.medicinesService.getCategories();
  }

  // -------------------------------------------------------
  // GET /medicines/:id
  // Public
  // -------------------------------------------------------
  @Get(':id')
  @ApiOperation({ summary: 'Get full details of a medicine by ID' })
  @ApiParam({ name: 'id', description: 'Medicine ID (cuid)' })
  findOne(@Param('id') id: string) {
    return this.medicinesService.findOne(id);
  }

  // -------------------------------------------------------
  // POST /medicines   (Admin only)
  // -------------------------------------------------------
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: '[Admin] Add a new medicine to the catalogue' })
  @ApiResponse({ status: 201, description: 'Medicine created successfully' })
  create(@Body() dto: CreateMedicineDto) {
    return this.medicinesService.create(dto);
  }
}
