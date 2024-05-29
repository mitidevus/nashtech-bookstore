import {
  Controller,
  Get,
  Param,
  Query,
  Render,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { DEFAULT_PAGE_SIZE } from 'constants/app';
import { AuthExceptionFilter } from 'src/auth/filters';
import { AuthenticatedGuard } from 'src/auth/guard';
import { formatCurrency, toDateTime } from 'src/utils';
import { OrderPageOptionsDto } from './dto';
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
    dto.take = dto.take || DEFAULT_PAGE_SIZE;

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

    return {
      ...order,
      createdAt: toDateTime(order.createdAt),
      updatedAt: toDateTime(order.updatedAt),
      totalPrice: formatCurrency(order.totalPrice * 1000),
      items: order.items.map((item) => {
        return {
          ...item,
          price: formatCurrency(item.price * 1000),
          discountPrice:
            item.discountPrice > 0
              ? formatCurrency(item.discountPrice * 1000)
              : null,
          totalPrice: formatCurrency(item.totalPrice * 1000),
        };
      }),
    };
  }
}
