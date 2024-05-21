import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  CreateOrderDto,
  OrderPageOptionsDto,
  UpdateOrderStatusDto,
} from './dto';

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

  async getAllOrders(dto: OrderPageOptionsDto) {
    const conditions = {
      orderBy: [
        {
          createdAt: dto.order,
        },
      ],
    };

    const pageOption =
      dto.page && dto.take
        ? {
            skip: dto.skip,
            take: dto.take,
          }
        : undefined;

    const [orders, totalCount] = await Promise.all([
      this.prismaService.order.findMany({
        ...conditions,
        ...pageOption,
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      }),
      this.prismaService.order.count({
        ...conditions,
      }),
    ]);

    return {
      data: orders,
      totalPages: dto.take ? Math.ceil(totalCount / dto.take) : 1,
      totalCount,
    };
  }

  async getOrderById(id: string) {
    const order = await this.prismaService.order.findUnique({
      where: {
        id,
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
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    if (!order) {
      throw new BadRequestException({
        message: 'Order not found',
      });
    }

    return order;
  }

  async updateOrder(id: string, dto: UpdateOrderStatusDto) {
    const order = await this.prismaService.order.findUnique({
      where: {
        id,
      },
    });

    if (!order) {
      throw new BadRequestException({
        message: 'Order not found',
      });
    }

    return await this.prismaService.order.update({
      where: {
        id,
      },
      data: {
        status: dto.status,
      },
    });
  }

  async deleteOrder(id: string) {
    const order = await this.prismaService.order.findUnique({
      where: {
        id,
      },
    });

    if (!order) {
      throw new BadRequestException({
        message: 'Order not found',
      });
    }

    try {
      await this.prismaService.order.delete({
        where: {
          id,
        },
      });

      return {
        message: 'Deleted order successfully',
      };
    } catch (error) {
      console.log('Error:', error.message);
      throw new BadRequestException({
        message: 'Failed to delete order',
      });
    }
  }
}
