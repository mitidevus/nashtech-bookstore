import { InjectRedis } from '@nestjs-modules/ioredis';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Redis } from 'ioredis';
import { PrismaService } from 'src/prisma/prisma.service';
import { AddToCartDto, UpdateCartItemDto } from './dto';

@Injectable()
export class CartService {
  constructor(
    private readonly prismaService: PrismaService,
    @InjectRedis() private readonly redis: Redis,
  ) {}

  private getCartKey(userId: string): string {
    return `cart:${userId}`;
  }

  async addToCart(userId: string, dto: AddToCartDto) {
    const book = await this.prismaService.book.findUnique({
      where: {
        id: dto.bookId,
      },
    });

    if (!book) {
      throw new NotFoundException('Book not found');
    }

    try {
      const cartKey = this.getCartKey(userId);

      const currentQuantity = await this.redis.hget(
        cartKey,
        dto.bookId.toString(),
      );

      const newQuantity = (parseInt(currentQuantity, 10) || 0) + dto.quantity;

      await this.redis.hset(
        cartKey,
        dto.bookId.toString(),
        newQuantity.toString(),
      );

      return await this.getCart(userId);
    } catch (error) {
      console.log('Error:', error.message);
      throw new BadRequestException({
        message: 'Failed to add book to cart',
      });
    }
  }

  private async getCart(userId: string) {
    const cartKey = this.getCartKey(userId);

    const cart = await this.redis.hgetall(cartKey);

    return Object.entries(cart).map(([bookId, quantity]) => ({
      bookId: parseInt(bookId, 10),
      quantity: parseInt(quantity, 10),
    }));
  }

  async getCartDetail(userId: string) {
    const cart = await this.getCart(userId);

    const books = await this.prismaService.book.findMany({
      where: {
        id: {
          in: cart.map((item) => item.bookId),
        },
      },
    });

    return cart.map((item) => {
      const book = books.find((book) => book.id === item.bookId);

      return {
        book,
        quantity: item.quantity,
        totalPrice: (item.quantity * book.finalPrice).toFixed(2),
      };
    });
  }

  async updateCartItem(userId: string, dto: UpdateCartItemDto) {
    const book = await this.prismaService.book.findUnique({
      where: {
        id: dto.bookId,
      },
    });

    if (!book) {
      throw new NotFoundException('Book not found');
    }

    const cartKey = this.getCartKey(userId);

    const currentQuantity = await this.redis.hget(
      cartKey,
      dto.bookId.toString(),
    );

    if (!currentQuantity) {
      throw new NotFoundException('Book not found in cart');
    }

    try {
      const newQuantity = dto.quantity;

      await this.redis.hset(
        cartKey,
        dto.bookId.toString(),
        newQuantity.toString(),
      );

      return await this.getCartDetail(userId);
    } catch (error) {
      console.log('Error:', error.message);
      throw new BadRequestException({
        message: 'Failed to update cart item',
      });
    }
  }

  async removeFromCart(userId: string, bookId: number) {
    const book = await this.prismaService.book.findUnique({
      where: {
        id: bookId,
      },
    });

    if (!book) {
      throw new NotFoundException('Book not found');
    }

    const cartKey = this.getCartKey(userId);

    const currentQuantity = await this.redis.hget(cartKey, bookId.toString());

    if (!currentQuantity) {
      throw new NotFoundException('Book not found in cart');
    }

    try {
      await this.redis.hdel(cartKey, bookId.toString());

      return await this.getCartDetail(userId);
    } catch (error) {
      console.log('Error:', error.message);
      throw new BadRequestException({
        message: 'Failed to remove book from cart',
      });
    }
  }

  async clearCart(userId: string) {
    try {
      const cartKey = this.getCartKey(userId);

      await this.redis.del(cartKey);

      return [];
    } catch (error) {
      console.log('Error:', error.message);
      throw new BadRequestException({
        message: 'Failed to clear cart',
      });
    }
  }
}
