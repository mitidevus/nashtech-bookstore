import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  Render,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { AuthExceptionFilter } from 'src/auth/filters';
import { AuthenticatedGuard } from 'src/auth/guard';
import { DEFAULT_ORDER_PAGE_SIZE } from 'src/constants/app';
import { formatCurrency, getNextStatuses, toDateTime } from 'src/utils';
import { OrderPageOptionsDto, UpdateOrderStatusDto } from './dto';
import { OrderService } from './order.service';

@Controller('/orders')
@UseFilters(AuthExceptionFilter)
export class OrderViewController {
  constructor(private readonly orderService: OrderService) {}

  @UseGuards(AuthenticatedGuard)
  @Get()
  @Render('orders/list')
  async getOrdersPage(@Query() dto: OrderPageOptionsDto) {
    dto.page = dto.page || 1;
    dto.take = dto.take || DEFAULT_ORDER_PAGE_SIZE;

    const res = await this.orderService.getOrders(dto);

    const result = {
      ...res,
      data: res.data.map((order) => {
        return {
          ...order,
          createdAt: toDateTime(order.createdAt),
          updatedAt: toDateTime(order.updatedAt),
          totalPrice: formatCurrency(order.totalPrice * 1000),
        };
      }),
    };

    return {
      ...result,
      currentPage: dto.page,
    };
  }

  @UseGuards(AuthenticatedGuard)
  @Get(':id')
  @Render('orders/detail')
  async getOrderDetailPage(@Param('id') id: string) {
    const order = await this.orderService.getOrderById(id);

    const nextStatuses = getNextStatuses(order.status);

    return {
      ...order,
      createdAt: toDateTime(order.createdAt),
      updatedAt: toDateTime(order.updatedAt),
      totalPrice: formatCurrency(order.totalPrice * 1000),
      items: order.items.map((item) => {
        return {
          ...item,
          price: formatCurrency(item.price * 1000),
          finalPrice: formatCurrency(item.finalPrice * 1000),
          totalPrice: formatCurrency(item.totalPrice * 1000),
        };
      }),
      nextStatuses,
    };
  }

  @UseGuards(AuthenticatedGuard)
  @Patch(':id')
  async updateOrderStatus(
    @Param('id') id: string,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    return await this.orderService.updateOrderStatus(id, dto);
  }
}
