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

  @UseGuards(JwtGuard)
  @Post()
  async createOrder(
    @GetUser('sub') userId: string,
    @Body() dto: CreateOrderDto,
  ) {
    return this.orderService.createOrder(userId, dto);
  }

  @UseGuards(JwtGuard)
  @Get()
  async getOrders(
    @GetUser('sub') userId: string,
    @Query() dto: OrderPageOptionsDto,
  ) {
    return this.orderService.getUserOrders(userId, dto);
  }

  @UseGuards(JwtGuard)
  @Get(':id')
  async getOrderById(
    @GetUser('sub') userId: string,
    @Param('id') orderId: string,
  ) {
    return this.orderService.getUserOrderById(userId, orderId);
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.admin)
  @Patch(':id')
  async updateOrder(
    @Param('id') id: string,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    return this.orderService.updateOrder(id, dto);
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.admin)
  @Delete(':id')
  async deleteOrder(@Param('id') id: string) {
    return this.orderService.deleteOrder(id);
  }
}
