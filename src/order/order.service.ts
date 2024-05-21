import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateOrderDto } from './dto';

@Injectable()
export class OrderService {
  constructor(private readonly prismaService: PrismaService) {}

  async createOrder(userId: string, dto: CreateOrderDto) {
    const bookIds = dto.items.map((item) => item.bookId);
    const books = await this.prismaService.book.findMany({
      where: {
        id: {
          in: bookIds,
        },
      },
    });

    if (books.length !== dto.items.length) {
      throw new BadRequestException({
        message: 'Some books are not found',
      });
    }

    const bookPriceMap = new Map(books.map((book) => [book.id, book.price]));

    try {
      return await this.prismaService.$transaction(async (tx) => {
        const order = await tx.order.create({
          data: {
            userId,
          },
        });

        const orderItems = dto.items.map((item) => ({
          orderId: order.id,
          bookId: item.bookId,
          quantity: item.quantity,
          price: bookPriceMap.get(item.bookId) * item.quantity,
        }));

        await tx.orderItem.createMany({
          data: orderItems,
        });

        // Update total price of the order
        const totalPrice = orderItems.reduce(
          (sum, item) => sum + item.price,
          0,
        );

        const updatedOrder = await tx.order.update({
          where: {
            id: order.id,
          },
          data: {
            totalPrice,
          },
          include: {
            items: {
              select: {
                book: {
                  select: {
                    name: true,
                    slug: true,
                    image: true,
                    price: true,
                  },
                },
                price: true,
                quantity: true,
              },
            },
          },
        });

        return updatedOrder;
      });
    } catch (error) {
      console.log('Error:', error.message);
      throw new BadRequestException({
        message: 'Failed to create order',
      });
    }
  }
}
