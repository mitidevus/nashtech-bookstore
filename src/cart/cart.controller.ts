import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { GetUser } from 'src/auth/decorator';
import { JwtGuard } from 'src/auth/guard';
import { CartService } from './cart.service';
import { AddToCartDto, CheckoutDto, UpdateCartItemDto } from './dto';

@Controller('/api/cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @UseGuards(JwtGuard)
  @Post()
  async addToCart(@GetUser('sub') userId: string, @Body() dto: AddToCartDto) {
    return await this.cartService.addToCart(userId, dto);
  }

  @UseGuards(JwtGuard)
  @Get()
  async getCartDetail(@GetUser('sub') userId: string) {
    return await this.cartService.getCartDetail(userId);
  }

  @UseGuards(JwtGuard)
  @Patch()
  async updateCartItem(
    @GetUser('sub') userId: string,
    @Body() dto: UpdateCartItemDto,
  ) {
    return await this.cartService.updateCartItem(userId, dto);
  }

  @UseGuards(JwtGuard)
  @Delete(':bookId')
  async removeFromCart(
    @GetUser('sub') userId: string,
    @Param('bookId', ParseIntPipe) bookId: number,
  ) {
    return await this.cartService.removeFromCart(userId, bookId);
  }

  @UseGuards(JwtGuard)
  @Delete()
  async clearCart(@GetUser('sub') userId: string) {
    return await this.cartService.clearCart(userId);
  }

  @UseGuards(JwtGuard)
  @Post('/checkout')
  async checkout(@GetUser('sub') userId: string, @Body() dto: CheckoutDto) {
    return await this.cartService.checkout(userId, dto);
  }
}
