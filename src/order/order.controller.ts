import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { GetUser, Roles } from 'src/auth/decorator';
import { JwtGuard, RolesGuard } from 'src/auth/guard';
import {
  CreateOrderDto,
  OrderPageOptionsDto,
  UpdateOrderStatusDto,
} from './dto';
import { OrderService } from './order.service';

@Controller('/api/orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.admin)
  @Post()
  async createOrder(
    @GetUser('sub') userId: string,
    @Body() dto: CreateOrderDto,
  ) {
    return await this.orderService.createOrder(userId, dto);
  }

  @UseGuards(JwtGuard)
  @Get()
  async getOrders(
    @GetUser('sub') userId: string,
    @Query() dto: OrderPageOptionsDto,
  ) {
    return await this.orderService.getUserOrders(userId, dto);
  }

  @UseGuards(JwtGuard)
  @Get(':id')
  async getOrderById(
    @GetUser('sub') userId: string,
    @Param('id') orderId: string,
  ) {
    return await this.orderService.getUserOrderById(userId, orderId);
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.admin)
  @Patch(':id')
  async updateOrderStatus(
    @Param('id') id: string,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    return await this.orderService.updateOrderStatus(id, dto);
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.admin)
  @Delete(':id')
  async deleteOrder(@Param('id') id: string) {
    return await this.orderService.deleteOrder(id);
  }

  @UseGuards(JwtGuard)
  @Patch(':id/cancel')
  async cancelOrder(@GetUser('sub') userId: string, @Param('id') id: string) {
    return await this.orderService.cancelOrder(userId, id);
  }
}
