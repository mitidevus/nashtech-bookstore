import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserPageOptionsDto } from './dto';

@Injectable()
export class UserService {
  constructor(private readonly prismaService: PrismaService) {}

  async getUsers(dto: UserPageOptionsDto) {
    const conditions = {
      where: {
        role: dto?.role,
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

    const [users, totalCount] = await Promise.all([
      this.prismaService.user.findMany({
        ...conditions,
        ...pageOption,
      }),
      this.prismaService.user.count({
        ...conditions,
      }),
    ]);

    return {
      data: users,
      totalPages: dto.take ? Math.ceil(totalCount / dto.take) : 1,
      totalCount,
    };
  }

  async getUserById(id: string) {
    const user = await this.prismaService.user.findUnique({
      where: {
        id,
      },
      include: {
        orders: true,
        ratingReviews: {
          include: {
            book: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException({
        message: 'User not found',
      });
    }

    return user;
  }
}
