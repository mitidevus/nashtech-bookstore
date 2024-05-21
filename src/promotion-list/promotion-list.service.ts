import { BadRequestException, Injectable } from '@nestjs/common';
import slugify from 'slugify';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  AddBookToPromoListDto,
  CreatePromotionListDto,
  PromotionListPageOptionsDto,
  UpdatePromotionListDto,
} from './dto';

@Injectable()
export class PromotionListService {
  constructor(private readonly prismaService: PrismaService) {}

  async createPromotionList(dto: CreatePromotionListDto) {
    const promotionListExist = await this.prismaService.promotionList.findFirst(
      {
        where: {
          name: dto.name,
        },
      },
    );

    if (promotionListExist) {
      throw new BadRequestException({
        message: 'Promotion list already exists',
      });
    }

    try {
      const promotionList = await this.prismaService.promotionList.create({
        data: {
          ...dto,
          slug: slugify(dto.name, {
            lower: true,
          }),
        },
        include: {
          books: true,
        },
      });

      return promotionList;
    } catch (error) {
      console.log('Error:', error.message);
      throw new BadRequestException({
        message: 'Failed to create promotion list',
      });
    }
  }

  async getPromotionLists(dto: PromotionListPageOptionsDto) {
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

    const [promotionLists, totalCount] = await Promise.all([
      this.prismaService.promotionList.findMany({
        ...conditions,
        ...pageOption,
      }),
      this.prismaService.promotionList.count({
        ...conditions,
      }),
    ]);

    return {
      data: promotionLists,
      totalPages: dto.take ? Math.ceil(totalCount / dto.take) : 1,
      totalCount,
    };
  }

  async getPromotionList(id: number) {
    const promotionList = await this.prismaService.promotionList.findUnique({
      where: {
        id,
      },
      include: {
        books: true,
      },
    });

    if (!promotionList) {
      throw new BadRequestException({
        message: 'Promotion list not found',
      });
    }

    return promotionList;
  }

  async updatePromotionList(id: number, dto: UpdatePromotionListDto) {
    const promotionList = await this.prismaService.promotionList.findUnique({
      where: {
        id,
      },
    });

    if (!promotionList) {
      throw new BadRequestException({
        message: 'Promotion list not found',
      });
    }

    const promotionListExist = await this.prismaService.promotionList.findFirst(
      {
        where: {
          name: dto.name,
        },
      },
    );

    if (promotionListExist) {
      throw new BadRequestException({
        message: 'Promotion list already exists',
      });
    }

    try {
      const promotionList = await this.prismaService.promotionList.update({
        where: {
          id,
        },
        data: {
          ...dto,
          slug: slugify(dto.name, {
            lower: true,
          }),
        },
        include: {
          books: true,
        },
      });

      return promotionList;
    } catch (error) {
      console.log('Error:', error.message);
      throw new BadRequestException({
        message: 'Failed to update promotion list',
      });
    }
  }

  async deletePromotionList(id: number) {
    const promotionList = await this.prismaService.promotionList.findUnique({
      where: {
        id,
      },
    });

    if (!promotionList) {
      throw new BadRequestException({
        message: 'Promotion list not found',
      });
    }

    try {
      await this.prismaService.$transaction([
        this.prismaService.book.updateMany({
          where: {
            promotionListId: id,
          },
          data: {
            promotionListId: null,
            discountPrice: 0,
            discountPercentage: 0,
          },
        }),
        this.prismaService.promotionList.delete({
          where: {
            id,
          },
        }),
      ]);

      return {
        message: 'Deleted promotion list successfully',
      };
    } catch (error) {
      console.log('Error:', error.message);
      throw new BadRequestException({
        message: 'Failed to delete promotion list',
      });
    }
  }

  async addBookToPromoList(id: number, dto: AddBookToPromoListDto) {
    if (!Number.isInteger(dto.discountPercentage)) {
      throw new BadRequestException({
        message: 'Discount percentage must be an integer',
      });
    }

    const promotionList = await this.prismaService.promotionList.findUnique({
      where: {
        id,
      },
    });

    if (!promotionList) {
      throw new BadRequestException({
        message: 'Promotion list not found',
      });
    }

    const book = await this.prismaService.book.findUnique({
      where: {
        id: dto.bookId,
      },
    });

    if (!book) {
      throw new BadRequestException({
        message: 'Book not found',
      });
    }

    if (book.promotionListId) {
      throw new BadRequestException({
        message: 'Book already in promotion list',
      });
    }

    try {
      await this.prismaService.book.update({
        where: {
          id: dto.bookId,
        },
        data: {
          promotionListId: id,
          discountPercentage: dto.discountPercentage,
          discountPrice:
            Math.round(
              (book.price - (book.price * dto.discountPercentage) / 100) * 1000,
            ) / 1000,
        },
      });

      return {
        message: 'Added book to promotion list successfully',
      };
    } catch (error) {
      console.log('Error:', error.message);
      throw new BadRequestException({
        message: 'Failed to add book to promotion list',
      });
    }
  }
}
