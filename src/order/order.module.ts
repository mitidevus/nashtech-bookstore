import { Module } from '@nestjs/common';
import { OrderViewController } from './order-view.controller';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';

@Module({
  providers: [OrderService],
  controllers: [OrderController, OrderViewController],
})
export class OrderModule {}
