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
      select: {
        id: true,
        slug: true,
        name: true,
        image: true,
        price: true,
        finalPrice: true,
        discountPercentage: true,
      },
    });

    const bookMap = new Map(books.map((book) => [book.id, book]));

    // return totalPrice of item, totalPrice of cart, totalQuantity of cart
    const cartDetail = cart.map((item) => {
      const book = bookMap.get(item.bookId);

      return {
        bookId: item.bookId,
        quantity: item.quantity,
        book,
        totalPrice: book.finalPrice * item.quantity,
      };
    });

    const totalPrice = parseFloat(
      cartDetail.reduce((sum, item) => sum + item.totalPrice, 0).toFixed(2),
    );

    return {
      items: cartDetail.map((item) => ({
        ...item,
        totalPrice: parseFloat(item.totalPrice.toFixed(2)),
      })),
      totalPrice,
      totalQuantity: cart.length,
    };
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

      return {
        items: [],
        totalPrice: 0,
        totalQuantity: 0,
      };
    } catch (error) {
      console.log('Error:', error.message);
      throw new BadRequestException({
        message: 'Failed to clear cart',
      });
    }
  }
}
