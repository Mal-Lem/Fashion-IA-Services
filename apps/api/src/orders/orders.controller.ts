import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards, Req, HttpCode, HttpStatus } from '@nestjs/common';
import { Request } from 'express';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto, UpdateOrderStatusDto } from './dto/order.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('orders')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard)
@Controller('orders')
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  @ApiOperation({ summary: 'Creer une demande de realisation' })
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Req() req: Request, @Body() dto: CreateOrderDto) {
    return this.ordersService.create(req.user['id'], dto);
  }

  @ApiOperation({ summary: 'Mes commandes' })
  @Get()
  async findAll(
    @Req() req: Request,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    return this.ordersService.findAll(req.user['id'], req.user['role'], +page, +limit);
  }

  @ApiOperation({ summary: "Detail d'une commande" })
  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: Request) {
    return this.ordersService.findOne(id, req.user['id']);
  }

  @ApiOperation({ summary: "Changer le statut d'une commande" })
  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Req() req: Request,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    return this.ordersService.updateStatus(id, req.user['id'], dto);
  }
}