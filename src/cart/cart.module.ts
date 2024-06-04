import { Module } from '@nestjs/common';
import { OrderService } from 'src/order/order.service';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';

@Module({
  controllers: [CartController],
  providers: [CartService, OrderService],
})
export class CartModule {}
