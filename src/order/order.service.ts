import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OrderStatus } from '@prisma/client';
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
      throw new NotFoundException({
        message: 'Some books are not found',
      });
    }

    const bookPriceMap = new Map(
      books.map((book) => [
        book.id,
        {
          price: book.price,
          finalPrice: book.finalPrice,
        },
      ]),
    );

    try {
      return await this.prismaService.$transaction(async (tx) => {
        const order = await tx.order.create({
          data: {
            userId,
            fullName: dto.fullName,
            phone: dto.phone,
            shippingAddress: dto.shippingAddress,
            paymentMethod: dto.paymentMethod,
          },
        });

        const orderItems = dto.items.map((item) => {
          const { price, finalPrice } = bookPriceMap.get(item.bookId);
          const totalPrice = finalPrice * item.quantity;

          return {
            orderId: order.id,
            bookId: item.bookId,
            quantity: item.quantity,
            price,
            finalPrice,
            totalPrice,
          };
        });

        await tx.orderItem.createMany({
          data: orderItems,
        });

        // Update total price of the order
        const totalPrice = orderItems.reduce(
          (sum, item) => sum + item.totalPrice,
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
                  },
                },
                price: true,
                finalPrice: true,
                totalPrice: true,
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

  async getUserOrders(userId: string, dto: OrderPageOptionsDto) {
    const conditions = {
      where: {
        userId,
      },
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

  async getOrders(dto: OrderPageOptionsDto) {
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

  async getUserOrderById(userId: string, orderId: string) {
    const order = await this.prismaService.order.findUnique({
      where: {
        id: orderId,
      },
      include: {
        items: {
          select: {
            book: {
              select: {
                id: true,
                name: true,
                slug: true,
                image: true,
              },
            },
            price: true,
            finalPrice: true,
            totalPrice: true,
            quantity: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException({
        message: 'Order not found',
      });
    }

    if (order.userId !== userId) {
      throw new ForbiddenException({
        message: 'You do not have permission to view this order',
      });
    }

    return order;
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
                id: true,
                name: true,
                slug: true,
                image: true,
              },
            },
            price: true,
            finalPrice: true,
            totalPrice: true,
            quantity: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException({
        message: 'Order not found',
      });
    }

    return order;
  }

  async updateOrderStatus(id: string, dto: UpdateOrderStatusDto) {
    const order = await this.prismaService.order.findUnique({
      where: {
        id,
      },
    });

    if (!order) {
      throw new NotFoundException({
        message: 'Order not found',
      });
    }

    try {
      const order = await this.prismaService.$transaction(async (tx) => {
        const order = await tx.order.update({
          where: {
            id,
          },
          data: {
            status: dto.status,
          },
        });

        if (order.status === OrderStatus.completed) {
          const orderItems = await tx.orderItem.findMany({
            where: {
              orderId: order.id,
            },
            select: {
              bookId: true,
              quantity: true,
            },
          });

          for (const item of orderItems) {
            await tx.book.update({
              where: {
                id: item.bookId,
              },
              data: {
                soldQuantity: {
                  increment: item.quantity,
                },
              },
            });
          }
        }

        return order;
      });

      return order;
    } catch (error) {
      console.log('Error:', error.message);
      throw new BadRequestException({
        message: 'Failed to update order status',
      });
    }
  }

  async deleteOrder(id: string) {
    const order = await this.prismaService.order.findUnique({
      where: {
        id,
      },
    });

    if (!order) {
      throw new NotFoundException({
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

  async cancelOrder(userId: string, id: string) {
    const order = await this.prismaService.order.findUnique({
      where: {
        id,
      },
    });

    if (!order) {
      throw new NotFoundException({
        message: 'Order not found',
      });
    }

    if (order.userId !== userId) {
      throw new ForbiddenException({
        message: 'You do not have permission to cancel this order',
      });
    }

    if (order.status !== OrderStatus.pending) {
      throw new BadRequestException({
        message: 'Order cannot be cancelled',
      });
    }

    try {
      await this.prismaService.order.update({
        where: {
          id,
        },
        data: {
          status: OrderStatus.cancelled,
        },
      });

      return {
        message: 'Cancelled order successfully',
      };
    } catch (error) {
      console.log('Error:', error.message);
      throw new BadRequestException({
        message: 'Failed to cancel order',
      });
    }
  }
}
