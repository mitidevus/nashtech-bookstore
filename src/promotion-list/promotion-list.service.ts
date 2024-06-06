import { BadRequestException, Injectable } from '@nestjs/common';
import slugify from 'slugify';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  AddBooksToPromoListDto,
  CreatePromotionListDto,
  PromotionListPageOptionsDto,
  UpdatePromotionListDto,
} from './dto';

@Injectable()
export class PromotionListService {
  constructor(private readonly prismaService: PrismaService) {}

  async createPromotionList(dto: CreatePromotionListDto) {
    if (!Number.isInteger(dto.discountPercentage)) {
      throw new BadRequestException({
        message: 'Discount percentage must be an integer',
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
      const promotionList = await this.prismaService.promotionList.create({
        data: {
          ...dto,
          slug: slugify(dto.name, {
            lower: true,
            locale: 'vi',
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

  async getAllPromotionLists() {
    return await this.prismaService.promotionList.findMany();
  }

  async getPromotionListById(id: number) {
    const promotionList = await this.prismaService.promotionList.findUnique({
      where: {
        id,
      },
      include: {
        books: {
          select: {
            id: true,
            name: true,
            image: true,
            discountDate: true,
          },
        },
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
      include: {
        books: {
          select: {
            id: true,
            price: true,
          },
        },
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

    if (promotionListExist && promotionListExist.id !== id) {
      throw new BadRequestException({
        message: 'Promotion list already exists',
      });
    }

    try {
      let updateBookPromises = [];
      if (
        dto.discountPercentage &&
        dto.discountPercentage !== promotionList.discountPercentage
      ) {
        updateBookPromises = promotionList.books.map((book) => {
          return this.prismaService.book.update({
            where: {
              id: book.id,
            },
            data: {
              finalPrice:
                book.price - (book.price * dto.discountPercentage) / 100,
              discountPercentage: dto.discountPercentage,
            },
          });
        });
      }

      const updatedPromotionList = await this.prismaService.$transaction([
        ...updateBookPromises,
        this.prismaService.promotionList.update({
          where: {
            id,
          },
          data: {
            ...dto,
            slug: slugify(dto.name, {
              lower: true,
              locale: 'vi',
            }),
          },
        }),
      ]);

      return updatedPromotionList;
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
      const booksToUpdate = await this.prismaService.book.findMany({
        where: {
          promotionListId: id,
        },
      });

      const updateBookPromises = booksToUpdate.map((book) => {
        return this.prismaService.book.update({
          where: {
            id: book.id,
          },
          data: {
            promotionListId: null,
            finalPrice: book.price,
            discountDate: null,
          },
        });
      });

      await this.prismaService.$transaction([
        ...updateBookPromises,
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

  async addBooksToPromoList(promoId: number, dto: AddBooksToPromoListDto) {
    const promotionList = await this.prismaService.promotionList.findUnique({
      where: {
        id: promoId,
      },
    });

    if (!promotionList) {
      throw new BadRequestException({
        message: 'Promotion list not found',
      });
    }

    const books = await this.prismaService.book.findMany({
      where: {
        id: {
          in: dto.bookIds,
        },
      },
    });

    if (books.length !== dto.bookIds.length) {
      throw new BadRequestException('Invalid book');
    }

    const bookInPromoList = books.find((book) => book.promotionListId);

    if (bookInPromoList) {
      throw new BadRequestException({
        message: 'There are some books already in promotion list',
      });
    }

    try {
      const updateBookPromises = books.map((book) => {
        return this.prismaService.book.update({
          where: {
            id: book.id,
          },
          data: {
            promotionListId: promoId,
            finalPrice:
              book.price -
              (book.price * promotionList.discountPercentage) / 100,
            discountPercentage: promotionList.discountPercentage,
            discountDate: new Date(),
          },
        });
      });

      await this.prismaService.$transaction(updateBookPromises);

      return {
        message: 'Added books to promotion list successfully',
      };
    } catch (error) {
      console.log('Error:', error.message);
      throw new BadRequestException({
        message: 'Failed to add books to promotion list',
      });
    }
  }

  async removeBookFromPromoList(promoId: number, bookId: number) {
    const promotionList = await this.prismaService.promotionList.findUnique({
      where: {
        id: promoId,
      },
    });

    if (!promotionList) {
      throw new BadRequestException({
        message: 'Promotion list not found',
      });
    }

    const book = await this.prismaService.book.findUnique({
      where: {
        id: bookId,
      },
    });

    if (!book) {
      throw new BadRequestException({
        message: 'Book not found',
      });
    }

    if (!book.promotionListId) {
      throw new BadRequestException({
        message: 'Book not in any promotion list',
      });
    }

    if (book.promotionListId !== promoId) {
      throw new BadRequestException({
        message: 'Book not in promotion list',
      });
    }

    try {
      await this.prismaService.book.update({
        where: {
          id: bookId,
        },
        data: {
          promotionListId: null,
          finalPrice: book.price,
          discountPercentage: 0,
          discountDate: null,
        },
      });

      return {
        message: 'Removed book from promotion list successfully',
      };
    } catch (error) {
      console.log('Error:', error.message);
      throw new BadRequestException({
        message: 'Failed to remove book from promotion list',
      });
    }
  }
}
